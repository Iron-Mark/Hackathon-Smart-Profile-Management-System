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
import getFromDatabase from "@/tools/database/getFromDatabase";
import signUpUser from "@/tools/accounts/signUpUser";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { logAudit } from "@/tools/database/logAudit";

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsOpen] = useState(false);

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
      const data = await getFromDatabase({
        table: "account_details",
        getAll: true,
        match: {},
      });
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
      const response = await signUpUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        type: newUser.type
      });

      if (response.success) {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Account Management</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600">Add New User</Button>
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

            <Card>
              <CardHeader>
                <CardTitle>Faculty & Administrator Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
                            <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-4 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                            <td className="px-4 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                          </tr>
                        ))
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-100">
                            <td className="px-4 py-2">{user.name}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2 capitalize">{user.type || "faculty"}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.type !== "inactive"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {user.type !== "inactive" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!isLoading && users.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
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
