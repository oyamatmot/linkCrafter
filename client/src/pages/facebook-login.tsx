
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Facebook } from "lucide-react";

export default function FacebookLoginPage() {
  const { loginMutation } = useAuth();
  const [, navigate] = useLocation();
  const form = useForm();

  const handleLogin = async (data: any) => {
    try {
      const mockUser = {
        username: `facebook_user_${Math.random().toString(36).slice(2, 8)}`,
        password: "social_auth_password"
      };
      await loginMutation.mutateAsync(mockUser);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1877f2] dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <div className="text-center">
          <Facebook className="w-12 h-12 text-[#1877f2] mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Log in to Facebook</h2>
        </div>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
          <Input
            type="email"
            placeholder="Email or phone number"
            {...form.register("email")}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            {...form.register("password")}
            className="w-full"
          />
          <Button type="submit" className="w-full bg-[#1877f2]">
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}
