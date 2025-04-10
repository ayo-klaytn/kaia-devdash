"use client"

import { Home, Code, Radio, MessageSquareText, Gamepad2, Earth } from "lucide-react"
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
 
// Menu items.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Activity",
      items: [
        {
          title: "GitHub",
          url: "/dashboard/github",
          icon: Code,
        },
        {
          title: "X / Twitter",
          url: "/dashboard/x",
          icon: Radio,
        },
        {
          title: "DevForum",
          url: "/dashboard/devforum",
          icon: MessageSquareText,
        },
        {
          title: "Discord",
          url: "/dashboard/discord",
          icon: Gamepad2,
        },
        {
          title: "Web Traffic",
          url: "/dashboard/webtraffic",
          icon: Earth,
        },
      ],
    },
    {
      title: "Impact",
      items: [
        {
          title: "Projects",
          url: "/dashboard/projects",
        },
        {
          title: "Developers",
          url: "/dashboard/developers",
        },
      ],
    },
  ],
}
 
export function AppSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Kaia Foundation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}