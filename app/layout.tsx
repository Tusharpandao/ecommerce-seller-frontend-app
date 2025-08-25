import type { Metadata } from "next";
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { QueryProvider } from '@/lib/query-provider';
import { WebSocketProvider } from '@/lib/websocket-provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Commerce Seller/Admin Dashboard',
  description: 'Seller and Admin dashboard for E-Commerce Platform',
  keywords: ['ecommerce', 'seller', 'admin', 'dashboard'],
  authors: [{ name: 'E-Commerce Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <WebSocketProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            </WebSocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
