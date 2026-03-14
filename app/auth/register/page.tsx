'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineTag,
  HiOutlineGift,
  HiOutlineCheck,
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { Button, Input, Card, Checkbox } from '@/components/ui';
import { authApi, setAccessToken, referralsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState<string | null>(null);

  // Get referral code from URL
  const refCode = searchParams.get('ref');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
      referralCode: refCode || '',
    },
  });

  const referralCode = watch('referralCode');

  // Apply referral code from URL on mount
  useEffect(() => {
    if (refCode) {
      setShowReferralInput(true);
      setReferralApplied(true);
      setReferralDiscount('SAR 100');
    }
  }, [refCode]);

  const handleApplyReferral = async () => {
    if (!referralCode) return;

    try {
      const result = await referralsApi.getReferralByCode(referralCode);
      if (result.valid) {
        setReferralApplied(true);
        setReferralDiscount('SAR 100');
        toast.success(`Referral code applied! You will get SAR 100 off your first order.`);
      } else {
        toast.error('Invalid referral code');
        setReferralApplied(false);
        setReferralDiscount(null);
      }
    } catch (error) {
      toast.error('Invalid referral code');
      setReferralApplied(false);
      setReferralDiscount(null);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        referralCode: referralApplied ? data.referralCode : undefined,
      });
      setAccessToken(response.accessToken);
      setUser(response.user);

      if (referralApplied) {
        toast.success('Account created! SAR 100 discount has been added to your account.');
      } else {
        toast.success('Account created successfully!');
      }
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    toast.error(t('toast.googleComingSoon'));
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" className="shadow-soft-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-display font-bold text-primary-600">
                {t('common.siteName')}
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-dark-900">
              {t('register.title')}
            </h1>
            <p className="mt-2 text-sm text-dark-500">
              {t('register.subtitle')}
            </p>
          </div>

          {/* Google Register */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-beige-300 rounded-lg text-dark-700 font-medium hover:bg-beige-50 transition-colors"
          >
            <FcGoogle size={20} />
            {t('login.continueWithGoogle')}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-beige-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-dark-400">
                {t('login.orContinueWithEmail')}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('register.firstNameLabel')}
              placeholder="John Doe"
              leftIcon={<HiOutlineUser size={18} />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label={t('register.emailLabel')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              leftIcon={<HiOutlineMail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('register.phoneLabel')}
              type="tel"
              placeholder="+966 50 123 4567"
              leftIcon={<HiOutlinePhone size={18} />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label={t('register.passwordLabel')}
              type="password"
              placeholder="••••••••"
              leftIcon={<HiOutlineLockClosed size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label={t('register.confirmPasswordLabel')}
              type="password"
              placeholder="••••••••"
              leftIcon={<HiOutlineLockClosed size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Referral Code Section */}
            {referralApplied ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <HiOutlineCheck className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Referral Code Applied!</p>
                    <p className="text-sm text-green-600">
                      You will get {referralDiscount} off your first order
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : showReferralInput ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter referral code"
                    leftIcon={<HiOutlineTag size={18} />}
                    {...register('referralCode')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyReferral}
                    disabled={!referralCode}
                  >
                    {t('common.apply')}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowReferralInput(true)}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <HiOutlineGift size={16} />
                Have a referral code?
              </button>
            )}

            <div className="pt-2">
              <Checkbox
                label={
                  <span>
                    {t('register.agreeToTerms')}{' '}
                    <Link
                      href="/terms"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {t('register.termsAndConditions')}
                    </Link>
                  </span>
                }
                {...register('acceptTerms')}
              />
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-6"
            >
              {t('register.registerButton')}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-dark-500">
            {t('register.hasAccount')}{' '}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('register.signIn')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
