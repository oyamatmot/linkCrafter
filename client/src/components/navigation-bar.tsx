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
  User,
  Users,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function NavigationBar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

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
      title: "Team",
      href: "/team",
      icon: Users,
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
    <AnimatePresence>
      <motion.nav
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          width: isExpanded ? "100%" : "auto",
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "w-full max-w-xl" : "w-16",
        )}
      >
        <motion.div
          layout
          className={cn(
            "backdrop-blur-xl bg-background/80 shadow-lg",
            "mx-4 rounded-full border",
            "transition-all duration-300 ease-in-out"
          )}
        >
          {isExpanded ? (
            <div className="px-4">
              <div className="flex items-center justify-between h-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex items-center gap-2"
                >
                  <LinkIcon className="h-6 w-6 text-primary" />
                  <span className="text-xl font-semibold">LinkCrafter</span>
                </motion.div>

                <div className="flex items-center justify-around md:justify-center flex-1 md:flex-none gap-1 md:gap-2">
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

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex items-center gap-4"
                >
                  <span className="text-sm text-muted-foreground">
                    {user?.username}
                  </span>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="p-4"
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