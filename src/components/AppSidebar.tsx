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
  Scale
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
  { title: "Dashboard", url: "/dashboard", icon: Activity },
]

const protectionItems = [
  { title: "Upload & Protect", url: "/upload", icon: Upload },
  { title: "Live Monitoring", url: "/monitoring", icon: Search },
  { title: "Visual Scan", url: "/visual-recognition", icon: Bot },
  { title: "Deep Web Scan", url: "/deep-scan", icon: Shield },
]

const resourcesItems = [
  { title: "Community", url: "/community", icon: Users },
  { title: "Legal Templates", url: "/legal-templates", icon: FileText },
  { title: "Lawyers Directory", url: "/lawyers", icon: Scale },
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
  const getNavClasses = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50"

  const renderMenuSection = (items: any[], label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getNavClasses(item.url)}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="px-2 py-4">
        {/* Logo */}
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
            )}
          </div>
        </div>

        {renderMenuSection(mainItems, "Main")}
        {renderMenuSection(protectionItems, "Protection")}
        {renderMenuSection(resourcesItems, "Resources")}
        {renderMenuSection(aboutItems, "About")}
      </SidebarContent>
    </Sidebar>
  )
}