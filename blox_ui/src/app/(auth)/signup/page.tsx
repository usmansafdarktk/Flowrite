'use client';

import AuthPage from '../components/AuthPage';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '../hooks/useAuthActions';

import { AuthForm } from '@/src/types/auth';

const SignUpPage = () => {
  const Router = useRouter();
  const { signup } = useAuthActions();

  const onSignup = async (authForm: AuthForm) => {
    const { username, email, password } = authForm;

    try {
      await signup({ username, email, password });
      Router.push('/blog/new');
    } catch (error) {
      console.error(error);
    }
  };

  return <AuthPage authType="signup" onContinue={onSignup} />;
};

export default SignUpPage;
