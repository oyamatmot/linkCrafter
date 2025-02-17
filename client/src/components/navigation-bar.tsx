import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  BarChart2,
  Settings,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function NavigationBar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LinkIcon,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto bg-white border-t md:border-b md:border-t-0 backdrop-blur-lg bg-white/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">LinkCrafter</span>
          </div>

          <div className="flex items-center justify-around md:justify-center flex-1 md:flex-none gap-1 md:gap-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "relative px-2 md:px-4 h-12",
                      isActive && "bg-primary/10 hover:bg-primary/15"
                    )}
                  >
                    <item.icon className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">{item.title}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        animate
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center text-xs text-muted-foreground py-2 border-t">
          <Link href="/privacy-policy" className="hover:text-primary mx-2">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms-of-service" className="hover:text-primary mx-2">Terms of Service</Link>
        </div>
      </div>
    </nav>
  );
}