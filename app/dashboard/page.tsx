"use client"

import { authClient } from "@/lib/auth-client" // import the auth client
import UnauthorizedComponent from "@/components/unauthorized"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const { 
    data: session, 
    isPending, //loading state
    error, //error object
  } = authClient.useSession() 
  
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    )
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (session?.user?.emailVerified) {
    return <p>Welcome!</p>
  }
 
  return <UnauthorizedComponent />
}