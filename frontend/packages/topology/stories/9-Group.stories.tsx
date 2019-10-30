import * as React from 'react';
import { observer } from 'mobx-react';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, NodeEntity, AnchorEnd, NodeShape } from '../src/types';
import { useSvgAnchor } from '../src/behavior/useSvgAnchor';
import { withDragNode } from '../src/behavior/useDragNode';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import GroupWidget from './widgets/GroupWidget';
import NodeWidget from './widgets/NodeWidget';

export default {
  title: 'Complex Group',
};

const GroupWithDecorator: React.FC<{ entity: NodeEntity }> = observer((props) => {
  const trafficSourceRef = useSvgAnchor(AnchorEnd.source, 'traffic');
  const b = props.entity.getBounds();
  return (
    <GroupWidget {...props as any}>
      <circle
        ref={trafficSourceRef}
        cx={b.x + b.width}
        cy={b.y}
        r="12.5"
        fill="lightblue"
        strokeWidth={1}
        stroke="#333333"
      />
    </GroupWidget>
  );
});

export const complexGroup = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
    },
    nodes: [
      {
        id: 'gr1',
        type: 'group-hull',
        group: true,
        children: ['n1', 'n2', 's1'],
        style: {
          padding: 50,
        },
      },

      {
        id: 's1',
        type: 'service',
        group: true,
        children: ['r1', 'r2'],
        shape: NodeShape.rect,
        style: {
          padding: 25,
        },
      },
      {
        id: 'n1',
        type: 'node',
        x: 100,
        y: 150,
        width: 100,
        height: 100,
      },
      {
        id: 'n2',
        type: 'node',
        x: 450,
        y: 100,
        width: 100,
        height: 100,
      },
      {
        id: 'r1',
        type: 'node',
        x: 250,
        y: 300,
        width: 100,
        height: 100,
      },
      {
        id: 'r2',
        type: 'node',
        x: 370,
        y: 320,
        width: 100,
        height: 100,
      },
    ],
    edges: [
      {
        id: 't1',
        type: 'traffic',
        source: 's1',
        target: 'r1',
      },
      {
        id: 't2',
        type: 'traffic',
        source: 's1',
        target: 'r2',
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((kind, type) => {
    if (type === 'service') {
      return GroupWithDecorator;
    }
    if (type === 'node') {
      return withDragNode()(NodeWidget);
    }
    return undefined;
  });
  return <VisualizationWidget visualization={vis} />;
};
