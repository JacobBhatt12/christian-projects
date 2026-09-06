create extension if not exists pgcrypto;

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id text primary key,
  address text not null,
  city text not null,
  state char(2) not null,
  zip char(5) not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.assistance_resources (
  id text primary key,
  category_slug text not null references public.categories(slug),
  location_id text not null references public.locations(id),
  organization_name text not null,
  description text not null,
  phone text not null,
  website text not null default '',
  hours text[] not null default '{}',
  services text[] not null default '{}',
  eligibility text not null,
  required_documents text[] not null default '{}',
  languages text[] not null default '{}',
  application_instructions text not null,
  last_verified date not null,
  verification_status text not null check (verification_status in ('sample', 'unverified', 'verified')),
  is_sample boolean not null default false,
  is_free boolean not null default false,
  is_discounted boolean not null default false,
  transit_accessible boolean not null default false,
  online_available boolean not null default false,
  is_published boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alternatives (
  id text primary key,
  category_slug text not null references public.categories(slug),
  location_id text references public.locations(id),
  title text not null,
  provider text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null,
  comparison_label text not null,
  comparison_price numeric(10, 2) not null check (comparison_price >= 0),
  comparison_quantity numeric(10, 2) not null check (comparison_quantity > 0),
  monthly_uses numeric(10, 2) not null default 1 check (monthly_uses >= 0),
  tradeoffs text not null,
  is_free boolean not null default false,
  is_discounted boolean not null default false,
  transit_accessible boolean not null default false,
  online_available boolean not null default false,
  is_sample boolean not null default false,
  is_published boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  category_slug text not null references public.categories(slug),
  description text not null,
  address text not null,
  city text not null,
  state char(2) not null,
  zip char(5) not null,
  website text,
  services text not null,
  eligibility text not null,
  hours text not null,
  languages text not null,
  application_instructions text not null,
  attestation boolean not null check (attestation = true),
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested', 'rejected')),
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  resource_id text not null references public.assistance_resources(id) on delete cascade,
  verified_at timestamptz not null default now(),
  method text not null,
  notes text,
  verified_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  item_type text not null check (item_type in ('resource', 'alternative')),
  item_id text not null,
  created_at timestamptz not null default now(),
  unique (client_id, item_type, item_id)
);

create index if not exists assistance_resources_category_idx on public.assistance_resources(category_slug);
create index if not exists assistance_resources_published_idx on public.assistance_resources(is_published);
create index if not exists alternatives_category_idx on public.alternatives(category_slug);
create index if not exists alternatives_published_idx on public.alternatives(is_published);
create index if not exists locations_zip_idx on public.locations(zip);
create index if not exists submissions_status_idx on public.resource_submissions(status, created_at desc);
create index if not exists saved_items_client_idx on public.saved_items(client_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assistance_resources_set_updated_at on public.assistance_resources;
create trigger assistance_resources_set_updated_at before update on public.assistance_resources
for each row execute function public.set_updated_at();

drop trigger if exists alternatives_set_updated_at on public.alternatives;
create trigger alternatives_set_updated_at before update on public.alternatives
for each row execute function public.set_updated_at();

drop trigger if exists resource_submissions_set_updated_at on public.resource_submissions;
create trigger resource_submissions_set_updated_at before update on public.resource_submissions
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.assistance_resources enable row level security;
alter table public.alternatives enable row level security;
alter table public.resource_submissions enable row level security;
alter table public.verification_records enable row level security;
alter table public.saved_items enable row level security;

drop policy if exists "Public categories are readable" on public.categories;
create policy "Public categories are readable" on public.categories for select using (true);

drop policy if exists "Locations for public listings are readable" on public.locations;
create policy "Locations for public listings are readable" on public.locations for select using (true);

drop policy if exists "Published assistance resources are readable" on public.assistance_resources;
create policy "Published assistance resources are readable" on public.assistance_resources for select using (is_published = true);

drop policy if exists "Published alternatives are readable" on public.alternatives;
create policy "Published alternatives are readable" on public.alternatives for select using (is_published = true);

drop policy if exists "Anyone can suggest a resource" on public.resource_submissions;
create policy "Anyone can suggest a resource" on public.resource_submissions for insert with check (attestation = true and status = 'pending');

comment on table public.saved_items is 'Anonymous browser bookmarks. Access only through the server API using the service role; no public RLS policy is granted.';
comment on table public.resource_submissions is 'Contact fields are private and available only to trusted reviewers through the service role.';
