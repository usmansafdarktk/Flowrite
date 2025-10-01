'use client';
import { AuthForm } from '@/src/types/auth';
import AuthPage from '../components/AuthPage';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '../hooks/useAuthActions';


const SignInPage = () => {
  const Router = useRouter();
  const { login } = useAuthActions();

  const onSignin = async (authForm: AuthForm) => {
    const { email, password } = authForm;
    try {
      console.log("calling signin");
      await login({ email, password });
      console.log("signin successful");
      Router.push('/blog/new');
    } catch (error) {
      console.error(error);
    }
  };

  return <AuthPage authType="signin" onContinue={onSignin} />;
};

export default SignInPage;
