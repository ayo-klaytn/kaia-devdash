"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const signOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin"); // redirect to login page
        },
      },
    });
  };

  return (
    <div className="flex flex-row justify-between items-center w-full px-6 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/dashboard"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const path = `/${segments.slice(0, index + 1).join('/')}`;
              const isLast = index === segments.length - 1;
              const displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-foreground">
                        {displayName}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={path}
                        className="hover:text-primary transition-colors"
                      >
                        {displayName}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={signOut} 
        className="hover:cursor-pointer hover:bg-muted transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
