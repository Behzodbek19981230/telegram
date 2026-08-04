import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { MobileFrame } from './components/layout/MobileFrame.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ChatListPage } from './pages/ChatListPage.jsx';
import { ContactsPage } from './pages/ContactsPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <MobileFrame>
            <CallProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/chats"
                  element={
                    <ProtectedRoute>
                      <ChatListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <ProtectedRoute>
                      <ContactsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:chatId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/chats" replace />} />
              </Routes>
            </CallProvider>
          </MobileFrame>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
