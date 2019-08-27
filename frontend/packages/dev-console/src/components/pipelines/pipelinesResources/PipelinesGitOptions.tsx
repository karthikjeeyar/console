import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField } from '../../formik-fields';

const PipelinesGitOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="param.url"
      label="Url"
      helpText="Please provide git url"
      required
    />
    <InputField
      type={TextInputTypes.text}
      name="param.revision"
      label="Revisions"
      helpText="Please provide Revisions i.e master"
    />
  </React.Fragment>
);

export default PipelinesGitOptions;
