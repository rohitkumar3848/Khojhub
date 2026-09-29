import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connected = false;
  }

  connect(onConnectedCallback) {
    if (this.client && this.connected) {
      if (onConnectedCallback) onConnectedCallback();
      return;
    }

    const socketUrl = window.location.origin.includes('localhost:5173')
      ? 'http://localhost:8080/ws'
      : '/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => { },
    });

    this.client.onConnect = () => {
      this.connected = true;
      if (onConnectedCallback) onConnectedCallback();
    };

    this.client.onDisconnect = () => {
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
      console.warn('STOMP error:', frame);
    };

    this.client.activate();
  }

  subscribeToConversation(conversationId, onMessageReceived) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this.subscribeToConversation(conversationId, onMessageReceived);
      });
      return () => { };
    }

    const destination = `/topic/conversation/${conversationId}`;
    const sub = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessageReceived(payload);
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }

  subscribeToNotifications(userId, onNotificationReceived) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this.subscribeToNotifications(userId, onNotificationReceived);
      });
      return () => { };
    }

    const destination = `/topic/notifications/${userId}`;
    const sub = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        onNotificationReceived(payload);
      } catch (err) {
        console.error('Failed to parse notification message', err);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }

  sendMessage(conversationId, senderId, text) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          conversationId,
          senderId,
          message: text,
        }),
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
