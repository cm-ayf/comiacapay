export default class RefetchController extends EventTarget {}

type Listener<E extends Event> =
  | ((ev: E) => any)
  | { handleEvent(ev: E): any }
  | null;

export default interface RefetchController {
  addEventListener<K extends keyof RefetchControllerEventMap>(
    type: K,
    listener: Listener<RefetchControllerEventMap[K]>,
  ): void;
  removeEventListener<K extends keyof RefetchControllerEventMap>(
    type: K,
    listener: Listener<RefetchControllerEventMap[K]>,
  ): void;
  dispatchEvent(event: RefetchControllerEvent): boolean;
}

interface RefetchControllerEventMap {
  refetch: RefetchEvent;
}

type RefetchControllerEvent =
  RefetchControllerEventMap[keyof RefetchControllerEventMap];

export class RefetchEvent extends Event {
  eventId: string;

  constructor(eventId: string) {
    super("refetch");
    this.eventId = eventId;
  }
}
