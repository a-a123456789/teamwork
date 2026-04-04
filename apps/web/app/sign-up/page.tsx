import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthRedirectGuard } from '@/components/auth/auth-redirect-guard';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <AuthRedirectGuard>
      <AuthLayout
        title="TeamWork"
        subtitle="Create your account"
        helperText="Already have an account?"
        helperHref="/auth-required"
        helperLabel="Sign in"
      >
        <SignUpForm />
      </AuthLayout>
    </AuthRedirectGuard>
  );
}
