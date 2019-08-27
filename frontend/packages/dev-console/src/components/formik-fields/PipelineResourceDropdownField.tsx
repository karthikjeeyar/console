import * as React from 'react';
import cx from 'classnames';
import { useField, useFormikContext, FormikValues } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import PipelineResourceDropdown from '../dropdown/PipelineResourceDropdown';
import PipelinesResourceForm from '../pipelines/pipelinesResources/PipelinesResourceForm';
import { DropdownFieldProps } from './field-types';
import { getFieldId } from './field-utils';

export const CREATE_PIPELINE_RESOURCE = '#CREATE_PIPELINE_RESOURCE#';

export interface PipelineResourceDropdownFieldProps extends DropdownFieldProps {
  filterType?: string;
}
const PipelineResourceDropdownField: React.FC<PipelineResourceDropdownFieldProps> = ({
  label,
  helpText,
  required,
  fullWidth,
  ...props
}) => {
  const [field, { touched, error }] = useField(props.name);
  const { setFieldValue, setFieldTouched, setStatus, status } = useFormikContext<FormikValues>();
  const fieldId = getFieldId(props.name, 'pipeline-resource-dropdown');
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';

  const handleChange = React.useCallback(
    (value: string) => {
      console.log('field', field, value);
      setFieldValue(props.name, value);
      if (value === CREATE_PIPELINE_RESOURCE) {
        setStatus({ subFormsOpened: status.subFormsOpened + 1 });
      }
      setFieldTouched(props.name, true);
    },
    [field, setFieldValue, props.name, setFieldTouched, setStatus, status.subFormsOpened],
  );

  return (
    <React.Fragment>
      <FormGroup
        fieldId={fieldId}
        label={label}
        helperText={helpText}
        helperTextInvalid={errorMessage}
        isValid={isValid}
        isRequired={required}
      >
        <PipelineResourceDropdown
          {...props}
          id={fieldId}
          selectedKey={field.value}
          dropDownClassName={cx({ 'dropdown--full-width': fullWidth })}
          actionItem={{
            actionTitle: 'Create New Pipeline Resource',
            actionKey: CREATE_PIPELINE_RESOURCE,
          }}
          autoselect
          onChange={handleChange}
          filterType={props.filterType}
        />
      </FormGroup>
      {field.value === CREATE_PIPELINE_RESOURCE && (
        <div style={{ marginTop: 'var(--pf-global--spacer--sm)' }}>
          <PipelinesResourceForm
            type={props.filterType}
            onClose={() => {
              setFieldValue(props.name, '');
              setStatus({ subFormsOpened: status.subFormsOpened - 1 });
            }}
            onCreate={(data) => {
              setTimeout(() => {
                setFieldValue(props.name, data.metadata.name);
                setStatus({ subFormsOpened: status.subFormsOpened - 1 });
              }, 500);
            }}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default PipelineResourceDropdownField;
