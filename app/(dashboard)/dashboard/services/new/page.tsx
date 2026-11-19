"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NewServicePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          duration: Number(formData.get("duration")),
          price: Number(formData.get("price")),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create service.");
      }

      router.push("/dashboard/services");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create service.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <Link
          href="/dashboard/services"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to services
        </Link>
        <h1 className="text-2xl font-bold">Add Service</h1>
        <p className="text-muted-foreground">
          Define the service, its duration, and price.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-border p-6"
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Service name
          <input
            name="name"
            required
            maxLength={120}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={4}
            maxLength={1000}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Duration (minutes)
            <input
              name="duration"
              type="number"
              min="1"
              step="1"
              required
              className="rounded-md border border-input bg-background px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Price (USD)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              className="rounded-md border border-input bg-background px-3 py-2 font-normal"
            />
          </label>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/services")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Service"}
          </Button>
        </div>
      </form>
    </div>
  );
}
