'use client';

import { useState } from 'react';
import { Button } from '@task-manager/ui/components/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, TLoginSchema } from '@task-manager/shared/schemas/user';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@task-manager/ui/components/field';
import { Input } from '@task-manager/ui/components/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@task-manager/ui/components/input-group';
import { Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { loginMutationFn } from '@/lib/api';
import { toast } from 'sonner';

const LoginPage = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn
  });

  const onSubmit = (data: TLoginSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Logged in Successfully');
        router.push('/');
      },
      onError: (error) => {
        toast.error('Login Error', { description: error.message });
      }
    });
  };

  return (
    <div>
      <div className='space-y-2'>
        <h1 className='text-center text-2xl font-bold'>
          Log in to your account
        </h1>
        <p className='text-center text-sm text-muted-foreground'>
          Welcome back, please log in
        </p>
      </div>
      <div className='space-y-5'>
        <form
          id='login-form'
          className='mt-10 text-sm'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <div className='space-y-5'>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Email <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      type='email'
                      className='placeholder:text-xs'
                      placeholder='johndoe@example.com'
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Passwrod <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder='Password@123'
                        className='placeholder:text-xs'
                        disabled={isPending}
                      />
                      <InputGroupAddon align='inline-end'>
                        <InputGroupButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye /> : <EyeOff />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <div className='w-full space-y-2'>
          <div className='ml-1 flex items-center gap-1'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              Don't have an account?
            </p>
            <Link
              href='/signup'
              className='text-xs hover:text-blue-700 hover:underline'
            >
              Register
            </Link>
          </div>
          <Button
            form='login-form'
            className='w-full bg-blue-700 text-white hover:cursor-pointer hover:bg-blue-800'
            type='submit'
          >
            {isPending && <Loader className='animate-spin' />}
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
