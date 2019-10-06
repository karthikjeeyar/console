import { createContext } from 'react';
import { ElementEntity } from '../types';

const EntityContext = createContext<ElementEntity>(undefined as any);

export default EntityContext;
