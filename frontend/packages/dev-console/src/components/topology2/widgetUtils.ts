import { action } from 'mobx';
import { Modifiers } from '@console/topology/src/behavior/useDndDrag';
import { EdgeEntity, ElementEntity, NodeEntity } from '@console/topology/src/types';
import { DragEvent, DragSourceMonitor } from '@console/topology/src/behavior/dnd-types';
import BaseNodeEntity from '@console/topology/src/entities/BaseNodeEntity';
import { moveNodeToGroup } from './topology-utils';

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const workloadDragSourceSpec = (entity: ElementEntity) => ({
  item: { type: entity.getType() },
  operation: {
    [Modifiers.SHIFT]: 'regroup',
  },
  end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: NodeEntityProps) => {
    if (monitor.didDrop() && dropResult && props && props.entity.getParent() !== dropResult) {
      moveNodeToGroup(props.entity, dropResult instanceof BaseNodeEntity ? dropResult : null);
    }
  }),
});

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
  item: { type: 'test' },
  begin: action((monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    props.entity.raise();
    return props.entity;
  }),
  drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    props.entity.setEndPoint(event.x, event.y);
  }),
  end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
    if (monitor.didDrop() && dropResult && props) {
      props.entity.setTarget(dropResult);
    }
    props.entity.setEndPoint();
  }),
  collect: (monitor) => ({
    dragging: monitor.isDragging(),
  }),
};

export {
  workloadDragSourceSpec,
  nodeDragSourceSpec,
  graphWorkloadDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
};
