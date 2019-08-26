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
        dir: false,
      },
    },
    cluster: {
      type: 'cluster',
      params: {
        url: '',
        username: '',
        password: '',
        insecure: false,
      },
      secrets: {
        cadata: '',
        token: '',
      },
    },
  };

  const piplinesResourcesData = (params, actions, secretResp?) => {
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

  const handleSubmit = ({ params, secret }, actions) => {
    actions.setSubmitting(true);
    if (!secret) {
      piplinesResourcesData(params, actions);
    } else {
      createSecretResource(secret, type, namespace)
        .then((secretResp) => {
          piplinesResourcesData(params, actions, secretResp);
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
