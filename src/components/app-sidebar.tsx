import {
  BarChart3,
  CircleHelp,
  ClipboardCheck,
  FileStack,
  Home,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  ScrollText,
  Settings,
  ShieldCheck,
  User2,
  UsersRound
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import demoAccountActions from '@/tools/accounts/demoAccountActions'
import { isDemoBackendEnabled, resetDemoBackendState } from '@/client/demoBackend'
import logoLong from '@/assets/LOGO-FPMS_Long.png'
import { ClerkShowcaseControls } from '@/components/ClerkShowcaseControls'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

interface AppSidebarProps {
  className?: string
}

import { ThemeToggle } from '@/components/ThemeToggle'

export function AppSidebar ({ className }: AppSidebarProps) {
  const navigate = useNavigate()
  const facultyItems = [
    { title: 'Dashboard', url: '/faculty/dashboard', icon: LayoutDashboard },
    { title: 'Profile', url: '/faculty/profile', icon: User2 },
    { title: 'Uploaded Files', url: '/faculty/uploaded', icon: FileStack },
    { title: 'Settings', url: '/faculty/settings', icon: Settings },
    {
      title: 'Logout',
      icon: LogOut,
      onClick: () => {
        demoAccountActions.logOutUser()
        navigate('/')
      }
    }
  ]

  const adminItems = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
    { title: 'Accounts', url: '/admin/accounts', icon: UsersRound },
    { title: 'Approvals', url: '/admin/approvals', icon: ClipboardCheck },
    { title: 'Audit Logs', url: '/admin/audit-logs', icon: ScrollText },
    { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
    { title: 'Help & Support', url: '/admin/help', icon: CircleHelp },
    {
      title: 'Logout',
      icon: LogOut,
      onClick: () => {
        demoAccountActions.logOutUser()
        navigate('/')
      } // Assuming admin and faculty logout is the same
    }
  ]
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const items = isAdminRoute ? adminItems : facultyItems
  const showDemoReset = isDemoBackendEnabled()

  const handleDemoReset = () => {
    resetDemoBackendState()
    window.sessionStorage.setItem(
      'smart-profile-demo-reset-message',
      'Demo data reset to the seeded showcase state.'
    )
    navigate('/auth/login')
  }

  return (
    <div className={className}>
      <Sidebar>
        <SidebarContent className="flex flex-col h-full">
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel>
              <div className="mt-6 flex items-center gap-3 px-1">
                <img
                  alt='CCIS Smart FPMS'
                  src={logoLong}
                  className='h-auto w-36'
                />
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent className='mt-12'>
              <SidebarMenu>
                {items.map(item => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={`flex items-center gap-2 rounded-md p-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground'
                        }`}
                        asChild
                        onClick={item.onClick}
                      >
                        {item.url ? (
                          <Link to={item.url}>
                            <item.icon className='w-5 h-5' />
                            <span>{item.title}</span>
                          </Link>
                        ) : (
                          <div className='flex items-center gap-2 '>
                            <item.icon className='w-5 h-5' />
                            <span>{item.title}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
              {showDemoReset && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground"
                    onClick={handleDemoReset}
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Clear demo data</span>
                  </button>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto space-y-4 p-4">
            <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2 text-xs text-sidebar-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Browser-local reviewer mode</span>
            </div>
            <ClerkShowcaseControls />
            <ThemeToggle />
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
