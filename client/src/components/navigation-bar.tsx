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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function NavigationBar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";
      setScrollDirection(direction);
      setIsVisible(direction === "up" || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
        initial={{ y: 0, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={cn(
          "fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50",
          "backdrop-blur-xl bg-background/80 shadow-lg",
          "border-t md:border-b md:border-t-0",
          "transition-all duration-300 ease-in-out",
          "mx-auto md:mx-4 lg:mx-8 md:mt-4 md:rounded-full",
          "max-w-7xl"
        )}
      >
        <div className="px-4 md:px-8">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center text-xs text-muted-foreground py-2 border-t"
          >
            <Link href="/privacy-policy" className="hover:text-primary mx-2">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-primary mx-2">Terms of Service</Link>
          </motion.div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}