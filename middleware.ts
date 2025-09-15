import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;
 
export async function middleware(request: NextRequest) {
	// Temporarily disable authentication for Vercel testing
	// TODO: Re-enable authentication once we debug the session issues
	// const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
	// 	baseURL: request.nextUrl.origin,
	// 	headers: {
	// 		cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
	// 	},
	// });

	// if (!session) {
	// 	return NextResponse.redirect(new URL("/signin", request.url));
	// }

	return NextResponse.next();
}
 
export const config = {
	matcher: [], // Temporarily disable middleware for Vercel testing
};