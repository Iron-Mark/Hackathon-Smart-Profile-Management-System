import { Home, Inbox, User2, Settings, LogOut, RotateCcw } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import supabaseAccountActions from '@/tools/accounts/supabaseAccountActions'
import { isDemoSupabaseEnabled, resetDemoSupabaseState } from '@/client/demoSupabase'
import logoLong from '@/assets/LOGO-FPMS_Long.png'

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
    { title: 'Dashboard', url: '/faculty/dashboard', icon: Home },
    { title: 'Profile', url: '/faculty/profile', icon: User2 },
    { title: 'Uploaded Files', url: '/faculty/uploaded', icon: Inbox },
    { title: 'Settings', url: '/faculty/settings', icon: Settings },
    {
      title: 'Logout',
      icon: LogOut,
      onClick: () => {
        supabaseAccountActions.logOutUser()
        navigate('/')
      }
    }
  ]

  const adminItems = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
    { title: 'Accounts', url: '/admin/accounts', icon: User2 },
    { title: 'Approvals', url: '/admin/approvals', icon: Inbox },
    { title: 'Audit Logs', url: '/admin/audit-logs', icon: Inbox }, // Consider a more appropriate icon
    { title: 'Reports', url: '/admin/reports', icon: Inbox }, // Consider a more appropriate icon
    { title: 'Settings', url: '/admin/settings', icon: Settings },
    { title: 'Help & Support', url: '/admin/help', icon: Settings }, // Added Help & Support, consider a 'HelpCircle' icon if available
    {
      title: 'Logout',
      icon: LogOut,
      onClick: () => {
        supabaseAccountActions.logOutUser()
        navigate('/')
      } // Assuming admin and faculty logout is the same
    }
  ]
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const items = isAdminRoute ? adminItems : facultyItems
  const showDemoReset = isDemoSupabaseEnabled()

  const handleDemoReset = () => {
    resetDemoSupabaseState()
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
              {' '}
              <img
                alt='CCIS Smart FPMS'
                src={logoLong}
                className='mt-15 w-100 h-auto'
              />
            </SidebarGroupLabel>
            <SidebarGroupContent className='mt-20'>
              <SidebarMenu>
                {items.map(item => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={`flex items-center gap-2 rounded-md p-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-gray-100 text-green-500! font-semibold'
                            : 'text-gray-50! hover:bg-gray-500 focus:bg-gray-100'
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
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left text-gray-50! transition-colors hover:bg-gray-500 focus:bg-gray-100"
                    onClick={handleDemoReset}
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Clear demo data</span>
                  </button>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-4 flex justify-start">
            <ThemeToggle />
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
