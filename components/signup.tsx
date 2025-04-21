"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onSuccess: () => {
          setLoading(false);
          router.push("/dashboard");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
        onResponse: () => {
          setLoading(false);
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
          <p>
            Sign in to your account to continue
          </p>
        </div>
        <form className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="name"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">
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
          <Button
            onClick={signUp}
          >
            {loading ? (
              <span className="relative">Signing Up...</span>
            ) : (
              <span className="relative">Sign Up</span>
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Already have an account?
            <Link
              className="ml-2 font-medium text-gray-900 underline-offset-4 hover:underline dark:text-gray-500"
              href="/signin"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}