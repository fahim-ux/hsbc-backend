import { ChatInterface } from '@/components/ChatInterface';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ChatInterface />
      </ProtectedRoute>
    </AuthProvider>
  );
}
