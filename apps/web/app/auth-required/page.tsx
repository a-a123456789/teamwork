import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthRedirectGuard } from '@/components/auth/auth-redirect-guard';
import { SignInForm } from '@/components/auth/sign-in-form';

export default function AuthRequiredPage() {
  return (
    <AuthRedirectGuard>
      <AuthLayout
        title="TeamWork"
        subtitle="Sign in to your account"
        helperText="Don't have an account?"
        helperHref="/sign-up"
        helperLabel="Sign up"
      >
        <SignInForm />
      </AuthLayout>
    </AuthRedirectGuard>
  );
}
