'use client';

import React, { useState } from 'react';
import { LinkButton } from '@/components/ui/LinkButton';
import { OAuthSocialButton } from '@/components/ui/OAuthSocialButton';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import Logo from '../../components/ui/Logo';
import Link from 'next/link';
import Image from 'next/image';

import { AuthForm } from '@/src/types/auth';
import { validateEmail, validatePassword, validateTextField } from '@/src/lib/utils/validation';
import { showErrorToast } from '../../components/ui/ToastWrapper';
import { useAuthStore } from '@/src/stores/authStore';

function AuthPage({
  authType,
  onContinue,
}: {
  authType: 'signup' | 'signin';
  onContinue: (authForm: AuthForm) => Promise<void>;
}) {
  const authStore = useAuthStore();
  const [authForm, setAuthForm] = useState<AuthForm>({ email: '', username: '', password: '' });

  const onInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.id]: e.target.value });
  };

  const onGoogleClick = () => {};

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const validations = [validateEmail(authForm.email)];

    if (authType === 'signup') {
      validations.push(validatePassword(authForm.password));
      validations.push(validateTextField(authForm.username, 'username', { required: true }));
    }

    for (const validation of validations) {
      if (!validation.validated) {
        showErrorToast(null, validation.msg);
        return;
      }
    }

    console.log("calling onContinue");
    await onContinue(authForm);
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full grow shrink-0 basis-0 flex-wrap items-start mobile:flex-col mobile:flex-wrap mobile:gap-0">
        <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-[clamp(0.5rem,2vh,2rem)] self-stretch px-12 py-12 md:p-0">
          <Link href="/">
            <Logo size={70} />
          </Link>
          <div className="flex w-full max-w-[448px] flex-col items-center justify-center gap-[clamp(0.5rem,2vh,2rem)]">
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                {authType === 'signup' ? 'Sign up to start your journey' : 'We missed you!'}
              </span>
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-2">
              <OAuthSocialButton
                className="h-10 w-full flex-none"
                logo="https://res.cloudinary.com/subframe/image/upload/v1711417516/shared/z0i3zyjjqkobzuaecgno.svg"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Sign in with Google
              </OAuthSocialButton>
            </div>
            <div className="flex w-full items-center gap-2">
              <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-border" />
              <span className="text-body font-body text-subtext-color">or continue with email</span>
              <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-border" />
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-[clamp(0.5rem,2vh,2rem)]">
              {authType === 'signup' && (
                <TextField className="h-auto w-full flex-none" label="Username" helpText="">
                  <TextField.Input
                    id="username"
                    value={authForm.username}
                    placeholder="Enter your username"
                    onChange={onInputValueChange}
                    required={authType === 'signup'}
                  />
                </TextField>
              )}
              <TextField className="h-auto w-full flex-none" label="Email address" helpText="">
                <TextField.Input
                  id="email"
                  value={authForm.email}
                  placeholder="Enter your work email"
                  onChange={onInputValueChange}
                  required
                />
              </TextField>
              <TextField className="h-auto w-full flex-none" label="Password" helpText="">
                <TextField.Input
                  type="password"
                  id="password"
                  value={authForm.password}
                  placeholder="Enter your password"
                  onChange={onInputValueChange}
                  required
                />
              </TextField>
              <Button className="h-10 w-full flex-none" size="large" onClick={onSubmit} loading={authStore.loading}>
                Continue
              </Button>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <span className="text-body font-body text-subtext-color">
                {authType === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <Link href={authType === 'signup' ? '/signin' : '/signup'}>
                <LinkButton variant="brand" onClick={onGoogleClick}>
                  {authType === 'signup' ? 'Sign In' : 'Sign Up'}
                </LinkButton>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-center gap-12 self-stretch bg-brand-50 px-12 py-12 md:p-0">
          <div className="flex w-full max-w-[448px] grow shrink-0 basis-0 flex-col items-center justify-center gap-8">
            <Image src="/blog-ad-pic.png" alt="Blog Image" width={200} height={200} />
            <div className="flex w-full flex-col items-center gap-6">
              <span className="text-heading-3 font-heading-3 text-brand-800 text-center">
                &quot;Craft compelling blogs in less time, with intelligent AI assistance built to
                understand your style, enhance your ideas, and keep your creative flow
                uninterrupted.&quot;
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-body-bold font-body-bold text-brand-800">XGrid Products</span>
                <span className="text-body font-body text-brand-800">–</span>
                <span className="text-body font-body text-brand-800">
                  <Link href="mailto:info@xgrid.co" target="_blank">
                    Contact Us
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
