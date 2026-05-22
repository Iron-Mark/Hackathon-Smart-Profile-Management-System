import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import supabaseAccountActions from "@/tools/accounts/supabaseAccountActions";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { logAudit } from "@/tools/database/logAudit";
import { Lock, LogOut, Bell, Shield } from "lucide-react";

function Preferences() {
  const [notifications, setNotifications] = useState(true);
  
  const handleToggle = (checked: boolean) => {
    setNotifications(checked);
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <Card className="h-full shadow-lg border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" /> Preferences
        </CardTitle>
        <CardDescription>Manage your app experience and notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="notifications" className="text-base">Push Notifications</Label>
            <p className="text-sm text-gray-500">Receive alerts about document approvals.</p>
          </div>
          <Switch 
            id="notifications" 
            checked={notifications} 
            onCheckedChange={handleToggle}
          />
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
            <p className="text-sm text-gray-500">Switch to a darker interface theme.</p>
          </div>
          <Switch id="dark-mode" disabled />
        </div>
      </CardContent>
    </Card>
  );
}

export default function FacultySettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const response = await supabaseAccountActions.logOutUser();
    if (response.success) {
      toast.success("Logged out successfully");
      setTimeout(() => window.location.href = "/auth/login", 1000);
    } else {
      toast.error("Logout failed: " + response.message);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsChanging(true);
      const response = await supabaseAccountActions.changePassword(newPassword);
      if (response.success) {
        toast.success("Password updated successfully");
        await logAudit('SETTINGS_CHANGE', 'User changed their account password');
        setIsOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <div className="flex w-screen min-h-screen bg-stone-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="p-6 md:p-10 max-w-5xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="h-full shadow-lg border-stone-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" /> Account Security
                  </CardTitle>
                  <CardDescription>Manage your password and session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 h-12">
                        <Lock className="w-4 h-4" /> Change Account Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter a new secure password for your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-pass">New Password</Label>
                          <Input 
                            id="new-pass" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-pass">Confirm New Password</Label>
                          <Input 
                            id="confirm-pass" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordChange} disabled={isChanging}>
                          {isChanging ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2 h-12"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out of All Devices
                  </Button>
                </CardContent>
              </Card>

              <Preferences />
            </div>

            <footer className="mt-16 text-center text-sm text-gray-500 max-w-md mx-auto">
              <p className="mb-2">Developed for the UMak CCIS Hackathon by Team 2nd Choice.</p>
              <p>&copy; 2026 Smart Faculty Profile Management System</p>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
