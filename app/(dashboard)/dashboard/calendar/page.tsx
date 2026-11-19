import { Suspense } from "react";
import { connection } from "next/server";

import { CalendarView } from "@/components/dashboard/calendar-view";

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading calendar...
        </div>
      }
    >
      <CalendarForRequest />
    </Suspense>
  );
}

async function CalendarForRequest() {
  await connection();
  return <CalendarView initialMonth={new Date().toISOString()} />;
}
