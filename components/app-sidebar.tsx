"use client"

import { Home, Code, Radio, MessageSquareText, Gamepad2, Earth, ChartLine, Ship, Users } from "lucide-react"
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
} from "@/components/ui/sidebar";
import Link from "next/link";
 

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
          url: "/dashboard/web-traffic",
          icon: Earth,
        },
        {
          title: "Onchain Metrics",
          url: "/dashboard/onchain-metrics",
          icon: ChartLine,
        },
      ],
    },
    {
      title: "Impact",
      items: [
        {
          title: "Projects",
          url: "/dashboard/projects",
          icon: Ship,
        },
        {
          title: "Developers",
          url: "/dashboard/developers",
          icon: Users,
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
                    {
                      item.title === "Home" ? (
                        <Link className="font-medium" href="/dashboard">
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {item.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.title}</p>
                      )
                    }
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                            <Link href={item.url ?? "/"}>
                              {'icon' in item && <item.icon className="w-4 h-4" />}
                              {item.title}
                            </Link>
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