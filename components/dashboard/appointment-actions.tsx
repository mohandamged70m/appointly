"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(nextStatus: "completed" | "cancelled") {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update appointment.");
      }

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update appointment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "completed" || status === "cancelled") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSaving}
          onClick={() => updateStatus("completed")}
        >
          Complete
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isSaving}
          onClick={() => updateStatus("cancelled")}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
