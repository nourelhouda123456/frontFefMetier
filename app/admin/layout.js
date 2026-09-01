import { AuthProvider } from '../../contexts/AuthContext';

export const metadata = {
  title: 'Administration | metierRef',
  description: 'Interface de gestion des métiers — metierRef',
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
