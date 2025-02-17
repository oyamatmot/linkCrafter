import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NavigationBar } from "@/components/navigation-bar";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Crown,
  UserPlus,
  Shield,
  UserMinus,
  Mail,
  User,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: team } = useQuery({
    queryKey: ["/api/teams", user?.teamId],
    enabled: !!user?.teamId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["/api/teams", user?.teamId, "members"],
    enabled: !!user?.teamId,
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["/api/teams", user?.teamId, "invites"],
    enabled: !!user?.teamId,
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "badges"],
    enabled: !!user?.id,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/teams", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Team created successfully" });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", `/api/teams/${team?.id}/invites`, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", team?.id, "invites"] });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      toast({ title: "Invitation sent successfully" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/teams/${team?.id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", team?.id, "members"] });
      toast({ title: "Member removed successfully" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", team?.id, "members"] });
      toast({ title: "Role updated successfully" });
    },
  });

  if (!user?.teamId && !team) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
        <NavigationBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Team</CardTitle>
              <CardDescription>
                Start collaborating with your team members by creating a team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const name = prompt("Enter team name:");
                  if (name) createTeamMutation.mutate(name);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pt-16">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{team?.name}</CardTitle>
                    <CardDescription>Team Members and Roles</CardDescription>
                  </div>
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to collaborate with your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => inviteMemberMutation.mutate(inviteEmail)}
                          className="w-full"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{member.username}</span>
                          {member.id === team?.ownerId && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.role === "admin" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (user?.id === team?.ownerId) {
                                const newRole = member.role === "admin" ? "member" : "admin";
                                updateRoleMutation.mutate({ userId: member.id, role: newRole });
                              }
                            }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {member.id === user?.id && userBadges.map((badge) => (
                              <Badge key={badge.id} variant="outline">
                                <Award className="h-3 w-3 mr-1" />
                                {badge.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user?.id === team?.ownerId && member.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {invites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invites</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invited By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>{invite.invitedEmail}</TableCell>
                          <TableCell>
                            <Badge>{invite.status}</Badge>
                          </TableCell>
                          <TableCell>{invite.invitedByUsername}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
