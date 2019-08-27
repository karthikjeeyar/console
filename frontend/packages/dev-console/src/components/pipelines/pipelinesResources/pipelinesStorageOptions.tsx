import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField, CheckboxField } from '../../formik-fields';

const PipelinesStorageOptions: React.FC = () => (
  <React.Fragment>
    <InputField
      type={TextInputTypes.text}
      name="params.type"
      label="type"
      helpText="Represents the type of blob storage i.e gcs"
      required
    />
    <InputField
      type={TextInputTypes.text}
      name="params.location"
      label="location"
      helpText="Represents the location of the blob storage i.e gs://some-private-bucket"
      required
    />
    <CheckboxField
      name="params.dir"
      label="dir"
      helpText="Represents whether the blob storage is a directory or not"
    />
  </React.Fragment>
);

export default PipelinesStorageOptions;
