-- Create licenses table for automated licensing with blockchain proof
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  artwork_id uuid null,
  file_hash text not null,
  hash_algo text not null default 'sha256',
  license_type text not null,
  terms text not null,
  tx_hash text null,
  chain text null,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.licenses enable row level security;

-- Policies: users manage their own licenses
create policy if not exists "Users can insert their licenses"
  on public.licenses for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can view their licenses"
  on public.licenses for select
  using (auth.uid() = user_id);

create policy if not exists "Users can update their licenses"
  on public.licenses for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their licenses"
  on public.licenses for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_licenses_user on public.licenses(user_id);
create index if not exists idx_licenses_hash on public.licenses(file_hash);

-- Timestamps trigger
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger if not exists trg_licenses_updated
before update on public.licenses
for each row execute function public.update_updated_at_column();

-- Private storage bucket for license artifacts (e.g., PDFs)
insert into storage.buckets (id, name, public)
values ('licenses', 'licenses', false)
on conflict (id) do nothing;

-- Storage policies for 'licenses' bucket
create policy if not exists "Users can upload their own licenses files"
  on storage.objects for insert
  with check (
    bucket_id = 'licenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can read their own licenses files"
  on storage.objects for select
  using (
    bucket_id = 'licenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own licenses files"
  on storage.objects for update
  using (
    bucket_id = 'licenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete their own licenses files"
  on storage.objects for delete
  using (
    bucket_id = 'licenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );