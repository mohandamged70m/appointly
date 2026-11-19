import { getSupabaseClient } from "@/lib/supabase";

export interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AvailabilityInput = Pick<
  AvailabilitySlot,
  "day" | "startTime" | "endTime" | "isAvailable"
>;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("availability")
    .select("*");

  if (error) throw error;

  const slots = (data ?? []) as AvailabilitySlot[];
  return slots.sort((left, right) => DAYS.indexOf(left.day) - DAYS.indexOf(right.day));
}

export async function getAvailabilityByDay(
  day: string,
): Promise<AvailabilitySlot | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("day", day)
    .maybeSingle();

  if (error) throw error;
  return data as AvailabilitySlot | null;
}

export async function upsertAvailability(
  slots: AvailabilityInput[],
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("availability")
    .upsert(
      slots.map((slot) => ({ ...slot, updatedAt })),
      { onConflict: "userId,day" },
    );

  if (error) throw error;
}
