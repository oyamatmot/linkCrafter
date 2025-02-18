import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Rocket, BarChart2, Terminal } from "lucide-react";
import { Link } from "wouter";
import { NavigationBar } from "@/components/navigation-bar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Boost() {
  const [linkId, setLinkId] = useState("");
  const [targetClicks, setTargetClicks] = useState("");
  const [loading, setLoading] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleBoost = async () => {
    if (!linkId || !targetClicks) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: parseInt(linkId), targetClicks: parseInt(targetClicks) }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Boost request initiated successfully!",
      });

      // Start polling for updates
      const interval = setInterval(async () => {
        const response = await fetch(`/api/boost/status?linkId=${linkId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            setConsoleMessages(prev => [...prev, data.message]);
          }
        }
      }, 1000);

      setPollingInterval(interval);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate boost",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />
      <div className="container max-w-6xl py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">AI Click Booster</CardTitle>
                  <Link href={`/analytics`}>
                    <Button variant="outline" className="gap-2">
                      <BarChart2 className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link ID</label>
                  <Input
                    type="number"
                    placeholder="Enter your link ID"
                    value={linkId}
                    onChange={(e) => setLinkId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Clicks</label>
                  <Input
                    type="number"
                    placeholder="Enter target clicks"
                    value={targetClicks}
                    onChange={(e) => setTargetClicks(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleBoost}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Rocket className="h-4 w-4 mr-2" />
                  )}
                  Boost Clicks
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <CardTitle>Console Output</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded-md border bg-muted p-4 font-mono text-sm">
                  <AnimatePresence mode="popLayout">
                    {consoleMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground"
                      >
                        {message}
                      </motion.div>
                    ))}
                    {consoleMessages.length === 0 && (
                      <div className="text-muted-foreground">
                        No activity yet. Start a boost to see click logs...
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}