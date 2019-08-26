import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField, CheckboxField } from '../../formik-fields';

const PipelinesClusterOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="param.url"
      label="Url"
      helpText="Host url of the master node."
      required
    />
    <InputField
      type={TextInputTypes.text}
      name="param.username"
      label="Username"
      helpText="The user with access to the cluster."
      required
    />
    <InputField
      type={TextInputTypes.password}
      name="param.password"
      label="Password"
      helpText="Please provide Password."
    />
    <CheckboxField
      name="param.insecure"
      label="Insecure"
      helpText="Indicate server should be accessed without verifying the TLS certificate"
    />
  </React.Fragment>
);

export default PipelinesClusterOptions;
