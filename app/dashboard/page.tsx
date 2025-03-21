"use client"

import { authClient } from "@/lib/auth-client" // import the auth client
 
export default function Dashboard() {
  const { 
    data: session, 
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession() 
 
  if (session?.user?.emailVerified) {
    return <p>Welcome!</p>
  }
 
  return <p>You need to sign in to view this page!</p>
}