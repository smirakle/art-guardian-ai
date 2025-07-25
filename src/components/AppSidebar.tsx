import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Home, 
  Upload, 
  Shield, 
  Activity, 
  Users, 
  FileText, 
  Settings, 
  Info, 
  Mail,
  Search,
  Bot,
  Scale,
  Eye,
  BarChart3
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
]

const protectionItems = [
  { title: "Upload & Protect", url: "/upload", icon: Upload },
  { title: "Live Monitoring", url: "/monitoring", icon: Activity },
  { title: "Visual Recognition", url: "/visual-recognition", icon: Eye },
  { title: "Deep Web Scan", url: "/deep-scan", icon: Shield },
  { title: "Web Scanner", url: "/web-scanner", icon: Search },
]

const resourcesItems = [
  { title: "Community", url: "/community", icon: Users },
  { title: "Legal Templates", url: "/legal-templates", icon: FileText },
  { title: "IP Lawyers", url: "/lawyers", icon: Scale },
]

const aboutItems = [
  { title: "About TSMO", url: "/about-tsmo", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  
  const renderMenuSection = (items: any[], label: string) => (
    <SidebarGroup className="mb-6">
      <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {!collapsed && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-10">
                <NavLink 
                  to={item.url} 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium truncate">{item.title}</span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar className="border-r border-slate-200 bg-white" collapsible="icon">
      <SidebarContent className="py-4">
        {/* Logo */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900">TSMO</span>
                <span className="text-xs text-slate-600">Art Protection</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-2">
          {renderMenuSection(mainItems, "Navigation")}
          {renderMenuSection(protectionItems, "Protection Tools")}
          {renderMenuSection(resourcesItems, "Resources")}
          {renderMenuSection(aboutItems, "Support")}
        </div>
        
        {/* Admin Section - if needed */}
        <div className="mt-auto px-2 pb-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-red-600 text-white shadow-sm" 
                            : "text-slate-700 hover:bg-red-50 hover:text-red-600"
                        }`
                      }
                    >
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="font-medium truncate">Admin</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}