import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AdminRoute } from './components/layout/AdminRoute.jsx';
import { MobileFrame } from './components/layout/MobileFrame.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ChatListPage } from './pages/ChatListPage.jsx';
import { ContactsPage } from './pages/ContactsPage.jsx';
import { CreateGroupPage } from './pages/CreateGroupPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <MobileFrame>
              <CallProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
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
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/new-group"
                    element={
                      <ProtectedRoute>
                        <CreateGroupPage />
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
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminRoute>
                          <AdminPage />
                        </AdminRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/chats" replace />} />
                </Routes>
              </CallProvider>
            </MobileFrame>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
