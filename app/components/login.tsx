"use client";

import Link from "next/link";
import { type SVGProps, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="z-10 mx-auto w-full max-w-[500px] text-white">
        <div className="mb-8 text-center">
          <h1 className="font-geist text-3xl font-normal tracking-tighter">
            Welcome back
          </h1>
          <p className="font-geist font-normal text-gray-800/90 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-white"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="block w-full rounded-md border-0 py-3 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 sm:text-sm/6"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="block w-full rounded-md border-0 py-3 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 sm:text-sm/6"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-600"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 block text-sm/6 text-white"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm/6">
              <a
                href="/forget-password"
                className="font-normal text-white hover:text-purple-100"
              >
                Forgot password?
              </a>
            </div>
          </div>
          <button
            onClick={signIn}
            className="font-geist relative mx-auto h-12 w-full transform-gpu overflow-hidden rounded bg-neutral-950 bg-purple-200/10 px-5 py-2.5 text-center tracking-tighter text-white transition-all duration-300 hover:bg-neutral-800 hover:bg-transparent/5 hover:ring-2 hover:ring-purple-800 hover:ring-offset-2 hover:ring-offset-zinc-900 active:bg-transparent dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset]"
          >
            {loading ? (
              <span className="relative">Signing In...</span>
            ) : (
              <span className="relative">Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?
            <Link
              className="ml-2 font-medium text-gray-900 underline-offset-4 hover:underline dark:text-gray-500"
              href="/signup"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}