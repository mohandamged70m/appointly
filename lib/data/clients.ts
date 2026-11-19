import { getSupabaseClient } from "@/lib/supabase";

import type { Appointment } from "@/lib/data/appointments";

export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewClient = Pick<Client, "name" | "email" | "phone"> &
  Partial<Pick<Client, "status" | "notes">>;

export type ClientUpdate = Partial<
  Pick<Client, "name" | "email" | "phone" | "status" | "notes">
>;

const TABLE = "clients";
type AppointmentSummary = Pick<
  Appointment,
  "clientId" | "date" | "status"
>;

function withAppointmentStats(
  client: Client,
  appointments: AppointmentSummary[],
) {
  const clientAppointments = appointments.filter(
    (appointment) => appointment.clientId === client.id,
  );
  const completedVisits = clientAppointments
    .filter((appointment) => appointment.status === "completed")
    .map((appointment) => appointment.date)
    .sort();

  return {
    ...client,
    totalAppointments: clientAppointments.length,
    lastVisit: completedVisits.at(-1) ?? null,
  };
}

export async function getClients() {
  const supabase = await getSupabaseClient();
  const [clientsResult, appointmentsResult] = await Promise.all([
    supabase.from(TABLE).select("*").order("name", { ascending: true }),
    supabase.from("appointments").select("clientId,date,status"),
  ]);

  if (clientsResult.error) throw clientsResult.error;
  if (appointmentsResult.error) throw appointmentsResult.error;

  const appointments = (appointmentsResult.data ?? []) as AppointmentSummary[];
  return ((clientsResult.data ?? []) as Client[]).map((client) =>
    withAppointmentStats(client, appointments),
  );
}

export async function getClientById(id: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("clientId,date,status")
    .eq("clientId", id);

  if (appointmentsError) throw appointmentsError;

  return withAppointmentStats(
    data as Client,
    (appointments ?? []) as AppointmentSummary[],
  );
}

export async function createClient(client: NewClient): Promise<Client> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: client.name.trim(),
      email: client.email.trim().toLowerCase(),
      phone: client.phone.trim(),
      status: client.status ?? "active",
      notes: client.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return { ...(data as Client), totalAppointments: 0, lastVisit: null };
}

export async function updateClient(
  id: string,
  update: ClientUpdate,
): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...update, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Client not found.");
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Client not found.");
}

export async function getClientAppointments(clientId: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("clientId", clientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Appointment[];
}
