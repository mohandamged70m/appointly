"use client";

import { useEffect, useState } from "react";
import { Calendar, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AvailabilityInput } from "@/lib/data/availability";

const defaultSlots: AvailabilityInput[] = [
  { day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "Tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "Thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "Friday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "Saturday", startTime: "09:00", endTime: "14:00", isAvailable: true },
  { day: "Sunday", startTime: "", endTime: "", isAvailable: false },
];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState(defaultSlots);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/availability");
        const result: unknown = await response.json();
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !response.ok && typeof result === "object" && result !== null && "error" in result
              ? String(result.error)
              : "Could not load availability.",
          );
        }

        if (!active) return;
        const savedSlots = new Map(
          result.map((slot) => [
            (slot as { day: string }).day,
            slot as AvailabilityInput,
          ]),
        );
        setSlots(
          defaultSlots.map((defaultSlot) => ({
            ...defaultSlot,
            ...savedSlots.get(defaultSlot.day),
          })),
        );
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load availability.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadAvailability();
    return () => {
      active = false;
    };
  }, []);

  function updateSlot(
    day: string,
    change: Partial<AvailabilityInput>,
  ) {
    setSaved(false);
    setSlots((current) =>
      current.map((slot) =>
        slot.day === day ? { ...slot, ...change } : slot,
      ),
    );
  }

  async function saveAvailability() {
    setError("");
    setSaved(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slots),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not save availability.");
      }

      setSaved(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save availability.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-muted-foreground">
            Set the weekly hours available for new appointments.
          </p>
        </div>
        <Button
          type="button"
          onClick={saveAvailability}
          disabled={isLoading || isSaving}
        >
          <Save className="size-4" aria-hidden="true" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <section className="rounded-xl border border-border p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold">Weekly Schedule</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Clients can only be booked during open hours.
          </p>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading schedule...
          </p>
        ) : (
          <div className="divide-y divide-border">
            {slots.map((slot) => (
              <div
                key={slot.day}
                className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="font-medium">{slot.day}</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="sr-only">{slot.day} opening time</span>
                  <input
                    type="time"
                    value={slot.startTime}
                    disabled={!slot.isAvailable}
                    onChange={(event) =>
                      updateSlot(slot.day, { startTime: event.target.value })
                    }
                    className="rounded-md border border-input bg-background px-2.5 py-2 text-sm text-foreground disabled:opacity-50"
                  />
                  <span>to</span>
                  <span className="sr-only">{slot.day} closing time</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    disabled={!slot.isAvailable}
                    onChange={(event) =>
                      updateSlot(slot.day, { endTime: event.target.value })
                    }
                    className="rounded-md border border-input bg-background px-2.5 py-2 text-sm text-foreground disabled:opacity-50"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(event) =>
                      updateSlot(slot.day, {
                        isAvailable: event.target.checked,
                        ...(!event.target.checked
                          ? { startTime: "", endTime: "" }
                          : {
                              startTime:
                                slot.startTime ||
                                defaultSlots.find((item) => item.day === slot.day)
                                  ?.startTime ||
                                "09:00",
                              endTime:
                                slot.endTime ||
                                defaultSlots.find((item) => item.day === slot.day)
                                  ?.endTime ||
                                "17:00",
                            }),
                      })
                    }
                    className="size-4 accent-primary"
                  />
                  Open
                </label>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="mt-4 text-sm text-green-700" role="status">
            Availability saved.
          </p>
        )}
      </section>
    </div>
  );
}
