'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketService } from './websocket';
import { WebSocketMessage, OrderUpdateMessage, ProductUpdateMessage, NotificationMessage, ChatMessage } from './websocket';
import { useAuth } from './auth';

interface WebSocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string, userId: string) => void;
  leaveRoom: (room: string, userId: string) => void;
  sendOrderUpdate: (orderId: string, status: string, userId: string) => void;
  sendProductUpdate: (productId: string, action: string, userId: string) => void;
  sendNotification: (title: string, message: string, userId: string) => void;
  sendChatMessage: (room: string, userId: string, content: string) => void;
  lastOrderUpdate: OrderUpdateMessage | null;
  lastProductUpdate: ProductUpdateMessage | null;
  lastNotification: NotificationMessage | null;
  lastChatMessage: ChatMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrderUpdate, setLastOrderUpdate] = useState<OrderUpdateMessage | null>(null);
  const [lastProductUpdate, setLastProductUpdate] = useState<ProductUpdateMessage | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationMessage | null>(null);
  const [lastChatMessage, setLastChatMessage] = useState<ChatMessage | null>(null);

  // Connect to WebSocket
  const connect = () => {
    if (isAuthenticated && user) {
      console.log('Connecting WebSocket for authenticated user:', user.id);
      webSocketService.connect();
    } else {
      console.log('Cannot connect WebSocket: user not authenticated');
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    console.log('Disconnecting WebSocket');
    webSocketService.disconnect();
  };

  // Join a room
  const joinRoom = (room: string, userId: string) => {
    if (isAuthenticated && user) {
      webSocketService.joinRoom(room, userId);
    }
  };

  // Leave a room
  const leaveRoom = (room: string, userId: string) => {
    if (isAuthenticated && user) {
      webSocketService.leaveRoom(room, userId);
    }
  };

  // Send order update
  const sendOrderUpdate = (orderId: string, status: string, userId: string) => {
    if (isAuthenticated && user) {
      webSocketService.sendOrderUpdate(orderId, status, userId);
    }
  };

  // Send product update
  const sendProductUpdate = (productId: string, action: string, userId: string) => {
    if (isAuthenticated && user) {
      webSocketService.sendProductUpdate(productId, action, userId);
    }
  };

  // Send notification
  const sendNotification = (title: string, message: string, userId: string) => {
    if (isAuthenticated && user) {
      webSocketService.sendNotification(userId, title, message);
    }
  };

  // Send chat message
  const sendChatMessage = (room: string, userId: string, content: string) => {
    if (isAuthenticated && user) {
      webSocketService.sendChatMessage(room, userId, content);
    }
  };

  // Effect for connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const connected = webSocketService.isSocketConnected();
      setIsConnected(connected);
    };

    // Initial status
    updateConnectionStatus();

    // Listen for connection changes
    const handleConnect = () => {
      console.log('WebSocket connected in provider');
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('WebSocket disconnected in provider');
      setIsConnected(false);
    };

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

  // Effect for auto-connect based on authentication status
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      console.log('Auto-connecting WebSocket for authenticated user');
      connect();
    } else if (!isAuthenticated) {
      console.log('User not authenticated, disconnecting WebSocket');
      disconnect();
    }

    return () => {
      // Cleanup on unmount
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, user]);

  // Effect for listening to WebSocket events
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent<OrderUpdateMessage>) => {
      setLastOrderUpdate(event.detail);
    };

    const handleProductUpdate = (event: CustomEvent<ProductUpdateMessage>) => {
      setLastProductUpdate(event.detail);
    };

    const handleNotification = (event: CustomEvent<NotificationMessage>) => {
      setLastNotification(event.detail);
    };

    const handleChatMessage = (event: CustomEvent<ChatMessage>) => {
      setLastChatMessage(event.detail);
    };

    // Add event listeners
    window.addEventListener('orderUpdate', handleOrderUpdate as EventListener);
    window.addEventListener('productUpdate', handleProductUpdate as EventListener);
    window.addEventListener('notification', handleNotification as EventListener);
    window.addEventListener('chatMessage', handleChatMessage as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate as EventListener);
      window.removeEventListener('productUpdate', handleProductUpdate as EventListener);
      window.removeEventListener('notification', handleNotification as EventListener);
      window.removeEventListener('chatMessage', handleChatMessage as EventListener);
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOrderUpdate,
    sendProductUpdate,
    sendNotification,
    sendChatMessage,
    lastOrderUpdate,
    lastProductUpdate,
    lastNotification,
    lastChatMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}