import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField } from '../../formik-fields';

const PipelinesImageOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="params.url"
      label="Url"
      helpText="Please provide Image url."
      required
    />
  </React.Fragment>
);

export default PipelinesImageOptions;
