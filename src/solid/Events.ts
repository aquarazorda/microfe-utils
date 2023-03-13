import { createMemo, createSignal } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import { match } from 'ts-pattern';

// TODO MOVE THIS OUT ------------------------------
export type EventsStoreType = {
  lang: Record<string, Record<string, string>>;
  variable: Record<string, any>;
  subscribed: Record<string, boolean>;
}

type StoreType = [get: EventsStoreType, set: SetStoreFunction<EventsStoreType>];

interface ToParentEvent {
  type: 'lang' | 'variable' | 'execute' | 'redirect' | 'heightChange' | 'pushState' | 'onLoad' | 'scrollToTop';
  value: any;
}

export type EventMessage = ToParentEvent['type'] | 'destroyed';

interface FromParentEvent {
  body: any,
  message: EventMessage
}

export const createEvent = (eventName: string, type: EventMessage, value: any) => new CustomEvent(eventName, { detail: { type, value } });

// ------------------------------

const listener = (store: StoreType) => (e: Event) => {
  const { message, body } = (e as CustomEvent<FromParentEvent>).detail;
  const [state, setState] = store;

  match(message)
    .with('variable', (t) => setState(t, body.key, body.value))
    .with('lang', (t) => setState(t, body.curLang, body.key, body.value))
    .with('destroyed', cleanupFn())
    .otherwise(() => console.warn(`Unknown message type: ${message}`));
};

const [cleanupFn, setCleanupFn] = createSignal(() => {});

export const createListener = (eventName: string, target: HTMLElement, store: StoreType) => {
  target.addEventListener(eventName, listener(store));
  setCleanupFn(() => () => target.removeEventListener(eventName, listener(store)));
};

export const createDispatcher = (eventName: string, parent: HTMLElement, store: StoreType) => {
  const [state, setState] = store;

  const dispatchEvent = (type: EventMessage, value: any) => {
    if (state.subscribed[value]) return true;

    parent.dispatchEvent(createEvent(eventName, type, value));
    setState('subscribed', value.key, true);
    return false;
  };

  const dispatchAndGrab = (type: 'lang' | 'variable', value: any) => {
    if (value.subscriber && !state[type][value.key] || !value.subscriber) dispatchEvent(type, value);

    return createMemo<any>(() => state[type][value?.key || value]);
  };

  const dispatchAndGrabLang = (curLang: string, key: string) => {
    if (!state.lang?.[curLang]?.[key]) dispatchEvent('lang', { key });

    return createMemo<any>(() => state.lang?.[curLang]?.[key]);
  };

  return {
    getLang: dispatchAndGrabLang,
    getVariable: (value: {
      key: string,
      methodStringPointer: string,
      subscriber: boolean
    }) => dispatchAndGrab('variable', value),
    currLang: dispatchAndGrab('variable', {
      key: 'currentLanguage',
      methodStringPointer: 'LanguageService.currentLanguage',
      subscriber: true,
    }),
    subToUser: () => {
      dispatchAndGrab('variable', {
        key: 'userId',
        methodStringPointer: 'UserService.userId',
        subscriber: true,
      });

      dispatchAndGrab('variable', {
        key: 'isLoggedIn',
        methodStringPointer: 'UserService.userSessionStatus',
        subscriber: true,
      });
    },
    execute: (value: any) => dispatchEvent('execute', value),
  };
};
