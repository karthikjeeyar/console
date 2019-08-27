import * as React from 'react';
import * as _ from 'lodash-es';
import { Formik, FormikValues } from 'formik';
import {
  createModalLauncher,
  ModalComponentProps,
} from '@console/internal/components/factory/modal';
import { k8sCreate } from '@console/internal/module/k8s';
import { newPipelineRun } from '../../../utils/pipeline-actions';
import { PipelineRunModel } from '../../../models';
import { Pipeline, PipelineResource, Param } from '../../../utils/pipeline-augment';
import { StartPipelineForm } from './startPipelineForm';
import { validationSchema } from './pipelineForm-validation-utils';

export interface PipelineModalProps {
  pipeline: Pipeline;
}
export interface StartPipelineFormValues {
  parameters: Param[];
  resources: PipelineResource[];
}

export const _startPipelineModalForm: React.FC<PipelineModalProps & ModalComponentProps> = ({
  pipeline,
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

export const startPipelineModalForm = createModalLauncher(_startPipelineModalForm);
