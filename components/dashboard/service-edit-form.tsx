"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/data/services";

export function ServiceEditForm({ service }: { service: Service }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
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
        throw new Error(result.error ?? "Could not update service.");
      }

      router.push("/dashboard/services");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update service.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border p-6"
    >
      <label className="flex flex-col gap-2 text-sm font-medium">
        Service name
        <input
          name="name"
          defaultValue={service.name}
          required
          maxLength={120}
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Description
        <textarea
          name="description"
          defaultValue={service.description}
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
            defaultValue={service.duration}
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
            defaultValue={Number(service.price)}
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
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
