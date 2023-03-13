export type MicrofeParams = {
  target: HTMLElement;
  parent: HTMLElement;
  baseRoute: string;
  eventName: string;
  defaultData?: any;
}

export type EventType = {
  message: 'lang';
  body: {
    key: string,
    value: any
  };
};
