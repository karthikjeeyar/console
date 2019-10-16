import * as React from 'react';
import { action } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind, EdgeEntity, NodeEntity, AnchorEnd } from '../src/types';
import { withTargetDrag, withSourceDrag } from '../src/behavior/useReconnect';
import { DragSourceMonitor, DragEvent } from '../src/behavior/dnd-types';
import { withDndDrop } from '../src/behavior/useDndDrop';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import {
  withCreateConnector,
  CREATE_CONNECTOR_DROP_TYPE,
  ConnectorChoice,
} from '../src/behavior/withCreateConnector';
import { useSvgAnchor } from '../src/behavior/useSvgAnchor';
import { withDragNode, WithDragNodeProps } from '../src/behavior/useDragNode';
import Layer from '../src/layers/Layer';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import EdgeWidget from './widgets/EdgeWidget';
import NodeWidget from './widgets/NodeWidget';
import NodeRectWidget from './widgets/NodeRectWidget';

export default {
  title: 'Connector',
};

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

export const reconnect = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDndDrop<
        any,
        any,
        { droppable?: boolean; hover?: boolean; canDrop?: boolean },
        NodeEntityProps
      >({
        accept: 'test',
        canDrop: (item, monitor, props) => {
          return !props || (item.getSource() !== props.entity && item.getTarget() !== props.entity);
        },
        collect: (monitor) => ({
          droppable: monitor.isDragging(),
          hover: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      })(NodeWidget);
    }
    if (entity.kind === ModelKind.edge) {
      return withSourceDrag<any, NodeEntity, any, EdgeEntityProps>({
        item: { type: 'test' },
        begin: action((monitor: DragSourceMonitor, props: EdgeEntityProps) => {
          props.entity.raise();
          return props.entity;
        }),
        drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
          props.entity.setStartPoint(event.x, event.y);
        }),
        end: action(
          (dropResult: NodeEntity, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
            if (monitor.didDrop() && dropResult && props) {
              props.entity.setSource(dropResult);
            }
            props.entity.setStartPoint();
          },
        ),
      })(
        withTargetDrag<any, NodeEntity, { dragging?: boolean }, EdgeEntityProps>({
          item: { type: 'test' },
          begin: action((monitor: DragSourceMonitor, props: EdgeEntityProps) => {
            props.entity.raise();
            return props.entity;
          }),
          drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
            props.entity.setEndPoint(event.x, event.y);
          }),
          end: action(
            (dropResult: NodeEntity, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
              if (monitor.didDrop() && dropResult && props) {
                props.entity.setTarget(dropResult);
              }
              props.entity.setEndPoint();
            },
          ),
          collect: (monitor) => ({
            dragging: monitor.isDragging(),
          }),
        })(EdgeWidget),
      );
    }
    return undefined;
  });
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2', 'n3', 'e1', 'e2'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 20,
        y: 150,
        width: 20,
        height: 20,
      },
      {
        id: 'n2',
        type: 'node',
        x: 200,
        y: 50,
        width: 100,
        height: 30,
      },
      {
        id: 'n3',
        type: 'node',
        x: 200,
        y: 300,
        width: 30,
        height: 30,
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge',
        source: 'n1',
        target: 'n2',
        bendpoints: [[50, 30], [110, 10]],
      },
      {
        id: 'e2',
        type: 'edge',
        source: 'n1',
        target: 'n3',
      },
    ],
  };
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};

type ColorChoice = ConnectorChoice & {
  color: string;
};

export const createConnector = () => {
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2', 'n3'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 20,
        y: 150,
        width: 104,
        height: 104,
      },
      {
        id: 'n2',
        type: 'node',
        x: 200,
        y: 50,
        width: 100,
        height: 30,
      },
      {
        id: 'n3',
        type: 'node',
        x: 200,
        y: 300,
        width: 30,
        height: 30,
      },
    ],
  };

  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withCreateConnector(
        (
          source: NodeEntity,
          target: NodeEntity,
          event: DragEvent,
          choice: ColorChoice | undefined,
        ): any[] | null => {
          if (!choice) {
            return [
              { label: 'Create Annotation', color: 'red' },
              { label: 'Create Binding', color: 'green' },
            ];
          }

          const id = `e${vis
            .getController()
            .getGraph()
            .getEdges().length + 1}`;
          if (!model.edges) {
            model.edges = [];
          }
          model.edges.push({
            id,
            type: 'edge',
            source: source.getId(),
            target: target.getId(),
            data: {
              color: choice.color,
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          model.graph!.children!.push(id);
          vis.fromModel(model);
          return null;
        },
      )(
        withDndDrop<
          any,
          any,
          { droppable?: boolean; hover?: boolean; canDrop?: boolean },
          NodeEntityProps
        >({
          accept: CREATE_CONNECTOR_DROP_TYPE,
          canDrop: (item, monitor, props) => {
            return !props || item !== props.entity;
          },
          collect: (monitor) => ({
            droppable: monitor.isDragging(),
            hover: monitor.isOver(),
            canDrop: monitor.canDrop(),
          }),
        })(NodeWidget),
      );
    }
    return undefined;
  });
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};

export const anchors = () => {
  const NodeWithPointAnchor: React.FC<{ entity: NodeEntity } & WithDragNodeProps> = (props) => {
    const nodeRef = useSvgAnchor();
    const targetRef = useSvgAnchor(AnchorEnd.target, 'edge-point');
    const bounds = props.entity.getBounds();
    return (
      <>
        <Layer id="bottom">
          <NodeRectWidget {...props as any} />
        </Layer>
        <circle
          ref={nodeRef}
          fill="lightgreen"
          r="5"
          cx={bounds.width * 0.25}
          cy={bounds.height * 0.25}
        />
        <circle
          ref={targetRef}
          fill="red"
          r="5"
          cx={bounds.width * 0.75}
          cy={bounds.height * 0.75}
        />
      </>
    );
  };
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2', 'n3', 'e1', 'e2'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 150,
        y: 10,
        width: 100,
        height: 100,
      },
      {
        id: 'n2',
        type: 'node',
        x: 25,
        y: 250,
        width: 50,
        height: 50,
      },
      {
        id: 'n3',
        type: 'node',
        x: 225,
        y: 250,
        width: 50,
        height: 50,
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge-point',
        source: 'n1',
        target: 'n3',
      },
      {
        id: 'e2',
        type: 'edge-point',
        source: 'n2',
        target: 'n1',
      },
    ],
  };

  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.node) {
      return withDragNode()(NodeWithPointAnchor);
    }
    return undefined;
  });
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};
