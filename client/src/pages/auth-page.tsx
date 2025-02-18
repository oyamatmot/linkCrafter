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
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SiGithub, SiGoogle, SiFacebook } from "react-icons/si";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        rememberMe,
        timestamp: new Date().toISOString()
      };

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
        password: "social_auth_password",
        rememberMe,
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
                    loginMutation.mutate({ ...data, rememberMe })
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
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                      />
                      <Label htmlFor="remember-me">Remember me for 30 days</Label>
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
                        className="w-full gap-2"
                      >
                        <SiGithub className="w-4 h-4" />
                        GitHub
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('google')}
                        className="w-full gap-2"
                      >
                        <SiGoogle className="w-4 h-4" />
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full gap-2"
                      >
                        <SiFacebook className="w-4 h-4" />
                        Facebook
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
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          {...registerForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
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