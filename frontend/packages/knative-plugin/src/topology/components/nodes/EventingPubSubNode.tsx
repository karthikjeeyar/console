import * as React from 'react';
import * as classNames from 'classnames';
import {
  observer,
  Node,
  useAnchor,
  RectAnchor,
  useCombineRefs,
  useHover,
  useDragNode,
  WithDndDropProps,
  WithSelectionProps,
  WithContextMenuProps,
  createSvgIdUrl,
  WithCreateConnectorProps,
} from '@console/topology';
import {
  NodeShadows,
  NODE_SHADOW_FILTER_ID,
  NODE_SHADOW_FILTER_ID_HOVER,
  nodeDragSourceSpec,
  useSearchFilter,
  getTopologyResourceObject,
} from '@console/dev-console/src/components/topology';
import SvgBoxedText from '@console/dev-console/src/components/svg/SvgBoxedText';
import { useAccessReview } from '@console/internal/components/utils';
import { EventingSubscriptionModel } from '../../../models';
import { TYPE_KNATIVE_SERVICE } from '../../const';
import './EventingPubSubNode.scss';

export type EventingPubSubNodeProps = {
  element: Node;
  canDrop?: boolean;
  dropTarget?: boolean;
  edgeDragging?: boolean;
} & WithSelectionProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

const EventingPubSubNode: React.FC<EventingPubSubNodeProps> = ({
  element,
  selected,
  onSelect,
  onContextMenu,
  contextMenuOpen,
  canDrop,
  dropTarget,
  edgeDragging,
  dndDropRef,
  onHideCreateConnector,
  onShowCreateConnector,
}) => {
  useAnchor(React.useCallback((node: Node) => new RectAnchor(node, 1.5), []));
  const [hover, hoverRef] = useHover();
  const { kind } = element.getData().data;
  const { width, height } = element.getBounds();
  const size = Math.min(width, height);

  const createAccess = useAccessReview({
    group: EventingSubscriptionModel.apiGroup,
    verb: 'create',
    resource: EventingSubscriptionModel.plural,
    namespace: getTopologyResourceObject(element.getData()).metadata.namespace,
  });
  const [{ dragging }, dragNodeRef] = useDragNode(
    nodeDragSourceSpec(TYPE_KNATIVE_SERVICE, true, createAccess),
    {
      element,
    },
  );
  const refs = useCombineRefs<SVGRectElement>(hoverRef, dragNodeRef);
  const [filtered] = useSearchFilter(element.getLabel());

  React.useLayoutEffect(() => {
    if (createAccess) {
      if (hover) {
        onShowCreateConnector && onShowCreateConnector();
      } else {
        onHideCreateConnector && onHideCreateConnector();
      }
    }
  }, [createAccess, hover, onShowCreateConnector, onHideCreateConnector]);

  return (
    <g
      ref={refs}
      onContextMenu={onContextMenu}
      onClick={onSelect}
      className={classNames('odc-eventing-pubsub', {
        'is-dragging': dragging,
        'is-highlight': canDrop || edgeDragging,
        'is-selected': selected,
        'is-dropTarget': canDrop && dropTarget,
        'is-filtered': filtered,
      })}
    >
      <NodeShadows />
      <rect
        ref={dndDropRef}
        className="odc-eventing-pubsub__bg"
        filter={createSvgIdUrl(
          hover || dragging || contextMenuOpen || dropTarget
            ? NODE_SHADOW_FILTER_ID_HOVER
            : NODE_SHADOW_FILTER_ID,
        )}
        x={0}
        y={0}
        width={width}
        height={height}
        rx="15"
        ry="15"
      />
      <text x={width / 2} y={height / 2} dy="0.35em" textAnchor="middle">
        Channel
      </text>
      {(kind || element.getLabel()) && (
        <SvgBoxedText
          className="odc-eventing-pubsub__label odc-base-node__label"
          x={width / 2}
          y={(height + size) / 2 + 20}
          paddingX={8}
          paddingY={4}
          kind={kind}
        >
          {element.getLabel()}
        </SvgBoxedText>
      )}
    </g>
  );
};

export default observer(EventingPubSubNode);
