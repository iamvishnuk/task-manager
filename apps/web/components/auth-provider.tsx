'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getMeQueryFn, logoutMutationFn, type UserProfile } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: userProfileData, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: getMeQueryFn,
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      toast.success('Logged out successfully');
      queryClient.clear();
      router.push('/login');
    },
    onError: (err: any) => {
      toast.error('Failed to log out', {
        description: err.message || 'Please try again.'
      });
    }
  });

  const user = userProfileData?.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingOut,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
