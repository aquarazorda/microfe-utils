import React, { useCallback } from 'react';
import { createContext, useEffect, useMemo, useState } from "react";
import { EventType, MicrofeParams } from "../../types";
import { dispatch } from "./utils";

type ContextType = {
  lang: Record<string, string>;
  sendEvent: (type: string, value: any) => void;
  subscribed: boolean;
}

export const EventsContext = createContext<Partial<ContextType>>({});

interface ProviderInput<T> {
  children: React.ReactNode;
  params: MicrofeParams;
  defaultState: T;
}

export const EventsProvider = ({ children, params, defaultState }: ProviderInput<any>) => {
  const { parent, target, eventName } = params;
  const [subscribed, setSubscribed] = useState(false);
  const [state, setState] = useState<ContextType>(defaultState);

  const sendEvent = useCallback(() => dispatch(parent, eventName), [parent, eventName]);

  const providerValue = useMemo(() => ({
    ...state,
    subscribed,
    sendEvent
  }), [parent, eventName, subscribed, state]);

  // Main listener, collecting all values from parent
  useEffect(() => {
    const listener = (e: Event) => {
      const { message, body } = (e as CustomEvent<EventType>).detail;

      setState({
        ...state,
        [message]: { ...state[message], ...{ [body.key]: body.value } }
      })
    }

    target.addEventListener(eventName, listener);
    setSubscribed(true);

    return () => target.removeEventListener(eventName, listener);
  }, []);

  return <EventsContext.Provider value={providerValue}>
    {children}
  </EventsContext.Provider>;
}