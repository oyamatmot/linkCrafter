import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Moon, Sun, Globe, Smartphone, Search, Book, Activity } from "lucide-react";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
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
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences
            </p>
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
                    <Switch />
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
                    <Switch />
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
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <Label>Mobile View</Label>
                        <p className="text-sm text-muted-foreground">
                          Optimize interface for mobile devices
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label>Notifications</Label>
                    </div>
                    <Switch />
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
                    <Input placeholder="yourdomain.com" className="max-w-[200px]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-publish new links</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}