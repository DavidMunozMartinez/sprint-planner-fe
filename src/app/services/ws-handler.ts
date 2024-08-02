import { Injectable, inject } from "@angular/core";
import { WSEventsHandler, WSMessage } from "./ws-events-handler";
import { Router } from "@angular/router";
import { PROD_WS } from "../constants";
import { RoomsService } from "./rooms.service";

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
  reconnectAttempts = 0;
  maxReconnectAttempts = 10;
  userId: string = 'null';
  roomId: string = 'null';


  private router = inject(Router)
  private handler = inject(WSEventsHandler)
  private roomsService = inject(RoomsService)

  private subscriptions: { [key in keyof WSEventsHandler]?: (typeof this.handler[keyof WSEventsHandler])[] } = {};

  init(userId: string, roomId: string) {
    this.userId = userId;
    this.roomId = roomId;
    this.connect();
  }

  private connect() {
    // If there's an existing WebSocket instance, clean it up
    if (this.ws) {
      this.ws.removeEventListener('message', this.onMessage);
      this.ws.removeEventListener('open', this.onOpen);
      this.ws.removeEventListener('close', this.onClose);
      this.ws.close(); // Close the old WebSocket connection
    }

    this.ws = new WebSocket(
      `${PROD_WS}/ws?room=${this.roomId}&id=${this.userId}`
    );

    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('close', this.onClose);
  }

  private onMessage = (event: MessageEvent) => {
    const data: WSEvent = JSON.parse(event.data);
    this.dispatch(data);
  };

  private onOpen = async () => {
    this.connected = true;
    this.reconnectAttempts = 0; // Reset the counter on successful connection
    this.router.navigate(['room'])
    // Refresh room data if needed
    const serverRoom = await this.roomsService.getRoomData(this.roomId);
    this.roomsService.setServerRoomData(serverRoom);
  };

  private onClose = () => {
    this.connected = false;
    console.log('Something went wrong with WebSockets');
    this.handleReconnect();
  };

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.connected) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 1000); // Wait 1 second before attempting to reconnect
    } else {
      console.log('Max reconnect attempts reached. Giving up.');
    }
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