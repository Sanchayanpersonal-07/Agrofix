import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Redirect to home if already logged in
  if (user) {
    navigate('/');
    return null;
  }
  
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'buyer' as 'buyer' | 'admin'
  });
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(loginForm);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      // Toast notification is handled by the useAuth hook
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password length
    if (registerForm.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await registerMutation.mutateAsync(registerForm);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      // Toast notification is handled by the useAuth hook
    }
  };
  
  return (
    <div className="container flex min-h-screen items-center py-8">
      <div className="flex flex-col md:flex-row w-full gap-8">
        <div className="flex-1">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLoginSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input 
                          id="login-username"
                          type="text"
                          placeholder="Your username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input 
                          id="login-password"
                          type="password"
                          placeholder="Your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Register for a new account to place orders
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegisterSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input 
                          id="register-username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input 
                          id="register-email"
                          type="email"
                          placeholder="Your email address"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input 
                          id="register-password"
                          type="password"
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create account'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="flex-1 hidden md:block">
          <div className="h-full flex flex-col justify-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">AgroFix - Fresh produce delivery</h2>
              <p className="text-muted-foreground">
                Your one-stop platform for high-quality fruits and vegetables sourced directly from farmers.
                Login or create an account to start ordering fresh produce for your business or home.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">✓ Quality Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">We ensure only the freshest produce reaches you</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">✓ Bulk Ordering</h3>
                  <p className="text-sm text-muted-foreground">Perfect for restaurants, catering, and large families</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">✓ Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">Next-day delivery available on most orders</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">✓ Track Orders</h3>
                  <p className="text-sm text-muted-foreground">Real-time updates on your delivery status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}