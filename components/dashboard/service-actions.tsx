"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ServiceActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function toggleActive() {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update service.");
      }

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
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isSaving}
        onClick={toggleActive}
      >
        {active ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
        {active ? "Deactivate" : "Activate"}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
