import { Modifiers } from '@console/topology/src/behavior/useDndDrag';
import {
  EdgeEntity,
  ElementEntity,
  isEdgeEntity,
  isNodeEntity,
  NodeEntity,
  GraphEntity,
} from '@console/topology/src/types';
import {
  DragSourceSpec,
  DragObjectWithType,
  DropTargetSpec,
  DropTargetMonitor,
} from '@console/topology/src/behavior/dnd-types';
import {
  CREATE_CONNECTOR_DROP_TYPE,
  CREATE_CONNECTOR_OPERATION,
} from '@console/topology/src/behavior/withCreateConnector';
import { createConnection, removeConnection, moveNodeToGroup } from './topology-utils';
import { TYPE_CONNECTS_TO, TYPE_WORKLOAD, TYPE_KNATIVE_SERVICE } from './consts';
import './widgets/GraphWidget.scss';

type GraphEntityProps = {
  entity: GraphEntity;
};

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const MOVE_CONNECTOR_DROP_TYPE = '#moveConnector#';

const MOVE_CONNECTOR_OPERATION = 'moveconnector';
const REGROUP_OPERATION = 'regroup';

const editOperations = [REGROUP_OPERATION, MOVE_CONNECTOR_OPERATION, CREATE_CONNECTOR_OPERATION];

const highlightNodeOperations = [MOVE_CONNECTOR_OPERATION, CREATE_CONNECTOR_OPERATION];

const canDropEdgeOnNode = (operation: string, edge: EdgeEntity, node: NodeEntity): boolean => {
  if (edge.getSource() === node) {
    return false;
  }

  if (operation === MOVE_CONNECTOR_OPERATION && edge.getTarget() === node) {
    return true;
  }

  return !node.getTargetEdges().find((e) => e.getSource() === edge.getSource());
};

const highlightNode = (monitor: DropTargetMonitor, props: NodeEntityProps): boolean => {
  if (!monitor.isDragging() || !highlightNodeOperations.includes(monitor.getOperation())) {
    return false;
  }

  if (monitor.getOperation() === CREATE_CONNECTOR_OPERATION) {
    return (
      monitor.getItem() !== props.entity &&
      !monitor
        .getItem()
        .getSourceEdges()
        .find((e) => e.getTarget() === props.entity)
    );
  }

  return canDropEdgeOnNode(monitor.getOperation(), monitor.getItem(), props.entity);
};

const nodeDragSourceSpec = (
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
  collect: (monitor) => ({
    dragging: monitor.isDragging(),
    regrouping: monitor.getOperation() === REGROUP_OPERATION,
  }),
});

const nodesEdgeIsDragging = (monitor, props) => {
  if (!monitor.isDragging()) {
    return false;
  }
  if (monitor.getOperation() === MOVE_CONNECTOR_OPERATION) {
    return monitor.getItem().getSource() === props.entity;
  }
  if (monitor.getOperation() === CREATE_CONNECTOR_OPERATION) {
    return monitor.getItem() === props.entity;
  }
  return false;
};

const nodeDropTargetSpec: DropTargetSpec<
  ElementEntity,
  any,
  { droppable: boolean; canDrop: boolean; dropTarget: boolean; edgeDragging: boolean },
  NodeEntityProps
> = {
  accept: [MOVE_CONNECTOR_DROP_TYPE, CREATE_CONNECTOR_DROP_TYPE],
  canDrop: (item, monitor, props) => {
    if (isEdgeEntity(item)) {
      return item.getSource() !== props.entity && item.getTarget() !== props.entity;
    }
    if (item === props.entity) {
      return false;
    }
    return !props.entity.getTargetEdges().find((e) => e.getSource() === item);
  },
  collect: (monitor, props) => ({
    droppable: monitor.isDragging(),
    canDrop: highlightNode(monitor, props),
    dropTarget: monitor.isOver(),
    edgeDragging: nodesEdgeIsDragging(monitor, props),
  }),
};

const graphWorkloadDropTargetSpec: DropTargetSpec<
  ElementEntity,
  any,
  { dragEditInProgress: boolean },
  GraphEntityProps
> = {
  accept: [TYPE_WORKLOAD, TYPE_KNATIVE_SERVICE, TYPE_CONNECTS_TO],
  canDrop: (item, monitor, props) => {
    return monitor.getOperation() === REGROUP_OPERATION && item.getParent() !== props.entity;
  },
  collect: (monitor) => ({
    dragEditInProgress: monitor.isDragging() && editOperations.includes(monitor.getOperation()),
  }),
};

const groupWorkoadDropTargetSpec: DropTargetSpec<
  any,
  any,
  { droppable: boolean; dropTarget: boolean; canDrop: boolean },
  any
> = {
  accept: [TYPE_WORKLOAD, TYPE_KNATIVE_SERVICE],
  canDrop: (item, monitor) => monitor.getOperation() === REGROUP_OPERATION,
  collect: (monitor) => ({
    droppable: monitor.isDragging() && monitor.getOperation() === REGROUP_OPERATION,
    dropTarget: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
};

const edgeDragSourceSpec = (serviceBinding: boolean): DragSourceSpec<
  DragObjectWithType,
  NodeEntity,
  { dragging: boolean },
  EdgeEntityProps
> => ({
  item: { type: MOVE_CONNECTOR_DROP_TYPE },
  operation: MOVE_CONNECTOR_OPERATION,
  begin: (monitor, props) => {
    props.entity.raise();
    return props.entity;
  },
  drag: (event, monitor, props) => {
    props.entity.setEndPoint(event.x, event.y);
  },
  end: (dropResult, monitor, props) => {
    props.entity.setEndPoint();
    if (monitor.didDrop() && dropResult) {
      createConnection(
        props.entity.getSource(),
        dropResult,
        props.entity.getTarget(),
        serviceBinding,
      );
    }
  },
  collect: (monitor) => ({
    dragging: monitor.isDragging(),
  }),
});

const createConnectorCallback = (serviceBinding: boolean) => (
  source: NodeEntity,
  target: NodeEntity,
): any[] | null => {
  createConnection(source, target, null, serviceBinding);
  return null;
};

const removeConnectorCallback = (edge: EdgeEntity): void => {
  removeConnection(edge);
  return null;
};

export {
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  graphWorkloadDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
  createConnectorCallback,
  removeConnectorCallback,
};
