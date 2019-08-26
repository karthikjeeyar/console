import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField } from '../../formik-fields';

const PipelinesImageOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="param.url"
      label="Name"
      helpText="Please provide Image nam"
      required
    />
  </React.Fragment>
);

export default PipelinesImageOptions;
