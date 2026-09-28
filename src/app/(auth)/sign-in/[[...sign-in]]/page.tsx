'use client';

import { SignIn } from '@clerk/nextjs';

import { AuthShell } from '../../auth-shell';

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to your account"
      siblingPrompt="Don't have an account?"
      siblingHref="/sign-up"
      siblingLabel="Sign up"
    >
      <SignIn />
    </AuthShell>
  );
}
