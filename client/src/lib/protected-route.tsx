
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation, Redirect } from "wouter";

type ProtectedRouteProps = {
  component: React.ComponentType;
  path: string;
};

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <Route
      path={path}
      render={() => (user ? <Component /> : <Redirect to="/auth" />)}
    />
  );
}
