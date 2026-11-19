import { getSupabaseClient } from "@/lib/supabase";

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "pending";

export interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  service: string;
  serviceId: string | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewAppointment = Pick<
  Appointment,
  | "clientId"
  | "clientName"
  | "clientEmail"
  | "clientPhone"
  | "service"
  | "serviceId"
  | "date"
  | "time"
  | "status"
  | "price"
  | "notes"
>;

const TABLE = "appointments";

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getAppointmentById(
  id: string,
): Promise<Appointment | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Appointment | null;
}

export async function createAppointment(
  appointment: NewAppointment,
): Promise<Appointment> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(appointment)
    .select("*")
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(
  id: string,
  update: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...update, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Appointment not found.");
}

export async function deleteAppointment(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Appointment not found.");
}

export async function getAppointmentsByDate(
  date: string,
): Promise<Appointment[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("date", date)
    .order("time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getUpcomingAppointments(
  limit = 10,
): Promise<Appointment[]> {
  const today = new Date().toISOString().slice(0, 10);
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .gte("date", today)
    .eq("status", "upcoming")
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Appointment[];
}
