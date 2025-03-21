"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";

export default function Header() {
  const router = useRouter();
  const signOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
  };

  return (
    <div className="flex flex-row justify-between items-center w-full p-4 border-b">
      <div className="flex h-5 items-center space-x-4 text-sm">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <h1>DevRel</h1>
      </div>
      <Button variant="outline" size="icon" onClick={signOut}>
        <LogOut />
      </Button>
    </div>
  );
}
