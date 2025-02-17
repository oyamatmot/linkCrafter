import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as LinkType } from "@shared/schema";
import { NavigationBar } from "@/components/navigation-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { Award, Crown, Medal, TrendingUp, Users } from "lucide-react";
import { SiRoots } from "react-icons/si";

export default function Analytics() {
  const { data: links = [] } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
  });

  const { data: publicLinks = [] } = useQuery<(LinkType & { username: string })[]>({
    queryKey: ["/api/links/public"],
  });

  const { data: leaderboard = [] } = useQuery<{ username: string; totalClicks: number; isAI: boolean }[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return <SiRoots className="h-5 w-5 text-wood" />;
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Links
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.reduce((acc, link) => acc + (link.clicks || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average CTR
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.length ? Math.round(links.reduce((acc, link) => acc + (link.clicks || 0), 0) / links.length) : 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Click Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={links}>
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="row-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top 10 Link Masters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((user, index) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? "bg-yellow-100" :
                          index === 1 ? "bg-gray-100" :
                          index === 2 ? "bg-amber-100" :
                          "bg-primary/10"
                        }`}>
                          {getRankIcon(index)}
                        </div>
                        <div>
                          <span className="font-medium flex items-center gap-2">
                            {user.username}
                            {user.isAI && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                AI
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {user.totalClicks.toLocaleString()} clicks
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Public AI Links</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>{link.username}</TableCell>
                        <TableCell>
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline">
                            {link.originalUrl}
                          </a>
                        </TableCell>
                        <TableCell>{link.clicks || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}