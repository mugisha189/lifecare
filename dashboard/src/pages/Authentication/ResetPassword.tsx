import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';
import { ColoringImage, SignImage } from '@/assets';
import { toast } from 'sonner';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      setSuccess('OTP has been sent to your email. Please check your inbox.');
      setError('');
      setStep('reset');
      toast.success('OTP sent to your email');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      setError(error.response?.data?.message || 'An error occurred. Please try again later');
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      authApi.resetPassword(email, otp, newPassword),
    onSuccess: () => {
      setSuccess('Password reset successfully! Redirecting to login...');
      setError('');
      toast.success('Password reset successfully');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      setError(error.response?.data?.message || 'An error occurred. Please try again later');
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  const handleRequestReset = () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');
    forgotPasswordMutation.mutate(email);
  };

  const handleResetPassword = () => {
    setError('');

    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSuccess('');
    resetPasswordMutation.mutate({ email, otp, newPassword });
  };

  return (
    <div className='flex flex-row w-screen h-screen overflow-hidden'>
      {/* Form Section - Left Half */}
      <div className='w-full lg:w-1/2 h-full flex items-center justify-center bg-background p-8'>
        <div className='w-full max-w-md'>
          <div className='space-y-2 mb-8'>
            <h1 className='text-blue-900 text-3xl font-bold'>
              {step === 'reset' ? 'Reset Your Password' : 'Forgot Password'}
            </h1>
            <p className='text-blue-300/80 font-medium'>
              {step === 'reset'
                ? 'Enter the OTP sent to your email and your new password'
                : 'Enter your email to receive a password reset OTP'}
            </p>
          </div>

          {error && <p className='w-full py-4 px-4 bg-red-50 text-red-400 mb-4'>{error}</p>}

          {success && <div className='w-full py-4 px-4 bg-green-50 text-green-600 mb-4'>{success}</div>}

          <div className='space-y-6'>
            {step === 'request' ? (
              <>
                <div>
                  <label htmlFor='email' className='block text-sm font-semibold text-foreground/80 mb-1'>
                    Email*
                  </label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='mail@simple.com'
                    required
                    className='w-full px-4 py-0 rounded-lg border border-input bg-background
                       focus:ring-2 focus:ring-primary/20 focus:border-primary
                       transition-all duration-200'
                  />
                </div>

                <Button
                  onClick={handleRequestReset}
                  disabled={forgotPasswordMutation.isPending || !email}
                  className='w-full text-white py-2.5 rounded-lg bg-primary hover:bg-primary/90 font-semibold
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor='otp' className='block text-sm font-semibold text-foreground/80 mb-1'>
                    OTP Code*
                  </label>
                  <Input
                    id='otp'
                    type='text'
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder='Enter 6-digit OTP'
                    required
                    maxLength={6}
                    className='w-full px-4 py-2 rounded-lg border border-input bg-background
                       focus:ring-2 focus:ring-primary/20 focus:border-primary
                       transition-all duration-200'
                  />
                </div>

                <div>
                  <label htmlFor='new-password' className='block text-sm font-semibold text-foreground/80 mb-1'>
                    New Password*
                  </label>
                  <div className='relative'>
                    <Input
                      id='new-password'
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder='Min. 6 characters'
                      required
                      className='w-full px-4 py-2 rounded-lg border border-input bg-background
                         focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-200 pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute left-100 top-1/2 -translate-y-1/2
                         bg-transparent! border-0 p-0 m-0
                         text-muted-foreground hover:text-foreground
                         focus:outline-none focus:ring-0'
                    >
                      {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor='confirm-password' className='block text-sm font-semibold text-foreground/80 mb-1'>
                    Confirm Password*
                  </label>
                  <div className='relative'>
                    <Input
                      id='confirm-password'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder='Confirm new password'
                      required
                      className='w-full px-4 py-2 rounded-lg border border-input bg-background
                         focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-200 pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute left-100 top-1/2 -translate-y-1/2
                         bg-transparent! border-0 p-0 m-0
                         text-muted-foreground hover:text-foreground
                         focus:outline-none focus:ring-0'
                    >
                      {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending || !otp || !newPassword || !confirmPassword}
                  className='w-full text-white py-2.5 rounded-lg bg-primary hover:bg-primary/90 font-semibold
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </>
            )}

            {step === 'reset' && (
              <div className='text-sm text-muted-foreground text-left'>
                <button
                  type='button'
                  onClick={() => {
                    setStep('request');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccess('');
                  }}
                  className='font-medium text-primary hover:opacity-80 transition-opacity'
                >
                  ← Back to email entry
                </button>
              </div>
            )}

            {step === 'request' && (
              <div className='text-sm text-muted-foreground text-left mt-4'>
                <p>
                  Remember your password?{' '}
                  <Link to='/auth/login' className='font-medium text-primary hover:opacity-80 transition-opacity'>
                    Back to Login
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className='hidden lg:block w-1/2 h-full'
        style={{
          backgroundImage: `url('${ColoringImage}'), url('${SignImage}')`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      />
    </div>
  );
};

export default ResetPasswordPage;
