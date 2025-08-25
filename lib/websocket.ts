import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface OrderUpdateMessage extends WebSocketMessage {
  type: 'ORDER_UPDATE' | 'ORDER_STATUS_UPDATE';
  orderId: string;
  status: string;
  updatedBy: string;
  timestamp: string;
}

export interface ProductUpdateMessage extends WebSocketMessage {
  type: 'PRODUCT_UPDATE';
  productId: string;
  action: string;
  updatedBy: string;
  timestamp: string;
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'NOTIFICATION' | 'SYSTEM_NOTIFICATION';
  title: string;
  message: string;
  timestamp: string;
  id: string;
}

export interface ChatMessage extends WebSocketMessage {
  type: 'CHAT_MESSAGE';
  userId: string;
  content: string;
  timestamp: string;
  messageId: string;
}

class WebSocketService {
  private socket: any = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isInitialized = false;

  constructor() {
    // Don't auto-initialize in constructor
  }

  private initializeSocket() {
    if (this.isInitialized) return;
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:9092';
    
    try {
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: false, // Disable auto-reconnection
        timeout: 20000,
        forceNew: false, // Don't force new connections
        upgrade: true,
        rememberUpgrade: false
      });

      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      // Only attempt reconnect for server-initiated disconnects
      if (reason === 'io server disconnect') {
        console.log('Server disconnected, attempting reconnect...');
        setTimeout(() => {
          if (this.socket) {
            this.socket.connect();
          }
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('welcome', (data: WebSocketMessage) => {
      console.log('Welcome message received:', data);
    });

    // Handle order updates
    this.socket.on('order_notification', (data: OrderUpdateMessage) => {
      this.handleOrderUpdate(data);
    });

    this.socket.on('order_status_update', (data: OrderUpdateMessage) => {
      this.handleOrderUpdate(data);
    });

    // Handle product updates
    this.socket.on('product_notification', (data: ProductUpdateMessage) => {
      this.handleProductUpdate(data);
    });

    this.socket.on('product_update', (data: ProductUpdateMessage) => {
      this.handleProductUpdate(data);
    });

    // Handle notifications
    this.socket.on('notification', (data: NotificationMessage) => {
      this.handleNotification(data);
    });

    this.socket.on('system_notification', (data: NotificationMessage) => {
      this.handleNotification(data);
    });

    // Handle chat messages
    this.socket.on('chat_message', (data: ChatMessage) => {
      this.handleChatMessage(data);
    });

    // Handle room notifications
    this.socket.on('room_notification', (data: WebSocketMessage) => {
      console.log('Room notification:', data);
    });
  }

  private handleOrderUpdate(data: OrderUpdateMessage) {
    console.log('Order update received:', data);
    
    // Show toast notification
    toast.success(`Order ${data.orderId} status updated to ${data.status}`, {
      duration: 5000,
    });

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
  }

  private handleProductUpdate(data: ProductUpdateMessage) {
    console.log('Product update received:', data);
    
    // Show toast notification
    toast.success(`Product ${data.productId} ${data.action}`, {
      duration: 5000,
    });

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('productUpdate', { detail: data }));
  }

  private handleNotification(data: NotificationMessage) {
    console.log('Notification received:', data);
    
    // Show toast notification
    toast(data.message, {
      duration: 5000,
      icon: '🔔',
    });

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('notification', { detail: data }));
  }

  private handleChatMessage(data: ChatMessage) {
    console.log('Chat message received:', data);
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
  }

  // Public methods
  connect() {
    if (!this.isInitialized) {
      this.initializeSocket();
    }
    
    if (this.socket && !this.isConnected) {
      console.log('Attempting to connect WebSocket...');
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      console.log('Disconnecting WebSocket...');
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  joinRoom(room: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', { room, userId });
    }
  }

  leaveRoom(room: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', { room, userId });
    }
  }

  sendOrderUpdate(orderId: string, status: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order_update', { orderId, status, userId });
    }
  }

  sendProductUpdate(productId: string, action: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('product_update', { productId, action, userId });
    }
  }

  sendNotification(userId: string, title: string, message: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification', { userId, title, message });
    }
  }

  sendChatMessage(room: string, userId: string, content: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', { room, userId, content });
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getSocket(): any {
    return this.socket;
  }

  // Cleanup method
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Export the class for testing purposes
export default WebSocketService;