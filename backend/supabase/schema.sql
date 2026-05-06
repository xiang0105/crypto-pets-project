create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  wallet text not null unique check (wallet = lower(wallet) and wallet ~ '^0x[a-f0-9]{40}$'),
  username text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_nonces (
  nonce uuid primary key,
  wallet text not null check (wallet = lower(wallet) and wallet ~ '^0x[a-f0-9]{40}$'),
  message text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_id text not null,
  contract_address text not null check (contract_address = lower(contract_address) and contract_address ~ '^0x[a-f0-9]{40}$'),
  chain_id integer not null,
  name text not null,
  element text not null check (element in ('citrus', 'ember', 'frost', 'bloom')),
  stage integer not null default 1 check (stage between 1 and 5),
  token_uri text not null,
  stats jsonb not null,
  exp_current integer not null default 0 check (exp_current >= 0),
  exp_next integer not null default 1000 check (exp_next > 0),
  birth_time timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chain_id, contract_address, token_id)
);

create table if not exists public.expeditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pet_ids uuid[] not null check (array_length(pet_ids, 1) between 1 and 4),
  expedition_type text not null default 'forest' check (expedition_type in ('forest', 'market', 'training')),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  claimed_at timestamptz,
  status text not null default 'started' check (status in ('started', 'claimed', 'cancelled')),
  reward jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.friends (
  user_id uuid not null references public.users(id) on delete cascade,
  friend_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

create index if not exists users_wallet_idx on public.users(wallet);
create index if not exists auth_nonces_wallet_idx on public.auth_nonces(wallet);
create index if not exists auth_nonces_expires_at_idx on public.auth_nonces(expires_at);
create index if not exists pets_user_id_idx on public.pets(user_id);
create index if not exists pets_nft_idx on public.pets(chain_id, contract_address, token_id);
create index if not exists expeditions_user_status_idx on public.expeditions(user_id, status);
create index if not exists expeditions_ends_at_idx on public.expeditions(ends_at);
create index if not exists friends_friend_id_idx on public.friends(friend_id);
create index if not exists friend_requests_recipient_status_idx on public.friend_requests(recipient_id, status);

alter table public.users enable row level security;
alter table public.auth_nonces enable row level security;
alter table public.pets enable row level security;
alter table public.expeditions enable row level security;
alter table public.friends enable row level security;
alter table public.friend_requests enable row level security;

create policy users_select_own on public.users
  for select using (wallet = lower(coalesce(auth.jwt() ->> 'wallet', '')));

create policy pets_select_own on public.pets
  for select using (
    exists (
      select 1 from public.users
      where users.id = pets.user_id
      and users.wallet = lower(coalesce(auth.jwt() ->> 'wallet', ''))
    )
  );

create policy expeditions_select_own on public.expeditions
  for select using (
    exists (
      select 1 from public.users
      where users.id = expeditions.user_id
      and users.wallet = lower(coalesce(auth.jwt() ->> 'wallet', ''))
    )
  );

create policy friends_select_own on public.friends
  for select using (
    exists (
      select 1 from public.users
      where users.id = friends.user_id
      and users.wallet = lower(coalesce(auth.jwt() ->> 'wallet', ''))
    )
  );

create policy friend_requests_select_own on public.friend_requests
  for select using (
    exists (
      select 1 from public.users
      where users.id in (friend_requests.requester_id, friend_requests.recipient_id)
      and users.wallet = lower(coalesce(auth.jwt() ->> 'wallet', ''))
    )
  );

-- No anon insert/update/delete policies are defined. The backend uses the service role key,
-- which must remain server-only, to perform validated game-state mutations.
