"use client"

import { Home, Code, Radio, MessageSquareText, Earth, ChartLine, Ship, Users, AlignEndVertical, Wrench } from "lucide-react"
import { usePathname } from 'next/navigation';
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
      title: "Dev Marketing",
      items: [
        {
          title: "X / Twitter",
          url: "/dashboard/x",
          icon: Radio,
        },
        {
          title: "Manage X Posts",
          url: "/dashboard/x/manage",
          icon: MessageSquareText,
        },
        {
          title: "Web Traffic",
          url: "/dashboard/web-traffic",
          icon: Earth,
        },
      ],
    },
    {
      title: "Dev Success",
      items: [
        {
          title: "GitHub",
          url: "/dashboard/github",
          icon: Code,
        },
        {
          title: "Developers",
          url: "/dashboard/developers",
          icon: Users,
        },
        {
          title: "Issue Resolution",
          url: "/dashboard/issue-resolution",
          icon: MessageSquareText,
        },
        {
          title: "Tool Adoption",
          url: "/dashboard/tool-adoption",
          icon: Wrench,
        },
        {
          title: "Onchain Metrics",
          url: "/dashboard/onchain-metrics",
          icon: ChartLine,
        },
        /*
        {
          title: "Kaia Wave",
          url: "/dashboard/kaia-wave",
          icon: Waves,
        }, */
      ],
    },
    {
      title: "Dev Education",
      items: [
        {
          title: "Code & Content",
          url: "/dashboard/code-content",
          icon: Ship,
        },
        {
          title: "Events",
          url: "/dashboard/events",
          icon: AlignEndVertical,
        },
        {
          title: "DevForum",
          url: "/dashboard/devforum",
          icon: MessageSquareText,
        },
      ],
    },
    /*
    {
      title: "Dev Core Components",
      items: [
        {
          title: "Developer Personas",
          url: "/dashboard/developer-personas",
          icon: Megaphone,
        },
        {
          title: "Developer Journey",
          url: "/dashboard/developer-journey",
          icon: Ship,
        }
      ],
    } */
  ],
}
 
export function AppSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative">
            <Image
              src="/kaia-logo.jpg"
              alt="Kaia Logo"
              width={36}
              height={36}
              className="object-contain shrink-0 rounded-md"
              priority
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold tracking-tight">Kaia</span>
            <span className="text-xs text-muted-foreground font-medium">Foundation</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {data.navMain.map((item, groupIndex) => (
                <SidebarMenuItem key={item.title} className="group">
                  {item.title === "Home" ? (
                    <SidebarMenuButton asChild className="rounded-lg">
                      <Link 
                        href="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 font-medium transition-all ${
                          pathname === "/dashboard"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/70"
                        }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.title}
                      </div>
                      {item.items?.length ? (
                        <SidebarMenuSub className="space-y-0.5">
                          {item.items.map((subItem) => {
                            const isActive = pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  isActive={isActive}
                                  className={`rounded-lg transition-all relative ${
                                    isActive 
                                      ? "bg-primary/10 text-primary font-medium" 
                                      : "hover:bg-muted/60"
                                  }`}
                                >
                                  <Link 
                                    href={subItem.url ?? "/"} 
                                    className="flex items-center gap-3 px-3 py-2 min-w-0"
                                  >
                                    {isActive && (
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                                    )}
                                    {'icon' in subItem && (
                                      <subItem.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                                    )}
                                    <span className="text-sm truncate flex-1 min-w-0">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      ) : null}
                      {groupIndex < data.navMain.length - 1 && (
                        <div className="h-px bg-border/50 mx-3 my-2" />
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}