import { getSupabaseClient } from "@/lib/supabase";

export type PaymentStatus = "paid" | "pending" | "refunded";
export type PaymentMethod = "card" | "cash" | "transfer";

export interface Payment {
  id: string;
  clientName: string;
  clientId: string | null;
  service: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  method: PaymentMethod;
  appointmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewPayment = Pick<
  Payment,
  "clientName" | "clientId" | "service" | "amount" | "date" | "status" | "method"
> &
  Partial<Pick<Payment, "appointmentId">>;

const TABLE = "payments";

export async function getPayments(): Promise<Payment[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function getPaymentsForClient(
  clientId: string,
): Promise<Payment[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("clientId", clientId)
    .eq("status", "paid");

  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Payment | null;
}

export async function createPayment(payment: NewPayment): Promise<Payment> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payment)
    .select("*")
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function updatePayment(
  id: string,
  update: Partial<Pick<Payment, "status" | "method" | "amount" | "date">>,
): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...update, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Payment not found.");
}

export async function deletePayment(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Payment not found.");
}
