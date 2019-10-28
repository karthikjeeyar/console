import { Modifiers } from '@console/topology/src/behavior/useDndDrag';
import {
  EdgeEntity,
  ElementEntity,
  isEdgeEntity,
  isNodeEntity,
  NodeEntity,
} from '@console/topology/src/types';
import {
  DragSourceSpec,
  DragObjectWithType,
  DropTargetSpec,
} from '@console/topology/src/behavior/dnd-types';
import { CREATE_CONNECTOR_DROP_TYPE } from '@console/topology/src/behavior/withCreateConnector';
import { createConnection, removeConnection, moveNodeToGroup } from './topology-utils';
import { TYPE_WORKLOAD } from './consts';

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const MOVE_CONNECTOR_DROP_TYPE = '#moveConnector#';

const REGROUP_OPERATION = 'regroup';

const workloadDragSourceSpec = (
  type: string,
): DragSourceSpec<DragObjectWithType, NodeEntity, {}, NodeEntityProps> => ({
  item: { type },
  operation: {
    [Modifiers.SHIFT]: REGROUP_OPERATION,
  },
  canCancel: false,
  end: (dropResult, monitor, props) => {
    if (monitor.didDrop() && dropResult && props && props.entity.getParent() !== dropResult) {
      moveNodeToGroup(props.entity, isNodeEntity(dropResult) ? dropResult : null);
    }
  },
});

const workloadDropTargetSpec: DropTargetSpec<
  ElementEntity,
  any,
  { droppable: boolean; hover: boolean; canDrop: boolean },
  NodeEntityProps
> = {
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

const nodeDragSourceSpec = (
  type: string,
): DragSourceSpec<DragObjectWithType, NodeEntity, {}, NodeEntityProps> => ({
  item: { type },
  operation: {
    [Modifiers.SHIFT]: REGROUP_OPERATION,
  },
  end: (dropResult, monitor, props) => {
    if (monitor.didDrop() && dropResult && props) {
      dropResult.appendChild(props.entity);
    }
  },
});

const graphWorkloadDropTargetSpec: DropTargetSpec<
  NodeEntity,
  any,
  { droppable: boolean; hover: boolean; canDrop: boolean },
  NodeEntityProps
> = {
  accept: TYPE_WORKLOAD,
  canDrop: (item, monitor, props) => {
    return (
      monitor.getOperation() === REGROUP_OPERATION && !!props && item.getParent() !== props.entity
    );
  },
  collect: (monitor) => ({
    droppable: monitor.isDragging() && monitor.getOperation() === REGROUP_OPERATION,
    hover: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  }),
};

const groupWorkoadDropTargetSpec: DropTargetSpec<
  any,
  any,
  { droppable: boolean; hover: boolean; canDrop: boolean },
  NodeEntityProps
> = {
  accept: TYPE_WORKLOAD,
  canDrop: (item, monitor) => monitor.getOperation() === REGROUP_OPERATION,
  collect: (monitor) => ({
    droppable: monitor.isDragging() && monitor.getOperation() === REGROUP_OPERATION,
    hover: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
};

const edgeDragSourceSpec: DragSourceSpec<
  DragObjectWithType,
  NodeEntity,
  { dragging: boolean },
  EdgeEntityProps
> = {
  item: { type: MOVE_CONNECTOR_DROP_TYPE },
  begin: (monitor, props) => {
    props.entity.raise();
    return props.entity;
  },
  drag: (event, monitor, props) => {
    props.entity.setEndPoint(event.x, event.y);
  },
  end: (dropResult, monitor, props) => {
    props.entity.setEndPoint();
    if (monitor.didDrop() && dropResult && props) {
      createConnection(props.entity.getSource(), dropResult, props.entity.getTarget());
    }
  },
  collect: (monitor) => ({
    dragging: monitor.isDragging(),
  }),
};

const createConnectorCallback = (source: NodeEntity, target: NodeEntity): any[] | null => {
  createConnection(source, target);
  return null;
};

const removeConnectorCallback = (edge: EdgeEntity): void => {
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
  createConnectorCallback,
  removeConnectorCallback,
};
