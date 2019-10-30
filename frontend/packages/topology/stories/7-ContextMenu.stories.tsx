import * as React from 'react';
import ContextMenu, { ContextMenuItem, ContextMenuSeparator } from '../src/contextmenu/ContextMenu';
import Visualization from '../src/Visualization';
import { Model, ModelKind } from '../src/types';
import VisualizationWidget from '../src/VisualizationWidget';
import { withDragNode } from '../src/behavior/useDragNode';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import { withContextMenu } from '../src/behavior/withContextMenu';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import NodeWidget from './widgets/NodeWidget';

export default {
  title: 'Context Menu',
};

function contextMenuItem(label: string, i: number): React.ReactElement {
  if (label === '-') {
    return <ContextMenuSeparator key={`separator:${i.toString()}`} />;
  }
  // eslint-disable-next-line no-alert
  return (
    <ContextMenuItem key={label} onClick={() => alert(`Selected: ${label}`)}>
      {label}
    </ContextMenuItem>
  );
}

function createContextMenuItems(...labels: string[]): React.ReactElement[] {
  return labels.map(contextMenuItem);
}

const defaultMenu = createContextMenuItems('First', 'Second', 'Third', '-', 'Fourth');

export const UncontrolledContextMenu = () => {
  return (
    <>
      <p>Dismiss the context menu by pressing `ESC` or clicking away.</p>
      <ContextMenu reference={{ x: 100, y: 50 }}>{defaultMenu}</ContextMenu>
    </>
  );
};

export const ControlledContextMenu = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Show Context Menu
      </button>
      <ContextMenu reference={{ x: 100, y: 50 }} open={open} onRequestClose={() => setOpen(false)}>
        {defaultMenu}
      </ContextMenu>
    </>
  );
};

export const ContextMenuOnNode = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 50,
        y: 50,
        width: 20,
        height: 20,
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((kind) => {
    if (kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (kind === ModelKind.node) {
      return withDragNode()(withContextMenu(() => defaultMenu)(NodeWidget));
    }
    return undefined;
  });
  return <VisualizationWidget visualization={vis} />;
};
