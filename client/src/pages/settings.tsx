import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Moon, LogOut, Globe, Smartphone, Search, Book, Activity } from "lucide-react";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const res = await apiRequest("PATCH", "/api/user/preferences", preferences);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Settings updated successfully" });
    },
  });

  const handlePreferenceChange = async (key: string, value: boolean | string) => {
    if (!user?.preferences) return;

    const newPreferences = {
      ...user.preferences,
      [key]: value,
    };

    try {
      await updatePreferencesMutation.mutateAsync(newPreferences);
      if (key === "darkMode") {
        setTheme(value ? "dark" : "light");
      }
    } catch (error) {
      // Revert on failure
      queryClient.setQueryData(["/api/user"], (oldData: any) => ({
        ...oldData,
        preferences: user.preferences,
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = '/auth';
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.preferences) {
      setTheme(user.preferences.darkMode ? "dark" : "light");
    }
  }, [user?.preferences]);

  return (
    <div className="min-h-screen bg-background pl-24 lg:pl-72">
      <NavigationBar />

      {showTutorial && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="gap-2"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={user?.username} disabled />
                  </div>
                  <div>
                    <Label>Email (Optional)</Label>
                    <Input placeholder="Add your email for notifications" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Features</CardTitle>
                  <CardDescription>
                    Customize advanced application features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <div>
                        <Label>Smart Search Recommendations</Label>
                        <p className="text-sm text-muted-foreground">
                          Get intelligent link suggestions while searching
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={user?.preferences?.smartSearch ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("smartSearch", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <div>
                        <Label>Self-Monitoring</Label>
                        <p className="text-sm text-muted-foreground">
                          Monitor app performance and receive alerts
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={user?.preferences?.selfMonitoring ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("selfMonitoring", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <div>
                        <Label>Tutorial Guide</Label>
                        <p className="text-sm text-muted-foreground">
                          Restart the tutorial guide
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setShowTutorial(true)}>
                      Start Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Display & Accessibility</CardTitle>
                  <CardDescription>
                    Customize your viewing experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <Label>Dark Mode</Label>
                    </div>
                    <Switch 
                      checked={user?.preferences?.darkMode ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label>Notifications</Label>
                    </div>
                    <Switch 
                      checked={user?.preferences?.notifications ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Link Settings</CardTitle>
                  <CardDescription>
                    Configure default link options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <Label>Default Custom Domain</Label>
                    </div>
                    <Input 
                      value={user?.preferences?.defaultCustomDomain ?? ""}
                      onChange={(e) => handlePreferenceChange("defaultCustomDomain", e.target.value)}
                      placeholder="yourdomain.com"
                      className="max-w-[200px]"
                      type="text"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        {updatePreferencesMutation.isPending && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving changes...
          </div>
        )}
      </main>
    </div>
  );
}