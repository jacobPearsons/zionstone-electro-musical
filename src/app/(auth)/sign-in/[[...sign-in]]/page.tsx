'use client';

import { SignIn } from '@clerk/nextjs';
import { Music } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🎸</span>
            <span className="text-2xl font-bold">ElectroMuscial Store</span>
          </Link>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Welcome Back to ElectroMuscial Store</h1>
          <p className="text-xl text-yellow-200">
            Your one-stop shop for premium musical instruments and studio equipment.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <span>Track your orders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span>Save your favorite gear</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>2-Day shipping on eligible items</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-yellow-300">
          © 2026 ElectroMuscial Store. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <span className="text-3xl">🎸</span>
              <span className="text-2xl font-bold text-yellow-600">ElectroMuscial Store</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold underline">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-yellow-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
          
          <SignIn />
        </div>
      </div>Sign up
    </div>
  );
}
