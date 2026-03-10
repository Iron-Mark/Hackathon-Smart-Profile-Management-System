import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gradient-to-br from-gray-100 to-gray-200 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
              Admin Dashboard
            </h1>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg transition-shadow bg-gradient-to-r from-blue-400 to-blue-200 text-stone-800">
                <CardHeader>
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">150</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg transition-shadow bg-gradient-to-r from-green-400 to-green-200 text-stone-800">
                <CardHeader>
                  <CardTitle className="text-sm">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">45</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg transition-shadow bg-gradient-to-r from-amber-400 to-amber-200 text-stone-800">
                <CardHeader>
                  <CardTitle className="text-sm">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Approval Management
              </h2>
              <div className="bg-white shadow-md rounded-md p-4">
                <ul className="space-y-3">
                  <li className="flex items-center justify-between border-b-2">
                    <span className="text-sm text-gray-600 ">
                      John Doe submitted a new document.
                    </span>
                    <div className="space-x-2">
                      <Button variant="default">Approve</Button>
                      <Button variant="destructive">Reject</Button>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Jane Smith updated her profile.
                    </span>
                    <div className="space-x-2">
                      <Button variant="default">Approve</Button>
                      <Button variant="destructive">Reject</Button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semi bold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  <Button
                    asChild
                    className="w-full bg-blue-300 hover:bg-blue-200 text-stone-800"
                  >
                    <Link to="/admin/accounts">Add User</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-amber-300 hover:bg-amber-200 text-stone-800"
                  >
                    <Link to="/admin/approvals">View Approvals</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full bg-green-300 hover:bg-green-200 text-stone-800"
                  >
                    <Link to="/admin/reports">Generate Report</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full bg-stone-300 hover:bg-stone-400 text-stone-800"
                  >
                    <Link to="/admin/settings">Settings</Link>
                  </Button>

              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
