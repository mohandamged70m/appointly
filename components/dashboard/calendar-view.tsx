"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/data/appointments";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function appointmentColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-600";
    case "cancelled":
      return "bg-destructive";
    case "pending":
      return "bg-amber-600";
    default:
      return "bg-blue-600";
  }
}

export function CalendarView({ initialMonth }: { initialMonth: string }) {
  const [month, setMonth] = useState(() => new Date(initialMonth));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        const response = await fetch("/api/appointments");
        const result: unknown = await response.json();
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !response.ok &&
              typeof result === "object" &&
              result !== null &&
              "error" in result
              ? String(result.error)
              : "Could not load appointments.",
          );
        }

        if (active) setAppointments(result as Appointment[]);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load appointments.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadAppointments();
    return () => {
      active = false;
    };
  }, []);

  const appointmentsByDate = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const current = grouped.get(appointment.date) ?? [];
      current.push(appointment);
      grouped.set(appointment.date, current);
    }
    return grouped;
  }, [appointments]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  function changeMonth(amount: number) {
    setMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  function goToCurrentMonth() {
    setMonth(new Date());
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your appointment schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={goToCurrentMonth}>
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-border shadow-sm">
        <h2 className="border-b border-border bg-muted/50 px-4 py-3 text-center text-sm font-semibold">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="px-1 py-3 text-center text-xs font-medium text-muted-foreground sm:px-4"
            >
              {weekday}
            </div>
          ))}
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading appointments...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-destructive" role="alert">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarCells.map((day, index) => {
              const key = day ? dateKey(year, monthIndex, day) : `blank-${index}`;
              const dayAppointments = day
                ? (appointmentsByDate.get(key) ?? [])
                : [];
              const isToday =
                day !== null &&
                dateKey(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  new Date().getDate(),
                ) === key;

              return (
                <div
                  key={key}
                  className={`min-h-24 border-b border-r border-border p-1.5 sm:min-h-32 sm:p-3 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`text-xs font-medium sm:text-sm ${
                            isToday ? "text-primary" : ""
                          }`}
                        >
                          {day}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <Link
                            key={appointment.id}
                            href={`/dashboard/appointments?from=${key}&to=${key}`}
                            title={`${appointment.time} · ${appointment.clientName} · ${appointment.service}`}
                            className="flex items-center gap-1 truncate text-[10px] hover:underline sm:text-xs"
                          >
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${appointmentColor(appointment.status)}`}
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {appointment.time} {appointment.clientName}
                            </span>
                          </Link>
                        ))}
                        {dayAppointments.length > 3 && (
                          <Link
                            href={`/dashboard/appointments?from=${key}&to=${key}`}
                            className="block text-[10px] text-muted-foreground hover:underline"
                          >
                            +{dayAppointments.length - 3} more
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
      {!isLoading && !error && appointments.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No appointments to display yet.
        </p>
      )}
    </div>
  );
}
