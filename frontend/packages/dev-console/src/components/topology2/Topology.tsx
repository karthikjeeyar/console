import * as React from 'react';
import {
  TopologyView,
  TopologyControlBar,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
} from '@patternfly/react-topology';
import Visualization from '@console/topology/src/Visualization';
import VisualizationWidget from '@console/topology/src/VisualizationWidget';
import {ElementEntity, isNodeEntity, Model, NodeEntity} from '@console/topology/src/types';
import {
  SELECTION_EVENT,
  SelectionEventListener,
} from '@console/topology/src/behavior/useSelection';
import BaseNodeEntity from '@console/topology/src/entities/BaseNodeEntity';
import * as _ from 'lodash';
import TopologySideBar from '../topology/TopologySideBar';
import { TopologyDataModel, TopologyDataObject } from '../topology/topology-types';
import TopologyResourcePanel from '../topology/TopologyResourcePanel';
// import TopologyApplicationPanel from '../topology/TopologyApplicationPanel';
import TopologyApplicationPanel from '../topology/TopologyApplicationPanel';
import { topologyModelFromDataModel } from './topology-utils';
import layoutFactory from './layoutFactory';
import widgetFactory from './widgetFactory';

export interface TopologyProps {
  data: TopologyDataModel;
}

const graphModel: Model = {
  graph: {
    id: 'g1',
    type: 'graph',
    layout: 'Force',
  },
};

const findEntityForId = (id: string, visualization: Visualization): NodeEntity => {
  const entities: ElementEntity[] = visualization.getEntities();
  const foundEntity = entities.find((entity: ElementEntity) => entity.getId() === id);
  if (isNodeEntity(foundEntity)) {
    return foundEntity as NodeEntity;
  }

  return undefined;
};

const Topology: React.FC<TopologyProps> = ({ data }) => {
  const visRef = React.useRef<Visualization | null>(null);
  const [model, setModel] = React.useState<Model>();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<NodeEntity | undefined>();
  const { topology } = data;

  const onSelection = (ids: string[]) => {
    setSelectedIds(ids);
  };

  if (!visRef.current) {
    visRef.current = new Visualization();

    visRef.current.registerLayoutFactory(layoutFactory);
    visRef.current.registerWidgetFactory(widgetFactory);
    visRef.current.addEventListener<SelectionEventListener>(SELECTION_EVENT, onSelection);
  }

  if (!model) {
    const newModel = topologyModelFromDataModel(data);
    visRef.current.fromModel(graphModel);
    visRef.current.fromModel(newModel);
    setModel(newModel);
  }

  React.useEffect(() => {
    const newModel = topologyModelFromDataModel(data);
    visRef.current.fromModel(newModel);
    setModel(newModel);
  }, [data]);

  React.useEffect(() => {
    const selected: NodeEntity = selectedIds[0]
      ? findEntityForId(selectedIds[0], visRef.current)
      : undefined;
    setSelectedEntity(selected);
  }, [selectedIds, topology]);

  React.useEffect(() => {
    if (selectedEntity) {
      setTimeout(() => {
        visRef.current.getRoot().makeEntityVisible(selectedEntity);
      }, 500);
    }
  }, [selectedEntity]);

  const onSidebarClose = () => {
    visRef.current.getController().fireEvent(SELECTION_EVENT, []);
  };

  const renderControlBar = () => {
    return (
      <TopologyControlBar
        controlButtons={createTopologyControlButtons({
          ...defaultControlButtonsOptions,
          zoomInCallback: () => {
            visRef.current.getRoot().scaleBy(4 / 3);
          },
          zoomOutCallback: () => {
            visRef.current.getRoot().scaleBy(0.75);
          },
          fitToScreenCallback: () => {
            visRef.current.getRoot().fit(80);
          },
          resetViewCallback: () => {
            visRef.current.getRoot().reset();
            visRef.current.getRoot().layout();
          },
          legend: false,
        })}
      />
    );
  };

  const selectedItemDetails = () => {
    if (isNodeEntity(selectedEntity)) {
      if ((selectedEntity as BaseNodeEntity).isGroup()) {
        return (
          <TopologyApplicationPanel
            application={{
              id: selectedEntity.getId(),
              name: selectedEntity.getLabel(),
              resources: _.map(selectedEntity.getChildren(), (node: ElementEntity) =>
                node.getData(),
              ),
            }}
          />
        );
      }
      return <TopologyResourcePanel item={selectedEntity.getData() as TopologyDataObject} />;
    }

    return null;
  };

  const topologySideBar = (
    <TopologySideBar show={!!selectedEntity} onClose={onSidebarClose}>
      {selectedEntity && selectedItemDetails()}
    </TopologySideBar>
  );

  if (!model) {
    return null;
  }

  return (
    <TopologyView
      controlBar={renderControlBar()}
      sideBar={topologySideBar}
      sideBarOpen={!!selectedEntity}
    >
      <VisualizationWidget visualization={visRef.current} state={{ selectedIds }} />
    </TopologyView>
  );
};

export default Topology;
