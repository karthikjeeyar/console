import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextArea } from '@patternfly/react-core';
import { InputTextAreaFieldProps } from './field-types';
import { getFieldId } from './field-utils';

const InputTextAreaField: React.FC<InputTextAreaFieldProps> = ({
  label,
  helpText,
  required,
  ...props
}) => {
  const [field, { touched, error }] = useField(props.name);
  const fieldId = getFieldId(props.name, 'input');
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={helpText}
      helperTextInvalid={errorMessage}
      isValid={isValid}
      isRequired={required}
    >
      <TextArea
        {...field}
        {...props}
        id={fieldId}
        isValid={isValid}
        isRequired={required}
        aria-describedby={`${fieldId}-helper`}
        onChange={(value, event) => field.onChange(event)}
      />
    </FormGroup>
  );
};

export default InputTextAreaField;
