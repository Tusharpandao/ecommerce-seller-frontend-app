import { useEffect, useCallback, useState } from 'react';
import { webSocketService } from './websocket';
import { WebSocketMessage, OrderUpdateMessage, ProductUpdateMessage, NotificationMessage, ChatMessage } from './websocket';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  userId?: string;
  rooms?: string[];
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendOrderUpdate: (orderId: string, status: string) => void;
  sendProductUpdate: (productId: string, action: string) => void;
  sendNotification: (title: string, message: string) => void;
  sendChatMessage: (room: string, content: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, userId, rooms = [] } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket
  const connect = useCallback(() => {
    webSocketService.connect();
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Join a room
  const joinRoom = useCallback((room: string) => {
    if (userId) {
      webSocketService.joinRoom(room, userId);
    }
  }, [userId]);

  // Leave a room
  const leaveRoom = useCallback((room: string) => {
    if (userId) {
      webSocketService.leaveRoom(room, userId);
    }
  }, [userId]);

  // Send order update
  const sendOrderUpdate = useCallback((orderId: string, status: string) => {
    if (userId) {
      webSocketService.sendOrderUpdate(orderId, status, userId);
    }
  }, [userId]);

  // Send product update
  const sendProductUpdate = useCallback((productId: string, action: string) => {
    if (userId) {
      webSocketService.sendProductUpdate(productId, action, userId);
    }
  }, [userId]);

  // Send notification
  const sendNotification = useCallback((title: string, message: string) => {
    if (userId) {
      webSocketService.sendNotification(userId, title, message);
    }
  }, [userId]);

  // Send chat message
  const sendChatMessage = useCallback((room: string, content: string) => {
    if (userId) {
      webSocketService.sendChatMessage(room, userId, content);
    }
  }, [userId]);

  // Effect for connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(webSocketService.isSocketConnected());
    };

    // Initial status
    updateConnectionStatus();

    // Listen for connection changes
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const socket = webSocketService.getSocket();
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
    }

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Effect for auto-connect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Effect for joining rooms
  useEffect(() => {
    if (isConnected && userId && rooms.length > 0) {
      rooms.forEach(room => joinRoom(room));
    }
  }, [isConnected, userId, rooms, joinRoom]);

  return {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOrderUpdate,
    sendProductUpdate,
    sendNotification,
    sendChatMessage,
  };
}

// Hook for listening to specific WebSocket events
export function useWebSocketEvent<T extends WebSocketMessage>(
  eventType: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const handleEvent = (event: CustomEvent<T>) => {
      callback(event.detail);
    };

    window.addEventListener(eventType, handleEvent as EventListener);

    return () => {
      window.removeEventListener(eventType, handleEvent as EventListener);
    };
  }, [eventType, callback]);
}

// Specific event hooks
export function useOrderUpdates(callback: (data: OrderUpdateMessage) => void) {
  useWebSocketEvent<OrderUpdateMessage>('orderUpdate', callback);
}

export function useProductUpdates(callback: (data: ProductUpdateMessage) => void) {
  useWebSocketEvent<ProductUpdateMessage>('productUpdate', callback);
}

export function useNotifications(callback: (data: NotificationMessage) => void) {
  useWebSocketEvent<NotificationMessage>('notification', callback);
}

export function useChatMessages(callback: (data: ChatMessage) => void) {
  useWebSocketEvent<ChatMessage>('chatMessage', callback);
}
