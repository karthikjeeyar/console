/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import * as _ from 'lodash';
import {
  TopologyView,
  TopologySideBar,
  TopologyControlBar,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
} from '@patternfly/react-topology';
import { action } from '@storybook/addon-actions';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Split,
  SplitItem,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownPosition,
} from '@patternfly/react-core';
import { Edge, Model, ModelKind, Node } from '../src/types';
import Visualization from '../src/Visualization';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import { withDragNode } from '../src/behavior/useDragNode';
import VisualizationWidget from '../src/VisualizationWidget';
import {
  SELECTION_EVENT,
  SelectionEventListener,
  withSelection,
} from '../src/behavior/useSelection';
import defaultLayoutFactory from './layouts/defaultLayoutFactory';
import data from './data/reasonable';
import GroupHullWidget from './widgets/GroupHullWidget';
import GroupWidget from './widgets/GroupWidget';
import NodeWidget from './widgets/NodeWidget';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

export default {
  title: 'Topology Package',
};

const getModel = (layout: string): Model => {
  // create nodes from data
  const nodes: Node[] = data.nodes.map((d) => {
    // randomize size somewhat
    const width = 10 + d.id.length;
    const height = 10 + d.id.length;
    return {
      id: d.id,
      type: 'node',
      width,
      height,
      x: 0,
      y: 0,
      data: d,
    };
  });

  // create groups from data
  const groupNodes: Node[] = _.map(_.groupBy(nodes, (n) => n.data.group), (v, k) => ({
    type: 'group-hull',
    id: k,
    group: true,
    children: v.map((n: Node) => n.id),
    label: `group-${k}`,
  }));

  // create links from data
  const edges = data.links.map(
    (d): Edge => ({
      data: d,
      source: d.source,
      target: d.target,
      id: `${d.source}_${d.target}`,
      type: 'edge',
    }),
  );

  // create topology model
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      layout,
    },
    nodes: [...nodes, ...groupNodes],
    edges,
  };

  return model;
};

const getVisualization = (model: Model): Visualization => {
  const vis = new Visualization();

  vis.registerLayoutFactory(defaultLayoutFactory);
  vis.registerWidgetFactory(defaultWidgetFactory);

  // support pan zoom, drag, and selection
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.getType() === 'group-hull') {
      return withDragNode()(GroupHullWidget);
    }
    if (entity.getType() === 'group') {
      return withDragNode()(GroupWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDragNode()(withSelection()(NodeWidget));
    }
    return undefined;
  });
  vis.fromModel(model);

  return vis;
};

type TopologyViewComponentProps = {
  vis: Visualization;
  useSidebar: boolean;
};

const TopologyViewComponent: React.FC<TopologyViewComponentProps> = ({ vis, useSidebar }) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>();
  const [layoutDropdownOpen, setLayoutDropdownOpen] = React.useState(false);
  const [layout, setLayout] = React.useState('Force');

  vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (ids) => {
    action(`Selection event`)(ids);
    setSelectedIds(ids);
  });

  const topologySideBar = (
    <TopologySideBar show={_.size(selectedIds) > 0} onClose={() => setSelectedIds([])}>
      <div style={{ marginTop: 27, marginLeft: 20 }}>{_.head(selectedIds)}</div>
    </TopologySideBar>
  );

  const updateLayout = (newLayout: string) => {
    // FIXME reset followed by layout causes a flash of the reset prior to the layout
    vis.getRoot().reset();
    vis.getRoot().setLayout(newLayout);
    setLayout(newLayout);
    setLayoutDropdownOpen(false);
  };

  const layoutDropdown = (
    <Split>
      <SplitItem>
        <label className="pf-u-display-inline-block pf-u-mr-md pf-u-mt-sm">Layout</label>
      </SplitItem>
      <SplitItem>
        <Dropdown
          position={DropdownPosition.right}
          toggle={
            <DropdownToggle onToggle={() => setLayoutDropdownOpen(!layoutDropdownOpen)}>
              {layout}
            </DropdownToggle>
          }
          isOpen={layoutDropdownOpen}
          dropdownItems={[
            <DropdownItem key={1} onClick={() => updateLayout('Force')}>
              Force
            </DropdownItem>,
            <DropdownItem key={2} onClick={() => updateLayout('Dagre')}>
              Dagre
            </DropdownItem>,
            <DropdownItem key={3} onClick={() => updateLayout('Cola')}>
              Cola
            </DropdownItem>,
          ]}
        />
      </SplitItem>
    </Split>
  );
  const viewToolbar = (
    <Toolbar className="pf-u-mx-md pf-u-my-md">
      <ToolbarGroup>
        <ToolbarItem>{layoutDropdown}</ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );

  return (
    <TopologyView
      controlBar={
        <TopologyControlBar
          controlButtons={createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: () => {
              vis.getRoot().scaleBy(4 / 3);
            },
            zoomOutCallback: () => {
              vis.getRoot().scaleBy(0.75);
            },
            fitToScreenCallback: () => {
              vis.getRoot().fit(80);
            },
            resetViewCallback: () => {
              vis.getRoot().reset();
              vis.getRoot().layout();
            },
            legend: false,
          })}
        />
      }
      viewToolbar={viewToolbar}
      sideBar={useSidebar && topologySideBar}
      sideBarOpen={useSidebar && _.size(selectedIds) > 0}
    >
      <VisualizationWidget visualization={vis} state={{ selectedIds }} />
    </TopologyView>
  );
};

export const Topology = () => {
  const vis: Visualization = getVisualization(getModel('Force'));

  return <TopologyViewComponent useSidebar={false} vis={vis} />;
};

export const WithSideBar = () => {
  const vis: Visualization = getVisualization(getModel('Force'));
  return <TopologyViewComponent useSidebar vis={vis} />;
};
