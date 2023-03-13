import { curry } from "ramda";

export type EventMessage = string;

const createEvent = (eventName: string, type: EventMessage, value: any) =>
  new CustomEvent(eventName, { detail: { type, value } });

export const dispatch = curry((parent: HTMLElement, eventName: string, type: EventMessage, value: any) =>
  parent.dispatchEvent(createEvent(eventName, type, value)));