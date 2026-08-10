import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteDemoAuthUser,
  deleteDemoStoredFilesForUser,
  setDemoCurrentUserId,
  updateDemoAuthUser
} from "@/client/demoBackend";
import getFromDatabase from "@/tools/database/getFromDatabase";
import removeFromDatabase from "@/tools/database/removeFromDatabase";
import updateDatabase from "@/tools/database/updateDatabase";
import signUpUser from "@/tools/accounts/signUpUser";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { logAudit } from "@/tools/database/logAudit";
import backend from "@/client/backend";

type AccountRow = {
  id: string;
  name: string;
  email: string;
  type?: string;
};

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AccountRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AccountRow | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    type: "faculty"
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [{ data: currentAuth }, data] = await Promise.all([
        backend.auth.getUser(),
        getFromDatabase({
          table: "account_details",
          getAll: true,
          match: {},
        }),
      ]);
      setCurrentUserId(currentAuth.user?.id ?? null);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch user accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const { data: currentAuth } = await backend.auth.getUser();
      const response = await signUpUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        type: newUser.type
      });

      if (response.success) {
        setDemoCurrentUserId(currentAuth.user?.id ?? null);
        toast.success("User created successfully");
        await logAudit('APPROVAL_ACTION', `Admin created new ${newUser.type} account: ${newUser.email}`);
        setIsOpen(false);
        setNewUser({ name: "", email: "", password: "", type: "faculty" });
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (user: AccountRow) => {
    setEditPassword("");
    setEditingUser({ ...user, type: user.type || "faculty" });
  };

  const adminCount = users.filter((user) => user.type === "admin").length;
  const getDeleteBlockReason = (user: AccountRow) => {
    if (user.id === currentUserId) {
      return "You cannot delete the active admin session.";
    }

    if (user.type === "admin" && adminCount <= 1) {
      return "Keep at least one administrator account in the demo.";
    }

    return null;
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setIsUpdating(true);
      await updateDatabase({
        table: "account_details",
        match: { id: editingUser.id },
        data: {
          name: editingUser.name.trim(),
          email: editingUser.email.trim().toLowerCase(),
          type: editingUser.type || "faculty"
        }
      });
      updateDemoAuthUser(editingUser.id, {
        email: editingUser.email,
        password: editPassword.trim() || undefined
      });
      await logAudit('APPROVAL_ACTION', `Admin updated account: ${editingUser.email}`);
      toast.success("User updated successfully");
      setEditingUser(null);
      setEditPassword("");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const deleteBlockReason = getDeleteBlockReason(deletingUser);
    if (deleteBlockReason) {
      toast.error(deleteBlockReason);
      setDeletingUser(null);
      return;
    }

    try {
      setIsDeleting(true);
      await Promise.all([
        removeFromDatabase({ table: "account_details", match: { id: deletingUser.id } }),
        removeFromDatabase({ table: "profile_details", match: { id: deletingUser.id } }),
        removeFromDatabase({ table: "educational_background", match: { user_id: deletingUser.id } }),
        removeFromDatabase({ table: "work_experiences", match: { user_id: deletingUser.id } }),
        removeFromDatabase({ table: "professional_development", match: { user_id: deletingUser.id } }),
        removeFromDatabase({ table: "submissions", match: { user_id: deletingUser.id } }),
      ]);
      deleteDemoStoredFilesForUser(deletingUser.id);
      deleteDemoAuthUser(deletingUser.id);
      await logAudit('APPROVAL_ACTION', `Admin deleted account: ${deletingUser.email}`);
      toast.success("User deleted successfully");
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-muted/40 text-foreground p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage browser-local demo reviewers, faculty profiles, and role access.
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>Add New User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User Account</DialogTitle>
                    <DialogDescription>
                      This will create a new account and associated profile record.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Dr. John Doe"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john.doe@ccis.edu"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Initial Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Account Role</Label>
                      <Select 
                        value={newUser.type} 
                        onValueChange={(val) => setNewUser({...newUser, type: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User Account</DialogTitle>
                  <DialogDescription>
                    Update the demo account profile. Leave password blank to keep the current password.
                  </DialogDescription>
                </DialogHeader>
                {editingUser && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-password">New Password</Label>
                      <Input
                        id="edit-password"
                        type="password"
                        placeholder="Leave unchanged"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Account Role</Label>
                      <Select
                        value={editingUser.type || "faculty"}
                        onValueChange={(val) => setEditingUser({ ...editingUser, type: val })}
                      >
                        <SelectTrigger id="edit-type">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User Account</DialogTitle>
                  <DialogDescription>
                    This removes the browser-local demo account, profile, submissions, and credential records.
                  </DialogDescription>
                </DialogHeader>
                {deletingUser && (
                  <div className="rounded-md border bg-muted/40 p-4 text-sm">
                    <p className="font-medium text-foreground">{deletingUser.name}</p>
                    <p className="text-muted-foreground">{deletingUser.email}</p>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeletingUser(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Faculty & Administrator Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell className="py-4 text-right">
                              <Skeleton className="ml-auto h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        users.map((user) => {
                          const deleteBlockReason = getDeleteBlockReason(user);

                          return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="capitalize">{user.type || "faculty"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => openEditDialog(user)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={Boolean(deleteBlockReason)}
                                title={deleteBlockReason || undefined}
                                onClick={() => setDeletingUser(user)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                {!isLoading && users.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No users found.
                  </p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
