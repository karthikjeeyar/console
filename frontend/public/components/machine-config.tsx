/* eslint-disable no-undef, no-unused-vars */
import * as _ from 'lodash-es';
import * as React from 'react';

import { MachineConfigKind, referenceForModel } from '../module/k8s';
import { MachineConfigModel } from '../models';
import { fromNow } from './utils/datetime';
import {
  ColHead,
  DetailsPage,
  List,
  ListHeader,
  ListPage,
} from './factory';
import {
  Kebab,
  navFactory,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
} from './utils';


export const machineConfigReference = referenceForModel(MachineConfigModel);
const machineConfigMenuActions = [...Kebab.factory.common];

const MachineConfigSummary: React.SFC<MachineConfigSummaryProps> = ({obj}) => (
  <ResourceSummary resource={obj}>
    <dt>OS Image URL</dt>
    <dd>{obj.spec.osImageURL || '-'}</dd>
  </ResourceSummary>
);

const MachineConfigDetails: React.SFC<MachineConfigDetailsProps> = ({obj}) => (
  <div className="co-m-pane__body">
    <SectionHeading text="Machine Config Overview" />
    <div className="row">
      <div className="col-xs-12">
        <MachineConfigSummary obj={obj} />
      </div>
    </div>
  </div>
);

const pages = [
  navFactory.details(MachineConfigDetails),
  navFactory.editYaml(),
];

export const MachineConfigDetailsPage: React.SFC<any> = props => {
  return <DetailsPage {...props} kind={machineConfigReference} menuActions={machineConfigMenuActions} pages={pages} />;
};

const MachineConfigHeader: React.SFC<any> = props => <ListHeader>
  <ColHead {...props} className="col-xs-6  col-sm-4  col-md-3  col-lg-2" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="hidden-xs col-sm-6  col-md-4  col-lg-3" sortField="metadata.annotations['machineconfiguration.openshift.io/generated-by-controller-version']">Generated By Controller</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm col-md-3  col-lg-3" sortField="spec.config.ignition.version">Ignition Version</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm hidden-md col-lg-2" sortField="spec.osImageURL">OS Image URL</ColHead>
  <ColHead {...props} className="col-xs-6  col-sm-2  col-md-2  col-lg-2" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

const MachineConfigRow: React.SFC<MachineConfigRowProps> = ({obj}) => <div className="row co-resource-list__item">
  <div className="col-xs-6  col-sm-4  col-md-3  col-lg-2">
    <ResourceLink kind={machineConfigReference} name={obj.metadata.name} title={obj.metadata.name} />
  </div>
  <div className="hidden-xs col-sm-6  col-md-4  col-lg-3">
    { _.get(obj, ['metadata', 'annotations', 'machineconfiguration.openshift.io/generated-by-controller-version'], '-')}
  </div>
  <div className="hidden-xs hidden-sm col-md-3  col-lg-3">
    {_.get(obj, 'spec.config.ignition.version') || '-'}
  </div>
  <div className="hidden-xs hidden-sm hidden-md col-lg-2 co-break-word">
    {_.get(obj, 'spec.osImageURL') || '-'}
  </div>
  <div className="col-xs-6  col-sm-2  col-md-2  col-lg-2">
    {fromNow(obj.metadata.creationTimestamp)}
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={machineConfigMenuActions} kind={machineConfigReference} resource={obj} />
  </div>
</div>;

const MachineConfigList: React.SFC<any> = props => (
  <List
    {...props}
    Header={MachineConfigHeader}
    Row={MachineConfigRow}
  />
);

export const MachineConfigPage: React.SFC<any> = ({canCreate = true, ...rest}) => (
  <ListPage
    {...rest}
    canCreate={canCreate}
    ListComponent={MachineConfigList}
    kind={machineConfigReference}
  />
);

type MachineConfigRowProps = {
  obj: MachineConfigKind;
};

type MachineConfigDetailsProps = {
  obj: MachineConfigKind;
};

type MachineConfigSummaryProps = {
  obj: MachineConfigKind;
};
