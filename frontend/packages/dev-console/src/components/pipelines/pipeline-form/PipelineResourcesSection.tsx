import * as React from 'react';
import { FieldArray } from 'formik';
import * as _ from 'lodash';
import FormSection from '../../import/section/FormSection';
import { PipelineResource } from '../../../utils/pipeline-augment';
import PipelineResourceDropdownField from './PipelineResourceDropdownField';

export interface ResourceSectionProps {
  resources: {
    types: string[];
    git?: PipelineResource[];
    image?: PipelineResource[];
    cluster?: PipelineResource[];
    storage?: PipelineResource[];
  };
}

const PipelineResourcesSection: React.FC<ResourceSectionProps> = ({ resources }) => {
  return (
    resources.types.length > 0 && (
      <React.Fragment>
        {resources.types.map((type, index) => (
          <FieldArray
            name={type}
            // eslint-disable-next-line react/no-array-index-key
            key={`${type}-resource-${index}-row`}
            render={() => (
              <React.Fragment>
                {resources[type].length > 0 && (
                  <FormSection title={`${_.capitalize(type)} Resources`} fullWidth>
                    <div
                      className="form-group"
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${type}-resource-row-group-${index}`}
                    >
                      {resources[type].map((resource, resIndex) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div className="form-group" key={`resource-${type}-${resIndex}-name`}>
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

export default PipelineResourcesSection;
