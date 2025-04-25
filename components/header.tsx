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
    <div className="flex flex-row justify-between items-center w-full p-4 border-b">
      <div className="flex h-5 items-center space-x-4 text-sm">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const path = `/${segments.slice(0, index + 1).join('/')}`;
              const isLast = index === segments.length - 1;

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem key={path}>
                    {isLast ? (
                      <BreadcrumbPage>{segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={path}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Button variant="outline" size="icon" onClick={signOut}>
        <LogOut />
      </Button>
    </div>
  );
}
