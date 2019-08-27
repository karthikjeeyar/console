import * as React from 'react';
import * as _ from 'lodash';
import { Formik, FormikValues } from 'formik';
import {
  createModalLauncher,
  ModalComponentProps,
} from '@console/internal/components/factory/modal';
import { k8sCreate } from '@console/internal/module/k8s';
import { PipelineRunModel } from '../../../models';
import { Pipeline, PipelineResource, Param } from '../../../utils/pipeline-augment';
import { StartPipelineForm } from './startPipelineForm';
import { validationSchema } from './pipelineForm-validation-utils';

export interface PipelineModalProps {
  pipeline: Pipeline;
  newPipelineRun: Function;
}
export interface StartPipelineFormValues {
  parameters: Param[];
  resources: PipelineResource[];
}

const startPipelineModalFormContainer: React.FC<PipelineModalProps & ModalComponentProps> = ({
  pipeline,
  newPipelineRun,
  close,
}) => {
  const initialValues: StartPipelineFormValues = {
    parameters: _.get(pipeline.spec, 'params', []),
    resources: _.get(pipeline.spec, 'resources', []),
  };
  initialValues.resources.map((resource: PipelineResource) =>
    _.merge(resource, { resourceRef: { name: '' } }),
  );

  const handleSubmit = (values: FormikValues, actions): void => {
    actions.setSubmitting(true);
    const pipelineRunData = {
      spec: {
        pipelineRef: {
          name: pipeline.metadata.name,
        },
        params: values.parameters,
        resources: values.resources,
        trigger: {
          type: 'manual',
        },
      },
    };
    k8sCreate(PipelineRunModel, newPipelineRun(pipeline, pipelineRunData))
      .then(() => {
        actions.setSubmitting(false);
        close();
      })
      .catch((err) => {
        actions.setSubmitting(false);
        actions.setStatus({ submitError: err.message });
        close();
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ subFormsOpened: 0 }}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange
      validationSchema={validationSchema}
      render={(props) => <StartPipelineForm {...props} close={close} />}
    />
  );
};

export const startPipelineModalForm = createModalLauncher(startPipelineModalFormContainer);
