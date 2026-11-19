import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ClientEditForm } from "@/components/dashboard/client-edit-form";
import { getClientById } from "@/lib/data/clients";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to client
        </Link>
        <h1 className="text-2xl font-bold">Edit Client</h1>
      </header>
      <ClientEditForm client={client} />
    </div>
  );
}
