import * as React from 'react';
import { Formik } from 'formik';
import { getActiveNamespace } from '@console/internal/reducers/ui';
import { RootState } from '@console/internal/redux';
import { connect } from 'react-redux';
import { validationSchema } from './pipelineResource-validation-utils';
import PipelinesResourceParam from './PipelinesResourceParam';
import { createPipelinesResource } from './pipelinesResource-utils';

export interface PipelineResourceFormProps {
  type: string;
  onCreate: Function;
  namespace: string;
}

const PipelineResourceForm: React.FC<PipelineResourceFormProps> = ({
  type,
  onCreate,
  namespace,
}) => {
  const initialValues = {
    git: {
      type: 'git',
      param: {
        url: '',
        revision: '',
      },
    },
    image: {
      type: 'image',
      param: {
        url: '',
      },
    },
    storage: {
      type: 'storage',
      param: {
        type: '',
        location: '',
        dir: false,
      },
    },
    cluster: {
      type: 'cluster',
      param: {
        url: '',
        password: '',
        insecure: false,
      },
    },
  };

  const handleSubmit = (values, actions) => {
    actions.setSubmitting(true);
    createPipelinesResource(values, namespace)
      .then((newObj) => {
        actions.setSubmitting(false);
        onCreate(newObj);
        actions.resetForm({
          values: initialValues[type],
          status: { success: `Successfully created pipeline resource` },
        });
      })
      .catch((err) => {
        actions.setSubmitting(false);
        actions.setStatus({ submitError: err.message });
      });
  };

  const handleReset = (values, actions) => {
    actions.resetForm({ status: {} });
  };

  return (
    <Formik
      initialValues={initialValues[type]}
      onSubmit={handleSubmit}
      onReset={handleReset}
      validationSchema={validationSchema}
      render={(props) => <PipelinesResourceParam {...props} type={type} />}
    />
  );
};

const mapStateToProps = (state: RootState) => ({
  namespace: getActiveNamespace(state),
});

export default connect(mapStateToProps)(PipelineResourceForm);
