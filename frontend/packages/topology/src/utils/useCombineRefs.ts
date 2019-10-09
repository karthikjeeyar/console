import * as React from 'react';

const useCombineRefs = <RefType extends any>(...refs: React.Ref<RefType>[]): React.Ref<RefType> =>
  React.useCallback(
    (element: RefType): void =>
      refs.forEach((ref) => {
        if (ref) {
          if (typeof ref === 'function') {
            ref(element);
          } else {
            (ref as React.MutableRefObject<any>).current = element;
          }
        }
      }),
    [refs],
  );

export default useCombineRefs;
