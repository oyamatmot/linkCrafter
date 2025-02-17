import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as LinkType } from "@shared/schema";
import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, User, Link as LinkIcon, ExternalLink, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "links">("links");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/search", searchType, searchQuery],
    enabled: searchQuery.length > 2,
  });

  const { data: recommendations = [] } = useQuery<string[]>({
    queryKey: ["/api/search/recommendations", searchType, searchQuery],
    enabled: searchQuery.length > 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
    setShowSuggestions(false);
  };

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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />

                  <AnimatePresence>
                    {showSuggestions && (searchQuery || recentSearches.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full bg-background border rounded-md mt-1 shadow-lg z-50"
                      >
                        {searchQuery && recommendations.length > 0 && (
                          <div className="p-2">
                            <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                              Suggestions
                            </div>
                            {recommendations.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => handleSearch(suggestion)}
                              >
                                <SearchIcon className="h-4 w-4 mr-2" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}

                        {recentSearches.length > 0 && (
                          <div className="p-2 border-t">
                            <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                              Recent Searches
                            </div>
                            {recentSearches.map((recent, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => handleSearch(recent)}
                              >
                                <History className="h-4 w-4 mr-2" />
                                {recent}
                              </Button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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