// src/pages/LoginPage.tsx
// import React, { useState } from 'react';
// import { useAuth } from '../auth/AuthProvider';
// import { Redirect } from 'react-router-dom';

import { useAuth } from '@/lib/providers/auth-provider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { Loader2 } from "lucide-react";
// import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import {  useNavigate } from '@tanstack/react-router';
// import { useNavigate } from '@tanstack/react-router';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
})

const LoginPage: React.FC = () => {
  const router = useNavigate();
  // const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { username, password } = values;
    try {
      setLoading(true);
      await login(username, password,  ()=>{
        router({ to: '/dashboard' })
      });

      setLoading(false);
      // redirectOnAuth(location.pathname, () => {
      //   router({ to: '/dashboard' });
      // })
      // if (success) {
      //   console.info("Authenticated");
      //   router({to: '/dashboard'});
      //   return;

      //   // return <Redirect to="/" />;
      // }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to create account.');
    }
    finally {
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full h-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="py-4">
            <img src="/assets/logo5.png" alt="Logo" width="64" height="64" className="rounded-2xl" />
          </div>
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Precepto</h1>
              <p className="text-balance text-muted-foreground">
                {"Skriv inn påloggingsinformasjonen din nedenfor for å logge inn."}
              </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brukernavn</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                      Skriv inn brukernavnet ditt.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passord</FormLabel>
                      <FormControl>
                        <Input autoComplete={"new-password"} type='password' {...field} />
                      </FormControl>
                      <FormDescription>
                      Skriv inn passordet ditt.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className={cn("flex gap-x-4", "hover:bg-primary, w-full")}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : null}
                  {"Login"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        <div className="hidden bg-transparent lg:block relative">
          <video
            autoPlay
            loop
            muted
            src='/assets/login_vid2.mp4'
            className="h-full w-full object-cover rounded-[1.5rem]"
          />
          <div className="absolute rounded-[1.5rem] inset-0 bg-gradient-to-r from-background/100 from-5%" />
        </div>
      </div>
    </main>
  )
};

export default LoginPage;
