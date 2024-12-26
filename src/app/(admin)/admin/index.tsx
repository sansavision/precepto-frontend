
// src/pages/AdminPage.tsx
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useNats } from '@/lib/providers/nats-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
// import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
})
 

const AdminPage: React.FC = () => {
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  const { request } = useNats();

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
      const newUser = {
        id: username,
        name: username,
        login_pass: password, // Plain password, hashing is done on the backend
        templates: [],
      };
      const response = await request('auth.register', JSON.stringify(newUser));
      const result = JSON.parse(response);
      if (result.status === 'success') {
        alert('Account created successfully.');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to create account.');
    }
  }

  return (
    <div className='flex gap-4 flex-1 flex-col justify-start items-center'>
      <h3 className='text-xl'>Admin - Create Account</h3>
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
          <Button type="submit">Create Account</Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminPage;

      // <div>
   
      //   <label>Username:</label>
      //   <input
      //     value={username}
      //     onChange={(e) => setUsername(e.target.value)}
      //     required
      //   />
      // </div>
      // <div>
  
      //   <label>Password:</label>
      //   <input
      //     value={password}
      //     type="password"
      //     onChange={(e) => setPassword(e.target.value)}
      //     required
      //   />
      // </div>
      // <Button onClick={handleCreateAccount}>Create Account</Button>