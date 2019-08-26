import * as React from 'react';
import { FieldArray } from 'formik';
import * as _ from 'lodash-es';
import FormSection from '../../import/section/FormSection';
import PipelineResourceDropdownField from '../../formik-fields/PipelineResourceDropdownField';
import { PipelineResource } from '../../../utils/pipeline-augment';

export interface ResourceSectionProps {
  resources: {
    types: string[];
    git?: PipelineResource[];
    image?: PipelineResource[];
    cluster?: PipelineResource[];
    storage?: PipelineResource[];
  };
}

export const PipelineResourcesSection: React.FC<ResourceSectionProps> = ({ resources }) => {
  return (
    resources.types.length > 0 && (
      <React.Fragment>
        {resources.types.map((type, index) => (
          <FieldArray
            name={type}
            key={`${type}-resource-${index}-row`}
            render={(helpers) => (
              <React.Fragment>
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
              </React.Fragment>
            )}
          />
        ))}
      </React.Fragment>
    )
  );
};
