"use client";

import Link from "next/link";
import { type SVGProps, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await authClient.signIn.email(
      {
        email,
        password,
        rememberMe: remember,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setLoading(false);
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center">
      <div className="z-10 mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-geist text-3xl font-normal tracking-tighter">
            Welcome back
          </h1>
          <p className="font-geist font-normal">
            Sign in to your account to continue
          </p>
        </div>
        <form className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="email"
            >
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="email"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember-me" 
                onCheckedChange={(checked) => setRemember(checked === true)} 
              />
              <Label
                htmlFor="remember-me"
              >
                Remember me
              </Label>
            </div>
            <div className="text-sm/6">
              <Link
                href="/forget-password"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <Button
            onClick={signIn}
          >
            {loading ? (
              <span className="relative">Signing In...</span>
            ) : (
              <span className="relative">Sign In</span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?
            <Link
              className="ml-2 font-medium text-gray-900 underline-offset-4 hover:underline dark:text-gray-500"
              href="/signup"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}