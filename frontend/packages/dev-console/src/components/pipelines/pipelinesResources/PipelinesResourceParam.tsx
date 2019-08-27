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
  const { errors, handleReset, status, isSubmitting, dirty, submitForm } = useFormikContext<
    FormikValues
  >();
  const handleCreateFormSubmit = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    submitForm();
  };
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
        <ActionGroup className="pf-c-form pf-c-form__actions--right pf-c-form__group--no-top-margin">
          <Button
            type="button"
            variant={ButtonVariant.link}
            onClick={handleCreateFormSubmit}
            isDisabled={!dirty || !_.isEmpty(errors)}
            className="pipelines-resource-form__action-btn"
            icon={<CheckIcon />}
          />
          <Button
            type="button"
            className="pipelines-resource-form__action-btn"
            variant={ButtonVariant.plain}
            onClick={handleReset}
          >
            <CloseIcon />
          </Button>
        </ActionGroup>
      </ButtonBar>
    </div>
  );
};

export default PipelinesResourceParam;
