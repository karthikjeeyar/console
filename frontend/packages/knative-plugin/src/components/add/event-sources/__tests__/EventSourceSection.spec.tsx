import * as React from 'react';
import { shallow } from 'enzyme';
import { FormikValues } from 'formik';
import AppSection from '@console/dev-console/src/components/import/app/AppSection';
import EventSourceSection from '../EventSourceSection';
import CronJobSection from '../CronJobSection';
import SinkSection from '../SinkSection';
import { getDefaultEventingData } from '../../../../utils/__tests__/knative-serving-data';
import { EventSources } from '../../import-types';

const mockEventingData = getDefaultEventingData(EventSources.CronJobSource);

jest.mock('formik', () => ({
  useFormikContext: jest.fn(() => ({
    setFieldValue: jest.fn(),
    setFieldTouched: jest.fn(),
    values: mockEventingData as FormikValues,
  })),
}));

describe('EventSource Form', () => {
  const projects = { loaded: true, loadError: '', data: [] };
  const namespace = 'myapp';

  it('should render SinkSection, AppSection for CronjobSource', () => {
    const eventSourceSection = shallow(
      <EventSourceSection projects={projects} namespace={namespace} />,
    );
    expect(eventSourceSection.find(SinkSection)).toHaveLength(1);
    expect(eventSourceSection.find(AppSection)).toHaveLength(1);
  });

  it('should render CronJobSection for cronJob source', () => {
    const eventSourceSection = shallow(
      <EventSourceSection namespace={namespace} projects={projects} />,
    );
    expect(eventSourceSection.find(CronJobSection)).toHaveLength(1);
  });
});
