-- Development/staging reset only.
-- This clears indexed game data so the app can rebuild state from wallet-owned on-chain assets.

truncate table public.transactions restart identity cascade;
truncate table public.market_listings restart identity cascade;
truncate table public.expeditions restart identity cascade;
truncate table public.pet_teams restart identity cascade;
truncate table public.inventory restart identity cascade;
truncate table public.currencies restart identity cascade;
truncate table public.pets restart identity cascade;
truncate table public.friend_requests restart identity cascade;
truncate table public.friends restart identity cascade;

-- Keep public.users and public.auth_nonces by default so wallet login history is not destroyed.
-- Uncomment these lines only when you want a full auth reset:
-- truncate table public.auth_nonces restart identity cascade;
-- truncate table public.users restart identity cascade;
