import { useState } from "react";
import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkId: number;
  timestamp: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredNotifications = selectedTab === "all" 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />
      <div className="container max-w-4xl py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedTab === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    onClick={() => setSelectedTab("all")}
                  >
                    All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedTab === "unread"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    onClick={() => setSelectedTab("unread")}
                  >
                    Unread
                  </motion.button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link href={`/analytics?linkId=${notification.linkId}`}>
                          <div className="mb-4 cursor-pointer">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-3">
                                    <div className="mt-1">
                                      <LinkIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">
                                        {notification.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(
                                          notification.timestamp
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground py-8"
                    >
                      No notifications to display
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
