import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import supabaseAccountActions from "@/tools/accounts/supabaseAccountActions";

function AccountPrivacySettings({
  onPasswordChange,
}: {
  onPasswordChange: () => void;
}) {
  return (
    <Card className = "w-1/2 m-auto">
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 ">
          <Button className="w-full" onClick={onPasswordChange}>
            Change Password
          </Button>
          <Logout />
        </div>
      </CardContent>
    </Card>
  );
}

function Preferences() {
  return (
    <Card className = "w-1/2 m-auto mt-10">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="notifications"
              className="text-sm font-medium text-gray-700"
            >
              Enable Notifications
            </label>
            <Switch id="notifications" />
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="dark-mode"
              className="text-sm font-medium text-gray-700"
            >
              Dark Mode
            </label>
            <Switch id="dark-mode" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Logout() {
  const handleLogout = async () => {
    const response = await supabaseAccountActions.logOutUser();
    if (response.success) {
      alert("Logged out successfully!");
      window.location.href = "/auth/login"; // Redirect to login page
    } else {
      alert("Failed to log out: " + response.message);
    }
  };

  return (
    <Button onClick={handleLogout} className="w-full" variant="destructive">
      Logout
    </Button>
  );
}

export default function FacultySettingsPage() {
  const handlePasswordChange = async () => {
    let response;
    try {
      const newPassword = prompt("Enter your new password:");
      if (!newPassword) {
        alert("Password change canceled.");
        return;
      }
      response = await supabaseAccountActions.changePassword(newPassword);
    } catch (error) {
      console.error("An error occurred while changing the password:", error);
      alert("An unexpected error occurred. Please try again later.");
      return;
    }
    if (response.success) {
      alert("Password changed successfully!");
    } else {
      alert("Failed to change password: " + response.message);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-screen">
        <AppSidebar />
        <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit md:mt-10">
          {/* Adjusted grid layout */}
          <AccountPrivacySettings onPasswordChange={handlePasswordChange} />
          <Preferences />
          <footer className="col-span-1 md:col-span-2 mt-6 text-center text-sm text-gray-500 sm:w-9/12 md:w-7/12 mx-auto">
            {/* Footer spans 2 columns */}
            This app is developed for the 7th UMak CCIS 2-Day Hackathon.
            Developed by Team 2nd Choice (San Jose, Siazon, Togle).
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
