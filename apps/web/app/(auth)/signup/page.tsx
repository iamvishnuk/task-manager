'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  TRegisterSchema
} from '@task-manager/shared/schemas/user';
import { Button } from '@task-manager/ui/components/button';
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
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn
  });

  const onSubmit = (data: TRegisterSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Registration successful 🎉', {
          description: 'Your account is created successfully'
        });
        queryClient.invalidateQueries({ queryKey: ['user-me'] });
        router.push('/');
        router.refresh();
      },
      onError: (error) => {
        toast.error('Registration Error', { description: error.message });
      }
    });
  };

  return (
    <div>
      <div className='space-y-2'>
        <h1 className='text-center text-2xl font-bold'>Create your account</h1>
        <p className='text-center text-sm text-muted-foreground'>
          Start organizing your life today
        </p>
      </div>
      <div className='space-y-5'>
        <form
          id='signup-form'
          className='mt-10 text-sm'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <div className='space-y-5'>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Name <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder='John Doe'
                      className='placeholder:text-xs'
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

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
                      placeholder='johndoe@example.com'
                      className='placeholder:text-xs'
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

              <Controller
                name='confirmPassword'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Confirm Password <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder='Password@123'
                        className='placeholder:text-xs'
                        disabled={isPending}
                      />
                      <InputGroupAddon align='inline-end'>
                        <InputGroupButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <Eye /> : <EyeOff />}
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
              Alaredy have account?
            </p>
            <Link
              href='/login'
              className='text-xs hover:text-blue-700 hover:underline'
            >
              Login
            </Link>
          </div>
          <Button
            form='signup-form'
            className='w-full bg-blue-700 text-white hover:cursor-pointer hover:bg-blue-800'
            type='submit'
          >
            {isPending && <Loader className='animate-spin' />}
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
