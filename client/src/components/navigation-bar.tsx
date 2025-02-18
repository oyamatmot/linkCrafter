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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          width: isExpanded ? "auto" : "3rem",
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "transition-all duration-300 ease-in-out",
        )}
      >
        <motion.div
          layout
          className={cn(
            "backdrop-blur-xl bg-background/95 shadow-lg",
            "rounded-full border border-border/50",
            "transition-all duration-300 ease-in-out",
            "flex items-center justify-center",
            isExpanded ? "px-3" : "p-2"
          )}
        >
          {isExpanded ? (
            <div className="h-12 flex items-center justify-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="icon"
                        className={cn(
                          "relative w-10 h-10",
                          isActive && "bg-primary/10 hover:bg-primary/15"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.badge && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
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
            >
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setIsExpanded(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.nav>
    </AnimatePresence>
  );
}