"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          notes: formData.get("notes"),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create client.");
      }

      router.push(`/dashboard/clients/${result.id}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create client.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <Link
          href="/dashboard/clients"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to clients
        </Link>
        <h1 className="text-2xl font-bold">Add Client</h1>
        <p className="text-muted-foreground">
          Save contact information for a new client.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-border p-6"
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Name
          <input
            name="name"
            autoComplete="name"
            required
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Notes
          <textarea
            name="notes"
            rows={4}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/clients")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
