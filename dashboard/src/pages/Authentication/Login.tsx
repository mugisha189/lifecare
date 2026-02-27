import { SignImage } from '@/assets';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuth from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { login, googleLogin, isAuthenticating } = useAuth();
  const emailValue = watch('email');

  const onSubmit: SubmitHandler<LoginFormInputs> = data => {
    login?.mutate({ email: data.email, password: data.password });
  };

  const handleGoogleLogin = () => {
    if (!emailValue) {
      toast.error('Please enter your email address');
      return;
    }
    googleLogin?.mutate({ email: emailValue });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className='flex min-h-screen bg-white'>
      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center bg-white py-8'>
        <div className='w-full max-w-md px-8 flex-1 flex flex-col justify-center'>
          <div className='w-full'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
              <div className='flex flex-col gap-2 mb-8'>
                <h1 className='text-4xl font-bold text-secondary-foreground leading-tight'>Sign In</h1>
                <p className='text-base text-muted-foreground font-normal'>Enter your email and password to sign in!</p>
              </div>

              <Button
                type='button'
                variant='outline'
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                isLoading={googleLogin?.isPending}
                loadingText='Signing in with Google...'
                className='w-full  bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium text-sm shadow-none'
              >
                <GoogleIcon className='h-5 w-5 mr-2' />
                Sign in with Google
              </Button>

              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-border'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-muted-foreground'>or</span>
                </div>
              </div>

              <div className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='email' className='text-sm font-medium text-secondary-foreground'>
                    Email*
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='mail@simmmple.com'
                    disabled={isAuthenticating}
                    className={errors.email ? 'border-red-500' : ''}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Invalid email format',
                      },
                    })}
                  />
                  {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='password' className='text-sm font-medium text-secondary-foreground'>
                    Password*
                  </Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      placeholder='Min. 8 characters'
                      type={showPassword ? 'text' : 'password'}
                      disabled={isAuthenticating}
                      className={errors.password ? 'border-red-500 pr-12' : 'pr-12'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isAuthenticating}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                  {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='keep-logged-in'
                      checked={keepLoggedIn}
                      onCheckedChange={checked => setKeepLoggedIn(checked as boolean)}
                      disabled={isAuthenticating}
                    />
                    <Label
                      htmlFor='keep-logged-in'
                      className='text-sm font-medium text-secondary-foreground cursor-pointer'
                    >
                      Keep me logged in
                    </Label>
                  </div>
                  <Link to='/auth/reset-password' className='text-sm font-medium text-primary hover:underline'>
                    Forget password?
                  </Link>
                </div>

                <Button
                  type='submit'
                  disabled={isAuthenticating}
                  isLoading={login?.isPending}
                  loadingText='Signing in...'
                  className='w-full  font-bold text-sm mt-2'
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className='w-full max-w-md px-8'>
          <div className='text-center text-xs text-muted-foreground py-4'>
            <p>© {currentYear} LIFECARE. All Rights Reserved. </p>
          </div>
        </div>
      </div>

      <div
        className='hidden lg:block w-1/2 relative overflow-hidden bg-[#f0f4f8] bg-cover bg-center bg-no-repeat
                   before:absolute before:inset-0 before:bg-linear-to-b before:from-white/10 before:to-primary/30 before:z-10'
        style={{
          backgroundImage: `url('${SignImage}')`,
        }}
      />
    </div>
  );
};

export default LoginPage;
