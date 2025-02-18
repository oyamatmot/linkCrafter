import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { SiGithub, SiGoogle, SiFacebook } from "react-icons/si";
import { toast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSocialLogin = async (provider: 'github' | 'google' | 'facebook') => {
    try {
      // Mock social login by saving to JSON files
      const mockUser = {
        username: `${provider}_user_${Math.random().toString(36).slice(2, 8)}`,
        provider,
        timestamp: new Date().toISOString()
      };

      // In a real app, this would be an API call
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, user: mockUser })
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: `Logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      });

      // Auto-login after social auth
      loginMutation.mutate({
        username: mockUser.username,
        password: "social_auth_password"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login with social provider",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to URL Shortener</CardTitle>
            <CardDescription>
              Manage and track your shortened URLs in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    loginMutation.mutate(data)
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        {...loginForm.register("username")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        {...loginForm.register("password")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('github')}
                        className="w-full"
                      >
                        <SiGithub className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('google')}
                        className="w-full"
                      >
                        <SiGoogle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full"
                      >
                        <SiFacebook className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) =>
                    registerMutation.mutate(data)
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        {...registerForm.register("username")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        {...registerForm.register("password")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:flex bg-primary/10 items-center justify-center p-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Simplify Your Links
          </h1>
          <p className="text-lg text-muted-foreground">
            Create short, memorable links and track their performance with our
            powerful analytics dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}