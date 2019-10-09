import * as React from 'react';

const combineRefs = (refsArray: React.LegacyRef<any>[]): ((ref: any) => void) => {
  return (ref: any) => {
    if (refsArray) {
      refsArray.forEach((refCB: (element: any) => void) => {
        if (refCB) {
          refCB(ref);
        }
      });
    }
  };
};

export { combineRefs };
