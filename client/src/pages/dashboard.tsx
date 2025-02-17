import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link as LinkType, InsertLink } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertLinkSchema } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Link as LinkIcon, 
  Lock, 
  Unlock, 
  BarChart2, 
  Trash2,
  LogOut,
  ExternalLink,
  Copy,
  Globe,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: links = [] } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: InsertLink) => {
      const res = await apiRequest("POST", "/api/links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link deleted successfully" });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLink> }) => {
      const res = await apiRequest("PATCH", `/api/links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link updated successfully" });
    },
  });

  const form = useForm<InsertLink>({
    resolver: zodResolver(insertLinkSchema),
    defaultValues: {
      originalUrl: "",
      title: "",
      password: "",
      customDomain: "",
      isPublished: true,
    },
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/links", selectedLink?.id, "analytics"],
    enabled: !!selectedLink,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LinkIcon className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold">URL Shortener</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.username}
              </span>
              <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Links</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <LinkIcon className="h-4 w-4 mr-2" />
                Create New Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Link</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((data) => createLinkMutation.mutate(data))}>
                <div className="space-y-4">
                  <div>
                    <Label>Original URL</Label>
                    <Input {...form.register("originalUrl")} placeholder="https://example.com" />
                    {form.formState.errors.originalUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.originalUrl.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input {...form.register("title")} placeholder="My Awesome Link" />
                  </div>
                  <div>
                    <Label>Custom Domain (Optional)</Label>
                    <div className="flex gap-2">
                      <Input 
                        {...form.register("customDomain")} 
                        placeholder="mylink.com"
                      />
                      <Button variant="outline" size="icon">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Password Protection (Optional)</Label>
                    <Input type="password" {...form.register("password")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.watch("isPublished")}
                      onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                    />
                    <Label>Published</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createLinkMutation.isPending}
                  >
                    Create Link
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Custom Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>{link.title || link.originalUrl}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {`${window.location.origin}/s/${link.shortCode}`}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(`${window.location.origin}/s/${link.shortCode}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`${window.location.origin}/s/${link.shortCode}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {link.customDomain ? (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span>{link.customDomain}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {link.password ? (
                            <Lock className="h-4 w-4 text-warning" />
                          ) : (
                            <Unlock className="h-4 w-4 text-success" />
                          )}
                          <span className={link.isPublished ? "text-success" : "text-muted-foreground"}>
                            {link.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLink(link)}
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLinkMutation.mutate(link.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedLink && analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics for {selectedLink.title || selectedLink.originalUrl}</CardTitle>
                <CardDescription>Click statistics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <XAxis dataKey="clickedAt" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}