import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
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
import demoAccountActions from "@/tools/accounts/demoAccountActions";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logAudit } from "@/tools/database/logAudit";
import { Lock, LogOut, Bell, Shield } from "lucide-react";

function Preferences() {
  const [notifications, setNotifications] = useState(true);
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setNotifications(checked);
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast.success(`${checked ? 'Dark' : 'Light'} mode enabled`);
  };

  return (
    <Section
      title={
        <span className="inline-flex items-center gap-2">
          <Bell className="h-5 w-5 text-info" /> Preferences
        </span>
      }
      description="Manage your app experience and notifications."
    >
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="notifications" className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive alerts about document approvals.</p>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">Switch to a darker interface theme.</p>
          </div>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={handleThemeToggle}
          />
        </div>
      </div>
    </Section>
  );
}

export default function FacultySettingsPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const response = await demoAccountActions.logOutUser();
    if (response.success) {
      toast.success("Logged out successfully");
      setTimeout(() => navigate("/auth/login", { replace: true }), 1000);
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
      const response = await demoAccountActions.changePassword(newPassword);
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
    <PageShell>
      <PageHeader
        kicker="Faculty workspace"
        title="Settings"
        description="Account security, session, and display preferences."
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Section
          title={
            <span className="inline-flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" /> Account Security
            </span>
          }
          description="Manage your password and session."
        >
          <div className="space-y-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-start gap-2">
                  <Lock className="h-4 w-4" /> Change Account Password
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
              className="h-11 w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sign Out of All Devices
            </Button>
          </div>
        </Section>

        <Preferences />
      </div>

      <footer className="mx-auto mt-16 max-w-md text-center text-sm text-muted-foreground">
        <p className="mb-2">Maintained by Mark Siazon. Original 7th CCIS Hackathon entry by Team 2nd Choice.</p>
        <p>&copy; 2026 Smart Faculty Profile Management System</p>
      </footer>
    </PageShell>
  );
}
