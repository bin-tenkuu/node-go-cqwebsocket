import EventEmitter from "events";
import {CQEvent, ErrorEventHandle, HandleEventParam, HandleEventType, SocketHandle} from "./Interfaces";

export class CQEventBus extends EventEmitter {
  declare _events: { [key in string]: Function | Function[] };
  public _errorEvent: ErrorEventHandle;
  
  constructor() {
    super({captureRejections: true});
    this.setMaxListeners(0);
    this._errorEvent = (e) => {
      console.error(e);
    };
  }
  
  addListener<T extends HandleEventType>(type: T, handler: SocketHandle[T]): this {
    return super.addListener(type, handler);
  }
  
  on<T extends HandleEventType>(type: T, handler: SocketHandle[T]): this {
    return super.on(type, handler);
  }
  
  once<T extends HandleEventType>(type: T, handler: SocketHandle[T]): this {
    return super.once(type, handler);
  }
  
  prependListener<T extends HandleEventType>(type: T, listener: SocketHandle[T]): this {
    return super.prependListener(type, listener);
  }
  
  prependOnceListener<T extends HandleEventType>(type: T, listener: SocketHandle[T]): this {
    return super.prependOnceListener(type, listener);
  }
  
  removeListener<T extends HandleEventType>(type: T, handler: SocketHandle[T]): this {
    return super.removeListener(type, handler);
  }
  
  off<T extends HandleEventType>(type: T, handler: SocketHandle[T]): this {
    return super.off(type, handler);
  }
  
  removeAllListeners(type?: HandleEventType): this {
    return super.removeAllListeners(type);
  }
  
  listeners(type: HandleEventType): Function[] {
    return super.listeners(type);
  }
  
  rawListeners(type: HandleEventType): Function[] {
    return super.rawListeners(type);
  }
  
  emit<T extends HandleEventType>(type: T, ...args: HandleEventParam<T>): boolean {
    let event = new CQEvent();
    const handlers: Function | Function[] | undefined = this._events[type];
    if (handlers === undefined) return false;
    if (typeof handlers === "function") {
      try {
        handlers(event, ...args);
      } catch (e) {
        Reflect.deleteProperty(this._events, type);
        this._errorEvent(e, type, handlers as SocketHandle[T]);
      }
    } else {
      let len = handlers.length;
      for (let i = 0; i < len; i++) {
        try {
          handlers[i](event, ...args);
          if (event.isCanceled) {
            break;
          }
        } catch (e) {
          let func = handlers.splice(i, 1)[0] as SocketHandle[T];
          this._errorEvent(e, type, func);
          len--;
          i--;
        }
      }
    }
    return true;
  }
  
  listenerCount(type: HandleEventType): number {
    return super.listenerCount(type);
  }
  
  handle<T extends HandleEventType>(type: T, ...args: HandleEventParam<T>): boolean {
    return this.emit(type, ...args);
  }
}


