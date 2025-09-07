
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { MicrosoftIcon } from '@/components/atoms/icons/MicrosoftIcon';
import { supabase } from '@/integrations/supabase/client';

const AuthPage: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error('Sign in failed: ' + error.message);
        }
        return;
      }

      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error('An unexpected error occurred: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile',
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error('Microsoft sign up failed: ' + error.message);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            GTI Breakdown Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your work processes efficiently
          </p>
        </div>

        <Card>
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <CardDescription>
                    Sign in to your account to access the breakdown tracker.
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  <CardDescription>
                    Sign up with your Microsoft account to get started.
                  </CardDescription>
                  
                  <Button
                    onClick={handleMicrosoftSignUp}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isLoading}
                    variant="outline"
                  >
                    <MicrosoftIcon className="w-5 h-5" />
                    {isLoading ? 'Signing up...' : 'Sign up with Microsoft'}
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
