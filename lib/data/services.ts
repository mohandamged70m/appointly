import { getSupabaseClient } from "@/lib/supabase";

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewService = Pick<
  Service,
  "name" | "description" | "duration" | "price"
> &
  Partial<Pick<Service, "active">>;

const TABLE = "services";

export async function getServices(): Promise<Service[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Service | null;
}

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function createService(service: NewService): Promise<Service> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...service,
      name: service.name.trim(),
      description: service.description.trim(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Service;
}

export async function updateService(
  id: string,
  update: Partial<Pick<Service, "name" | "description" | "duration" | "price" | "active">>,
): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...update, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Service not found.");
}

export async function deleteService(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Service not found.");
}
