import * as React from 'react';
import { FieldArray } from 'formik';
import { TextInputTypes } from '@patternfly/react-core';
import FormSection from '../../import/section/FormSection';
import { InputField } from '../../formik-fields';

export interface ParamertersSectionProps {
  parameters: {
    name: string;
    description?: string;
    default: string;
  }[];
}

export const PipelineParametersSection: React.FC<ParamertersSectionProps> = ({ parameters }) => (
  <FieldArray
    name="parameters"
    key="parameters-row"
    render={() => (
      <React.Fragment>
        {parameters.length > 0 && (
          <FormSection title="Parameters" fullWidth>
            {parameters.map((parameter, index) => (
              <div className="form-group" key={`${parameter}-row-group`}>
                <InputField
                  name={`parameters.${index}.default`}
                  type={TextInputTypes.text}
                  label={parameter.name}
                  helpText={parameter.description}
                  placeholder="Name"
                />
              </div>
            ))}
          </FormSection>
        )}
      </React.Fragment>
    )}
  />
);
