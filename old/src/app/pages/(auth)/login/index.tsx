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
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
    const { username, password } = values;
    try {
      setLoading(true);
      const success = await login(username, password,  ()=>{
        router({ to: '/dashboard' })
      });
      console.info("login res", success);

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


  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   const success = await login(username, password);
  //   setLoading(false);
  //   if (success) {
  //     // Redirect to home page or desired route
  //   }
  // };

  // if (isAuthenticated) {
  //   return;
  //   // return <Redirect to="/" />;
  // }



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
                {"Enter your credentials below to login."}
              </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a username.
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input autoComplete={"new-password"} type='password' {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a password.
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
                {/* <Button type="submit">Create Account</Button> */}
              </form>
            </Form>
            {/* {searchParams?.email ? (
              <OTP email={searchParams.email as string} />
            ) : (
              <SendCode />
            )} */}
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
          {/* <img
            src="/assets/404 Error-rafiki.svg"
            alt="login"
            width="1920"
            height="1080"
            className="h-full w-full object-cover rounded-[3.5rem]"
          /> */}
        </div>
      </div>
    </main>
  )
  // <div>
  //   <h2>Login</h2>
  //   <form onSubmit={handleLogin}>
  //     <div>
  //       {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
  //       <label>Username:</label>
  //       <input
  //         value={username}
  //         onChange={(e) => setUsername(e.target.value)}
  //         required
  //       />
  //     </div>
  //     <div>
  //       {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
  //       <label>Password:</label>
  //       <input
  //         value={password}
  //         type="password"
  //         onChange={(e) => setPassword(e.target.value)}
  //         required
  //       />
  //     </div>
  //     <button type="submit" disabled={loading}>
  //       {loading ? 'Logging in...' : 'Login'}
  //     </button>
  //   </form>
  // </div>
};

export default LoginPage;
