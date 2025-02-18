import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  BarChart2,
  Settings,
  Search,
  LogOut,
  Menu,
  Rocket,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export function NavigationBar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const hideTimer = setInterval(() => {
      if (Date.now() - lastInteraction > 3000) {
        setIsExpanded(false);
      }
    }, 1000);

    const touchHandler = () => {
      setIsExpanded(true);
      setIsVisible(true);
      setLastInteraction(Date.now());
    };

    document.addEventListener('touchstart', touchHandler);
    document.addEventListener('mousemove', touchHandler);

    return () => {
      clearInterval(hideTimer);
      document.removeEventListener('touchstart', touchHandler);
      document.removeEventListener('mousemove', touchHandler);
    };
  }, [lastInteraction]);

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
      title: "Boost",
      href: "/boost",
      icon: Rocket,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isExpanded ? "16rem" : "4rem",
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={cn(
          "fixed left-0 top-4 z-50 h-[calc(100vh-2rem)] m-4",
          "transition-all duration-300 ease-in-out",
        )}
      >
        <motion.div
          layout
          className={cn(
            "backdrop-blur-xl bg-background/95 shadow-lg",
            "rounded-2xl border border-border/50",
            "transition-all duration-300 ease-in-out",
            "flex flex-col h-full",
            isExpanded ? "p-4" : "p-2"
          )}
        >
          {isExpanded ? (
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "relative w-full justify-start gap-4",
                          isActive && "bg-primary/10 hover:bg-primary/15"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col gap-2"
            >
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="icon"
                      className={cn(
                        "relative",
                        isActive && "bg-primary/10 hover:bg-primary/15"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </motion.nav>
    </AnimatePresence>
  );
}