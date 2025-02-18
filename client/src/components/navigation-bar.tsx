import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  BarChart2,
  Settings,
  Search,
  Rocket,
  Bell,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export function NavigationBar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <div className="fixed left-4 top-4 z-50">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute left-0 top-16 w-64 rounded-lg border bg-background/95 p-2 backdrop-blur shadow-lg"
          >
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-4 relative"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}