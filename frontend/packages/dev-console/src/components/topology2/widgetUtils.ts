import { action } from 'mobx';
import { Modifiers } from '@console/topology/src/behavior/useDndDrag';
import {
  EdgeEntity,
  ElementEntity,
  isEdgeEntity,
  isNodeEntity,
  NodeEntity,
} from '@console/topology/src/types';
import { DragEvent, DragSourceMonitor } from '@console/topology/src/behavior/dnd-types';
import { CREATE_CONNECTOR_DROP_TYPE } from '@console/topology/src/behavior/withCreateConnector';
import { createConnection, removeConnection, moveNodeToGroup } from './topology-utils';

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const MOVE_CONNECTOR_DROP_TYPE = '#moveConnector#';

const workloadDragSourceSpec = (entity: ElementEntity) => ({
  item: { type: entity.getType() },
  operation: {
    [Modifiers.SHIFT]: 'regroup',
  },
  end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: NodeEntityProps) => {
    if (monitor.didDrop() && dropResult && props && props.entity.getParent() !== dropResult) {
      moveNodeToGroup(props.entity, isNodeEntity(dropResult) ? dropResult : null);
    }
  }),
});

const workloadDropTargetSpec = {
  accept: [MOVE_CONNECTOR_DROP_TYPE, CREATE_CONNECTOR_DROP_TYPE],
  canDrop: (item, monitor, props) => {
    if (isEdgeEntity(item)) {
      return !props || (item.getSource() !== props.entity && item.getTarget() !== props.entity);
    }
    if (!props || item === props.entity) {
      return false;
    }
    return !item
      .getController()
      .getEntities()
      .filter((entity: ElementEntity) => isEdgeEntity(entity))
      .find((edge: EdgeEntity) => {
        return edge.getSource() === item && edge.getTarget() === props.entity;
      });
  },
  collect: (monitor) => ({
    droppable: monitor.isDragging(),
    hover: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
};

const nodeDragSourceSpec = (entity: ElementEntity) => ({
  item: { type: entity.getType() },
  operation: {
    [Modifiers.SHIFT]: 'regroup',
  },
  end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: NodeEntityProps) => {
    if (monitor.didDrop() && dropResult && props) {
      dropResult.appendChild(props.entity);
    }
  }),
});

const graphWorkloadDropTargetSpec = {
  accept: 'workload',
  canDrop: (item, monitor, props) => {
    return monitor.getOperation() === 'regroup' && !!props && item.getParent() !== props.entity;
  },
  collect: (monitor) => ({
    droppable: monitor.isDragging() && monitor.getOperation() === 'regroup',
    hover: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  }),
};

const groupWorkoadDropTargetSpec = {
  accept: 'workload',
  canDrop: (item, monitor) => monitor.getOperation() === 'regroup',
  collect: (monitor) => ({
    droppable: monitor.isDragging() && monitor.getOperation() === 'regroup',
    hover: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
};

const edgeDragSourceSpec = {
  item: { type: MOVE_CONNECTOR_DROP_TYPE },
  begin: action((monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    props.entity.raise();
    return props.entity;
  }),
  drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    props.entity.setEndPoint(event.x, event.y);
  }),
  end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    props.entity.setEndPoint();
    if (monitor.didDrop() && dropResult && props) {
      createConnection(props.entity.getSource(), dropResult, props.entity.getTarget());
    }
  }),
  collect: (monitor) => ({
    dragging: monitor.isDragging(),
  }),
};

const createConnectorSpec = (source: NodeEntity, target: NodeEntity): any[] | null => {
  createConnection(source, target);
  return null;
};

const removeConnectorSpec = (edge: EdgeEntity): void => {
  removeConnection(edge);
  return null;
};

export {
  workloadDragSourceSpec,
  workloadDropTargetSpec,
  nodeDragSourceSpec,
  graphWorkloadDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
  createConnectorSpec,
  removeConnectorSpec,
};
