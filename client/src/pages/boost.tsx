
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Rocket } from "lucide-react";

export default function Boost() {
  const [linkId, setLinkId] = useState("");
  const [targetClicks, setTargetClicks] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="container max-w-6xl py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">AI Click Booster</CardTitle>
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
    </div>
  );
}
