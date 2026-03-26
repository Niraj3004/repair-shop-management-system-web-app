import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type OTPFormValues = z.infer<typeof otpSchema>;

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }
  }, [location.state, setValue]);

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const verifyMutation = useMutation({
    mutationFn: async (data: OTPFormValues) => {
      const response = await api.post('/auth/verify-otp', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account verified successfully! You can now login.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const email = location.state?.email;
      if (!email) throw new Error('Email not found');
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success('OTP resent successfully!');
      setResendTimer(60); // 60 seconds cooldown
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    },
  });

  const onSubmit = (data: OTPFormValues) => {
    setIsLoading(true);
    verifyMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit OTP sent to your email and set your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                readOnly
                {...register('email')}
                className="bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                placeholder="123456"
                maxLength={6}
                {...register('otp')}
                className={errors.otp ? 'border-red-500 tracking-widest text-center text-lg' : 'tracking-widest text-center text-lg'}
              />
              {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Set Password'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendTimer > 0 || resendMutation.isPending}
                className="text-sm text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline font-medium"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
