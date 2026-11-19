"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/data/clients";

export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          notes: formData.get("notes"),
          status: formData.get("status"),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update client.");
      }

      router.push(`/dashboard/clients/${client.id}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update client.",
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
        Name
        <input
          name="name"
          defaultValue={client.name}
          required
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          defaultValue={client.email}
          required
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Phone
        <input
          name="phone"
          type="tel"
          defaultValue={client.phone}
          required
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Status
        <select
          name="status"
          defaultValue={client.status}
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Notes
        <textarea
          name="notes"
          rows={4}
          defaultValue={client.notes ?? ""}
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
          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
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
