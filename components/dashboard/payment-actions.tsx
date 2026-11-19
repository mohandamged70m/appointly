"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PaymentActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(nextStatus: "paid" | "refunded") {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update payment.");
      }

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update payment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "refunded") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "pending" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSaving}
          onClick={() => updateStatus("paid")}
        >
          Mark paid
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isSaving}
          onClick={() => updateStatus("refunded")}
        >
          Refund
        </Button>
      )}
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
