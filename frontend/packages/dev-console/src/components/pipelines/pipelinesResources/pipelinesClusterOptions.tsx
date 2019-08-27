import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField, CheckboxField, InputTextAreaField } from '../../formik-fields';

const PipelinesClusterOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="params.url"
      label="Url"
      helpText="Host url of the master node."
      required
    />
    <InputField
      type={TextInputTypes.text}
      name="params.username"
      label="Username"
      helpText="The user with access to the cluster."
      required
    />
    <InputField
      type={TextInputTypes.password}
      name="params.password"
      label="Password"
      helpText="Please provide Password."
    />
    <CheckboxField
      name="params.insecure"
      label="Insecure"
      helpText="Indicate server should be accessed without verifying the TLS certificate"
    />
    <InputTextAreaField
      name="secrets.cadata"
      label="Cadata"
      helpText="Please provide CADATA."
      required
    />
    <InputTextAreaField name="secrets.token" label="Token" helpText="Please provide Token." />
  </React.Fragment>
);

export default PipelinesClusterOptions;
