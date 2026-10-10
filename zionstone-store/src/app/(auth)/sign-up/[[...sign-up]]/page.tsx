'use client';

import { SignUp } from '@clerk/nextjs';

import { AuthShell } from '../../auth-shell';

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      siblingPrompt="Already have an account?"
      siblingHref="/sign-in"
      siblingLabel="Sign in"
    >
      <SignUp />
    </AuthShell>
  );
}
