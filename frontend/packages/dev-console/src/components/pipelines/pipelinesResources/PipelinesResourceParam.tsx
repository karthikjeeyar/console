import * as React from 'react';
import * as _ from 'lodash';
import { ActionGroup, ButtonVariant, Button } from '@patternfly/react-core';
import { CheckIcon, CloseIcon } from '@patternfly/react-icons';
import { useFormikContext, FormikValues } from 'formik';
import { ButtonBar } from '@console/internal/components/utils';
import PipelinesGitOptions from './PipelinesGitOptions';
import PipelinesImageOptions from './PipelinesImageOptions';
import PipelinesClusterOptions from './pipelinesClusterOptions';
import PipelinesStorageOptions from './pipelinesStorageOptions';
import './PipelinesResourceForm.scss';

export interface PipelinesResourceParamProps {
  type: string;
}

const PipelinesResourceParam: React.FC<PipelinesResourceParamProps> = ({ type }) => {
  const { handleSubmit, errors, handleReset, status, isSubmitting, dirty } = useFormikContext<
    FormikValues
  >();

  const resourceComponent = (): React.ReactElement => {
    switch (type) {
      case 'git':
        return <PipelinesGitOptions />;
      case 'image':
        return <PipelinesImageOptions />;
      case 'cluster':
        return <PipelinesClusterOptions />;
      case 'storage':
        return <PipelinesStorageOptions />;
      default:
        return null;
    }
  };

  return (
    <div className="pipelines-resource-form__content">
      {resourceComponent()}
      <ButtonBar errorMessage={status && status.submitError} inProgress={isSubmitting}>
        <ActionGroup className="pf-c-form pipelines-resource-form__btn-group">
          <Button
            type="submit"
            variant={ButtonVariant.link}
            onClick={handleSubmit}
            isDisabled={!dirty || !_.isEmpty(errors)}
          >
            <CheckIcon />
          </Button>
          <Button type="button" variant={ButtonVariant.link} onClick={handleReset}>
            <CloseIcon />
          </Button>
        </ActionGroup>
      </ButtonBar>
    </div>
  );
};

export default PipelinesResourceParam;
