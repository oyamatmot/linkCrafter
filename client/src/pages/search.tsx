import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as LinkType } from "@shared/schema";
import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search as SearchIcon, User, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "links">("links");

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/search", searchType, searchQuery],
    enabled: searchQuery.length > 2,
  });

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Search</h1>
            <p className="text-muted-foreground">
              Find users and shortened links
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "users" | "links")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>

                  <TabsContent value="links" className="space-y-4">
                    {searchResults.map((link: LinkType) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <LinkIcon className="h-4 w-4 text-primary" />
                                <div>
                                  <h3 className="font-medium">{link.title || link.originalUrl}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {link.shortCode}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{user.username}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {user.totalLinks} links created
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
