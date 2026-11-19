-- Appointly schema for a new Supabase project.
-- Run this once in the Supabase SQL Editor before starting the application.
-- This does not migrate or assign ownership to existing business data.

create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  "totalAppointments" integer not null default 0,
  "lastVisit" text,
  status varchar(10) not null default 'active',
  notes text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("userId", email)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text not null,
  duration integer not null,
  price numeric(10, 2) not null,
  active boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "clientId" uuid references clients(id) on delete set null,
  "clientName" text not null,
  "clientEmail" text not null,
  "clientPhone" text,
  service text not null,
  "serviceId" uuid references services(id) on delete set null,
  date text not null,
  time text not null,
  status varchar(20) not null default 'upcoming',
  price numeric(10, 2) not null,
  notes text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day text not null,
  "startTime" text not null,
  "endTime" text not null,
  "isAvailable" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("userId", day)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "clientName" text not null,
  "clientId" uuid references clients(id) on delete set null,
  service text not null,
  amount numeric(10, 2) not null,
  date text not null,
  status varchar(20) not null default 'pending',
  method varchar(10) not null default 'card',
  "appointmentId" uuid references appointments(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists idx_clients_user_id on clients("userId");
create index if not exists idx_services_user_id on services("userId");
create index if not exists idx_appointments_user_date on appointments("userId", date);
create index if not exists idx_appointments_user_status on appointments("userId", status);
create index if not exists idx_appointments_client_id on appointments("clientId");
create index if not exists idx_availability_user_id on availability("userId");
create index if not exists idx_payments_user_date on payments("userId", date);

revoke all on clients, services, appointments, availability, payments from anon;
grant select, insert, update, delete
  on clients, services, appointments, availability, payments to authenticated;

alter table clients enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table availability enable row level security;
alter table payments enable row level security;

drop policy if exists clients_owner_access on clients;
create policy clients_owner_access on clients
  for all to authenticated
  using (clients."userId" = (select auth.uid()))
  with check (clients."userId" = (select auth.uid()));

drop policy if exists services_owner_access on services;
create policy services_owner_access on services
  for all to authenticated
  using (services."userId" = (select auth.uid()))
  with check (services."userId" = (select auth.uid()));

drop policy if exists appointments_owner_access on appointments;
create policy appointments_owner_access on appointments
  for all to authenticated
  using (appointments."userId" = (select auth.uid()))
  with check (
    appointments."userId" = (select auth.uid())
    and (
      appointments."clientId" is null
      or exists (
        select 1 from clients c
        where c.id = appointments."clientId"
          and c."userId" = (select auth.uid())
      )
    )
    and (
      appointments."serviceId" is null
      or exists (
        select 1 from services s
        where s.id = appointments."serviceId"
          and s."userId" = (select auth.uid())
      )
    )
  );

drop policy if exists availability_owner_access on availability;
create policy availability_owner_access on availability
  for all to authenticated
  using (availability."userId" = (select auth.uid()))
  with check (availability."userId" = (select auth.uid()));

drop policy if exists payments_owner_access on payments;
create policy payments_owner_access on payments
  for all to authenticated
  using (payments."userId" = (select auth.uid()))
  with check (
    payments."userId" = (select auth.uid())
    and (
      payments."clientId" is null
      or exists (
        select 1 from clients c
        where c.id = payments."clientId"
          and c."userId" = (select auth.uid())
      )
    )
    and (
      payments."appointmentId" is null
      or exists (
        select 1 from appointments a
        where a.id = payments."appointmentId"
          and a."userId" = (select auth.uid())
      )
    )
  );
