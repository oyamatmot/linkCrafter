import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import HomePage from "@/pages/home-page";
import Analytics from "@/pages/analytics";
import Search from "@/pages/search";
import Settings from "@/pages/settings";
import TeamPage from "@/pages/team";
import Boost from "@/pages/boost";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} path="/dashboard" />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} path="/analytics" />
      </Route>
      <Route path="/team">
        <ProtectedRoute component={TeamPage} path="/team" />
      </Route>
      <Route path="/search">
        <ProtectedRoute component={Search} path="/search" />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} path="/settings" />
      </Route>
      <Route path="/boost">
        <ProtectedRoute component={Boost} path="/boost" />
      </Route>
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="url-shortener-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}