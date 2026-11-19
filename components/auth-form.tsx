"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const fieldClassName =
  "mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = getSupabaseBrowserClient();

      if (isSignUp) {
        const name = String(formData.get("name") ?? "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) {
          setErrorMessage(error.message ?? "We couldn't create your account.");
          return;
        }

        form.reset();
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setSuccessMessage(
          "Check your email to confirm your account, then sign in.",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message ?? "We couldn't sign you in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          {isSignUp ? "Get started" : "Welcome back"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {isSignUp ? "Create your account" : "Sign in to Appointly"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isSignUp
            ? "Set up your account and bring your schedule together."
            : "Enter your details to get back to your schedule."}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isPending}>
        {isSignUp && (
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="name"
            >
              Full name
            </label>
            <input
              className={fieldClassName}
              autoComplete="name"
              id="name"
              name="name"
              placeholder="Your name"
              required
              type="text"
            />
          </div>
        )}

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            className={fieldClassName}
            autoComplete="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            {!isSignUp && (
              <span className="text-xs text-slate-500">
                Keep it private and secure
              </span>
            )}
          </div>
          <div className="relative">
            <input
              className={`${fieldClassName} pr-16`}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              id="password"
              minLength={isSignUp ? 8 : undefined}
              name="password"
              placeholder={isSignUp ? "At least 8 characters" : "Your password"}
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 my-auto h-9 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            {successMessage}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? isSignUp
              ? "Creating account..."
              : "Signing in..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        {isSignUp ? "Already have an account?" : "New to Appointly?"}{" "}
        <Link
          className="font-semibold text-indigo-700 underline-offset-4 hover:underline"
          href={isSignUp ? "/sign-in" : "/sign-up"}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
