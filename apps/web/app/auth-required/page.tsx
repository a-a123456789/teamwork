import { PageStatusCard } from '@/components/app-shell/page-state';

export default function AuthRequiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <PageStatusCard
        title="Authentication required"
        description="The frontend shell is wired to the real backend auth flow. Connect your login screen to store an access token, then reopen the app."
        tone="warning"
      />
    </main>
  );
}
