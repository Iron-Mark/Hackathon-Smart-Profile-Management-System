import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mock data for users - replace with actual data fetching
const mockUsers = [
  {
    id: "1",
    name: "Dr. Alice Wonderland",
    email: "alice@ccis.edu",
    role: "Faculty",
    status: "Active",
  },
  {
    id: "2",
    name: "Prof. Bob The Builder",
    email: "bob@ccis.edu",
    role: "Faculty",
    status: "Active",
  },
  {
    id: "3",
    name: "Ms. Carol Danvers",
    email: "carol@ccis.edu",
    role: "Faculty",
    status: "Inactive",
  },
  {
    id: "4",
    name: "Admin User",
    email: "admin@ccis.edu",
    role: "Administrator",
    status: "Active",
  },
];

export default function AdminAccountsPage() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Account Management</h1>
              <Button className = "bg-green-500">Add New User</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Faculty & Administrator Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.role}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mockUsers.length === 0 && (
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
