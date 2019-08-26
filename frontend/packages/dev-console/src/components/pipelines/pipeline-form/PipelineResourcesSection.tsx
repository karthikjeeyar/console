import * as React from 'react';
import { FieldArray } from 'formik';
import * as _ from 'lodash-es';
import FormSection from '../../import/section/FormSection';
import PipelineResourceDropdownField from '../../formik-fields/PipelineResourceDropdownField';

// add Resource types
export const PipelineResourcesSection: React.FC<any> = ({ resources }) => {
  return (
    resources.types.length > 0 && (
      <>
        {resources.types.map((type, index) => (
          <FieldArray
            name={type}
            key={`${type}-resource-${index}-row`}
            render={(helpers) => (
              <>
                {resources[type].length > 0 && (
                  <FormSection title={`${_.capitalize(type)} Resources`} fullWidth>
                    <div className="form-group" key={`${type}-resource-row-group-${index}`}>
                      {resources[type].map((resource, index) => (
                        <div className="form-group" key={`resource-${type}-${index}-name`}>
                          <PipelineResourceDropdownField
                            name={`resources.${resource.index}.resourceRef.name`}
                            label={resource.name}
                            fullWidth
                            required
                            filterType={type}
                          />
                        </div>
                      ))}
                    </div>
                  </FormSection>
                )}
              </>
            )}
          />
        ))}
      </>
    )
  );
};
