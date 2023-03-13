import { createContext, useContext } from 'solid-js';
import { createDispatcher } from './Events';

export const ExternalContext = createContext<ReturnType<typeof createDispatcher>>({
  getLang: () => () => () => '',
  getVariable: () => () => '',
  currLang: () => () => 'ka',
  execute: () => false,
  subToUser: () => {},
});

export const useExternal = () => useContext(ExternalContext);