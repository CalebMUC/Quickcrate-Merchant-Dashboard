import { LoginForm } from '@/components/features/auth/LoginForm';
import { DebugPanel } from '@/components/debug/DebugPanel';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <DebugPanel />
    </>
  );
}