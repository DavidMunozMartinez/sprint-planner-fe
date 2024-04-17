import { Injectable, inject } from "@angular/core";
import { WSEventsHandler, WSMessage } from "./we-events-handler";
import { Router } from "@angular/router";

type WSEvent = {
  message: WSMessage;
  type: keyof WSEventsHandler
  from: string,
  room: string;
}

@Injectable({
  providedIn: 'root'
})
export class WSHandler {

  private router = inject(Router)
  private handler = inject(WSEventsHandler)

  private subscriptions: { [key in keyof WSEventsHandler]?: (typeof this.handler[keyof WSEventsHandler])[] } = {};
  
  initListeners(ws: WebSocket) {
    if (!ws) return;

    ws.addEventListener('message', (event) => {
      const data: WSEvent = JSON.parse(event.data);
      this.dispatch(data);
    });
    ws.addEventListener('open', () => {
      this.router.navigate(['room'])
    });
    ws.addEventListener('close', () => {
      console.log('Something went wrong')
    });
  }

  dispatch(event: WSEvent) {
    this.handler[event.type](event.message);

    if (!this.subscriptions[event.type]) return;
    this.subscriptions[event.type]?.forEach((fn) => {
      fn(event.message);
    })
  }

  on<T extends keyof WSEventsHandler>(event: T, fn: typeof this.handler[T]) {
    if (!this.subscriptions[event]) {
      this.subscriptions[event] = [];
    }
  
    this.subscriptions[event]?.push(fn);
  }
}