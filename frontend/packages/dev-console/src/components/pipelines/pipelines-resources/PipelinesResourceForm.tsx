import * as React from 'react';
import { Formik } from 'formik';
import { getActiveNamespace } from '@console/internal/reducers/ui';
import { RootState } from '@console/internal/redux';
import { connect } from 'react-redux';
import { validationSchema } from './pipelineResource-validation-utils';
import PipelinesResourceParam from './PipelinesResourceParam';
import { createPipelinesResource, createSecretResource } from './pipelinesResource-utils';

export interface PipelinesResourceFormProps {
  type: string;
  onCreate: Function;
  onClose: Function;
  namespace: string;
}

const PipelinesResourceForm: React.FC<PipelinesResourceFormProps> = ({
  type,
  onCreate,
  onClose,
  namespace,
}) => {
  const initialValues = {
    git: {
      type: 'git',
      params: {
        url: '',
        revision: '',
      },
    },
    image: {
      type: 'image',
      params: {
        url: '',
      },
    },
    storage: {
      type: 'storage',
      params: {
        type: '',
        location: '',
        dir: '',
      },
    },
    cluster: {
      type: 'cluster',
      params: {
        name: '',
        url: '',
        username: '',
        password: '',
        insecure: '',
      },
      secrets: {
        cadata: '',
        token: '',
      },
    },
  };

  const pipelinesResourcesData = (params, actions, secretResp?) => {
    createPipelinesResource(params, type, namespace, secretResp)
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

  const handleSubmit = ({ params, secrets }, actions) => {
    actions.setSubmitting(true);
    if (!secrets) {
      pipelinesResourcesData(params, actions);
    } else {
      createSecretResource(secrets, type, namespace)
        .then((secretResp) => {
          pipelinesResourcesData(params, actions, secretResp);
        })
        .catch((err) => {
          actions.setSubmitting(false);
          actions.setStatus({ submitError: err.message });
        });
    }
  };

  const handleReset = (values, actions) => {
    actions.resetForm({ values: initialValues[type], status: {} });
    onClose();
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

export default connect(mapStateToProps)(PipelinesResourceForm);
