import * as React from 'react';
import * as _ from 'lodash';
import { Form } from '@patternfly/react-core';
import { FormikValues } from 'formik';
import {
  ModalTitle,
  ModalBody,
  ModalSubmitFooter,
} from '@console/internal/components/factory/modal';
import { PipelineResourcesSection } from './PipelineResourcesSection';
import { PipelineParametersSection } from './PipelineParametersSection';

export const StartPipelineForm: React.FC<FormikValues> = ({
  values,
  errors,
  handleSubmit,
  status,
  isSubmitting,
  dirty,
  close,
}) => {
  const resources = values.resources.reduce(
    (acc, value, index) => {
      const resource = _.cloneDeep(value);
      if (!acc.types.includes(resource.type)) {
        acc.types.push(resource.type);
        acc[resource.type] = [];
      }
      acc[resource.type].push(_.merge(resource, { index }));
      return acc;
    },
    { types: [] } as any,
  );

  return (
    <Form onSubmit={handleSubmit}>
      <div className="modal-content co-p-new-user-modal">
        <ModalTitle>Start Pipeline</ModalTitle>
        <ModalBody>
          <PipelineParametersSection parameters={values.parameters} />
          <PipelineResourcesSection resources={resources} />
        </ModalBody>
        <ModalSubmitFooter
          errorMessage={status && status.submitError}
          inProgress={isSubmitting}
          submitText="Start"
          submitDisabled={!dirty || !_.isEmpty(errors) || status.subFormsOpened}
          cancel={() => close()}
        />
      </div>
    </Form>
  );
};
