import { Injectable, inject } from "@angular/core";
import { WSEventsHandler, WSMessage } from "./we-events-handler";
import { Router } from "@angular/router";
import { SERVER } from "../constants";

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

  ws: WebSocket | null = null;
  connected = false;

  private router = inject(Router)
  private handler = inject(WSEventsHandler)

  private subscriptions: { [key in keyof WSEventsHandler]?: (typeof this.handler[keyof WSEventsHandler])[] } = {};

  init(userId: string, roomId: string) {
    this.ws = new WebSocket(
      `${SERVER}/ws?room=${roomId}&id=${userId}`
    );

    this.ws.addEventListener('message', (event) => {
      const data: WSEvent = JSON.parse(event.data);
      this.dispatch(data);
    });
    this.ws.addEventListener('open', () => {
      this.connected = true;
    });
    this.ws.addEventListener('close', () => {
      this.connected = false;
      console.log('Something went wrong with WebSockets')
    });
  }
  
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