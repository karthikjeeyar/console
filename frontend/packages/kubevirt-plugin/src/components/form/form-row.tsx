import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingInline } from '@console/internal/components/utils';
import { ValidationErrorType, ValidationObject } from '@console/shared';
import { ExpandableSection, FormGroup, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { preventDefault } from './utils';

import './form-row.scss';

export const FormRow: React.FC<FormRowProps> = ({
  fieldId,
  title,
  help,
  isHidden,
  isRequired,
  isLoading,
  validationMessage,
  validationType,
  validation,
  children,
  className,
  rawErrorMessage,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const onToggle = React.useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);
  if (isHidden) {
    return null;
  }
  const type = (validation && validation.type) || validationType;
  const message = validation?.messageKey ? t(validation.messageKey) : validationMessage;
  const errorExpandable = rawErrorMessage && (
    <ExpandableSection
      toggleText={isExpanded ? t('kubevirt-plugin~Less Info') : t('kubevirt-plugin~More Info')}
      onToggle={onToggle}
      isExpanded={isExpanded}
    >
      {t('kubevirt-plugin~Error: {{ rawErrorMessage }}', { rawErrorMessage })}
    </ExpandableSection>
  );
  const errorExpandablePositioning = (
    <div>
      <span className="kubevirt-fort-row__invalid-message-container">{message}</span>
      {errorExpandable}
    </div>
  );

  return (
    <FormGroup
      label={title}
      isRequired={isRequired}
      fieldId={fieldId}
      validated={type !== ValidationErrorType.Error ? 'default' : 'error'}
      helperTextInvalid={
        type === ValidationErrorType.Error ? errorExpandablePositioning : undefined
      }
      helperText={
        type === ValidationErrorType.Info || type === ValidationErrorType.Warn ? message : undefined
      }
      className={className}
      labelIcon={
        help && (
          <Popover
            position={PopoverPosition.right}
            aria-label={`${fieldId} help`}
            bodyContent={help}
          >
            <button
              type="button"
              onClick={preventDefault}
              className="pf-c-form__group-label-help"
              aria-label={`${fieldId} help`}
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        )
      }
    >
      {isLoading && (
        <span className="kubevirt-form-row__loading-container">
          <LoadingInline />
        </span>
      )}
      {children}
    </FormGroup>
  );
};

type FormRowProps = {
  fieldId: string;
  title?: string;
  help?: React.ReactNode;
  helpTitle?: string;
  isHidden?: boolean;
  isRequired?: boolean;
  isLoading?: boolean;
  validationMessage?: string;
  validationType?: ValidationErrorType;
  validation?: ValidationObject;
  children?: React.ReactNode;
  className?: string;
  rawErrorMessage?: React.ReactNode;
};
