import { Home, Inbox, User2, Settings, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import supabaseAccountActions from '@/tools/accounts/supabaseAccountActions'

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

  return (
    <div className={className}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {' '}
              <img
                src='../src/assets/LOGO-FPMS_Long.png'
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
                          <a href={item.url}>
                            <item.icon className='w-5 h-5' />
                            <span>{item.title}</span>
                          </a>
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
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
