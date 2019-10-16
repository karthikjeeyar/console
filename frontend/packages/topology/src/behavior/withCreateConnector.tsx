import * as React from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { hullPath } from '@console/dev-console/src/utils/svg-utils';
import DefaultCreateConnectorWidget from '../widgets/DefaultCreateConnectorWidget';
import Point from '../geom/Point';
import Layer from '../layers/Layer';
import ContextMenu, { ContextMenuItem } from '../contextmenu/ContextMenu';
import { NodeEntity, isNodeEntity } from '../types';
import { DragSourceSpec, DragSourceMonitor, DragEvent } from './dnd-types';
import { useDndDrag } from './useDndDrag';

export type ConnectorChoice = {
  label: string;
};

type CreateConnectorWidgetProps = {
  entity: NodeEntity;
  onKeepAlive: (isAlive: boolean) => void;
  onCreate: (
    entity: NodeEntity,
    target: NodeEntity,
    event: DragEvent,
    choice?: ConnectorChoice,
  ) => ConnectorChoice[] | void | undefined | null;
  renderConnector: ConnectorRenderer;
};

type CollectProps = {
  event?: DragEvent;
  dragging: boolean;
};

type PromptData = {
  entity: NodeEntity;
  target: NodeEntity;
  event: DragEvent;
  choices: ConnectorChoice[];
};

export const CREATE_CONNECTOR_DROP_TYPE = '#createConnector#"';

const X_OFFSET = 30;
const Y_OFFSET = -Math.tan(12) * 30;

const CreateConnectorWidget: React.FC<CreateConnectorWidgetProps> = observer((props) => {
  const { entity, onKeepAlive, onCreate, renderConnector } = props;
  const [prompt, setPrompt] = React.useState<PromptData | null>(null);
  const [active, setActive] = React.useState(false);

  const spec = React.useMemo(() => {
    const dragSourceSpec: DragSourceSpec<any, any, CollectProps> = {
      item: { type: CREATE_CONNECTOR_DROP_TYPE },
      begin: action((monitor: DragSourceMonitor, dragProps: CreateConnectorWidgetProps) => {
        setActive(true);
        dragProps.entity.raise();
        return dragProps.entity;
      }),
      end: (
        dropResult: NodeEntity,
        monitor: DragSourceMonitor,
        dragProps: CreateConnectorWidgetProps,
      ) => {
        const event = monitor.getDragEvent();
        if (isNodeEntity(dropResult) && event) {
          const choices = dragProps.onCreate(dragProps.entity, dropResult, event);
          if (choices && choices.length) {
            setPrompt({ entity: dragProps.entity, target: dropResult, event, choices });
            return;
          }
        }
        setActive(false);
        dragProps.onKeepAlive(false);
      },
      collect: (monitor) => ({
        dragging: !!monitor.getItem(),
        event: monitor.isDragging() ? monitor.getDragEvent() : undefined,
      }),
    };
    return dragSourceSpec;
  }, [setActive]);
  const [{ dragging, event }, dragRef] = useDndDrag(spec, props);

  if (!active && dragging && !event) {
    // another connector is dragging right now
    return null;
  }

  const dragEvent = prompt ? prompt.event : event;

  let endPoint: Point;
  if (dragEvent) {
    endPoint = new Point(dragEvent.x, dragEvent.y);
  } else {
    const bounds = entity.getBounds();
    endPoint = new Point(bounds.right() + X_OFFSET, Y_OFFSET + bounds.y + bounds.height / 2);
  }
  const startPoint = entity.getAnchor().getLocation(endPoint);

  // bring into the coordinate space of the entity
  entity.translateFromParent(startPoint);
  entity.translateFromParent(endPoint);

  return (
    <>
      <Layer id="top">
        <g
          ref={dragRef}
          onMouseEnter={!active ? () => onKeepAlive(true) : undefined}
          onMouseLeave={!active ? () => onKeepAlive(false) : undefined}
          style={{ cursor: !dragging ? 'pointer' : undefined }}
        >
          {renderConnector(startPoint, endPoint)}
          {!active && (
            <path
              d={hullPath([[startPoint.x, startPoint.y], [endPoint.x, endPoint.y]], 7)}
              fillOpacity="0"
            />
          )}
        </g>
      </Layer>
      {prompt && (
        <ContextMenu
          reference={{ x: prompt.event.pageX, y: prompt.event.pageY }}
          open
          onRequestClose={() => {
            setActive(false);
            onKeepAlive(false);
          }}
        >
          {prompt.choices.map((c) => (
            <ContextMenuItem
              key={c.label}
              onClick={() => {
                onCreate(prompt.entity, prompt.target, prompt.event, c);
              }}
            >
              {c.label}
            </ContextMenuItem>
          ))}
        </ContextMenu>
      )}
    </>
  );
});

type EntityProps = {
  entity: NodeEntity;
};

export type WithCreateConnectorProps = {
  onShowCreateConnector: () => void;
  onHideCreateConnector: () => void;
};

type ConnectorRenderer = (startPoint: Point, endPoint: Point) => React.ReactElement;

const defaultRenderConnector: ConnectorRenderer = (startPoint: Point, endPoint: Point) => (
  <DefaultCreateConnectorWidget startPoint={startPoint} endPoint={endPoint} />
);

export const withCreateConnector = <P extends WithCreateConnectorProps & EntityProps>(
  onCreate: React.ComponentProps<typeof CreateConnectorWidget>['onCreate'],
  renderConnector: ConnectorRenderer = defaultRenderConnector,
) => (WrappedComponent: React.ComponentType<P>) => {
  const Component: React.FC<Omit<P, keyof WithCreateConnectorProps>> = (props) => {
    const [show, setShow] = React.useState(false);
    const [alive, setKeepAlive] = React.useState(false);
    const onShowCreateConnector = React.useCallback(() => setShow(true), []);
    const onHideCreateConnector = React.useCallback(() => setShow(false), []);
    const onKeepAlive = React.useCallback((isAlive: boolean) => setKeepAlive(isAlive), [
      setKeepAlive,
    ]);
    return (
      <>
        <WrappedComponent
          {...props as any}
          onShowCreateConnector={onShowCreateConnector}
          onHideCreateConnector={onHideCreateConnector}
        />
        {(show || alive) && (
          <CreateConnectorWidget
            entity={props.entity}
            onCreate={onCreate}
            onKeepAlive={onKeepAlive}
            renderConnector={renderConnector}
          />
        )}
      </>
    );
  };
  return observer(Component);
};
