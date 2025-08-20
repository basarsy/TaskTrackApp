import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock, User } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'var(--gradient-surface)' }}>
      <Card className="w-full max-w-md shadow-xl border-card-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to TaskTrack</CardTitle>
            <CardDescription className="text-base">
              Sign in to manage your tasks and projects
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};