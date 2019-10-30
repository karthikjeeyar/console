import * as React from 'react';
import * as _ from 'lodash';
import { action } from 'mobx';
import { observer } from 'mobx-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore-next-line
import ReactMeasure from 'react-measure';
// TODO move to this package
import SvgDefsProvider from '@console/dev-console/src/components/svg/SvgDefsProvider';
import ControllerContext from './utils/ControllerContext';
import Visualization from './Visualization';
import EntityWidget from './widgets/EntityWidget';
import { State } from './types';

interface VisualizationWidgetProps {
  visualization: Visualization;
  state?: State;
}

function stopEvent(e: React.MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

const VisualizationWidget: React.FC<VisualizationWidgetProps> = ({ visualization, state }) => {
  React.useEffect(() => {
    state && visualization.setState(state);
  }, [visualization, state]);

  const onMeasure = React.useMemo(
    () =>
      _.debounce<any>(
        action((contentRect: { client: { width: number; height: number } }) => {
          visualization.getGraph().setBounds(
            visualization
              .getGraph()
              .getBounds()
              .clone()
              .setSize(contentRect.client.width, contentRect.client.height),
          );
        }),
        100,
        { leading: true, trailing: true },
      ),
    [visualization],
  );

  // dispose of onMesure
  React.useEffect(() => () => onMeasure.cancel(), [onMeasure]);

  return (
    <ControllerContext.Provider value={visualization}>
      <ReactMeasure client onResize={onMeasure}>
        {({ measureRef }: { measureRef: React.LegacyRef<any> }) => (
          // render an outer div because react-measure doesn't seem to fire events properly on svg resize
          <div
            style={{
              width: '100%',
              height: '100%',
              flexGrow: 1,
              flexShrink: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
            ref={measureRef}
          >
            <svg
              style={{
                width: '100%',
                height: '100%',
              }}
              onContextMenu={stopEvent}
            >
              <SvgDefsProvider>
                <EntityWidget entity={visualization.getGraph()} />
              </SvgDefsProvider>
            </svg>
          </div>
        )}
      </ReactMeasure>
    </ControllerContext.Provider>
  );
};

export default observer(VisualizationWidget);
