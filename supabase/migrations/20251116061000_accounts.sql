-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
-- Public user profiles synced with auth.users
-- This table stores public profile information that can be read by all users
-- (needed for collaboration features: showing collaborator names, avatars, etc.)
create table if not exists
    public.accounts
(
    id          uuid unique  not null default extensions.uuid_generate_v4(),
    name        varchar(255) not null,
    email       varchar(320) unique,  -- Synced from auth.users
    updated_at  timestamp with time zone,
    created_at  timestamp with time zone,
    picture_url varchar(1000),       -- User avatar/profile picture
    public_data jsonb                 default '{}'::jsonb not null,  -- Additional public profile data
    primary key (id)
);

-- =====================================================
-- ENABLE RLS
-- =====================================================
alter table public.accounts
    enable row level security;

-- =====================================================
-- RLS POLICIES FOR ACCOUNTS
-- =====================================================

-- SELECT(accounts):
-- Users can read their own accounts only
-- Use SECURITY DEFINER functions to read other users' accounts for collaboration
create policy accounts_read on public.accounts for
    select
    to authenticated using (
        (select auth.uid()) = id
    );

-- UPDATE(accounts):
-- Users can update their own accounts only
create policy accounts_update on public.accounts
    for update
    to authenticated using (
        (select auth.uid()) = id
    )
    with
    check (
        (select auth.uid()) = id
    );

-- NOTE: No INSERT policy
-- Accounts are only created via the 'new_user_created_setup' trigger
-- when a user signs up through auth.users. Direct inserts are not allowed.

-- =====================================================
-- COLUMN-LEVEL PERMISSIONS
-- =====================================================
-- Revoke all on accounts table from authenticated and service_role
revoke all on public.accounts
    from
    authenticated,
    service_role;

-- Open up access to accounts
grant
    select,
    insert,
    update,
    delete on table public.accounts to authenticated,
    service_role;

-- =====================================================
-- TRIGGERS FOR FIELD PROTECTION
-- =====================================================

-- Function "public.protect_account_fields"
-- Protects critical fields (id, email) from being updated by users
-- These fields are managed automatically via auth.users sync
create
    or replace function public.protect_account_fields() returns trigger as
$$
begin
    if current_user in ('authenticated', 'anon') then
        if new.id <> old.id or new.email <> old.email then
            raise exception 'You do not have permission to update this field';

        end if;

    end if;

    return NEW;

end
$$ language plpgsql
    set
        search_path = '';

-- Trigger to protect account fields
create trigger protect_account_fields
    before
        update
    on public.accounts
    for each row
execute function public.protect_account_fields();

-- =====================================================
-- SYNC WITH AUTH.USERS
-- =====================================================
-- These triggers keep public.accounts in sync with auth.users
-- - new_user_created_setup: Creates account when user signs up
-- - handle_update_user_email: Syncs email changes from auth.users

-- Function to update account email when auth.users email is updated
create
    or replace function public.handle_update_user_email() returns trigger
    language plpgsql
    security definer
    set
        search_path = '' as
$$
begin
    update
        public.accounts
    set email = new.email
    where id = new.id;

    return new;

end;

$$;

-- Trigger: Sync email updates from auth.users to public.accounts
create trigger "on_auth_user_updated"
    after
        update of email
    on auth.users
    for each row
execute procedure public.handle_update_user_email();

-- Function "public.new_user_created_setup"
-- Creates a new account in public.accounts when a user signs up
-- Extracts name from OAuth metadata or email, and avatar from OAuth
create
    or replace function public.new_user_created_setup() returns trigger
    language plpgsql
    security definer
    set
        search_path = '' as
$$
declare
    user_name   text;
    picture_url text;
begin
    if new.raw_user_meta_data ->> 'name' is not null then
        user_name := new.raw_user_meta_data ->> 'name';

    end if;

    if user_name is null and new.email is not null then
        user_name := split_part(new.email, '@', 1);

    end if;

    if user_name is null then
        user_name := '';

    end if;

    if new.raw_user_meta_data ->> 'avatar_url' is not null then
        picture_url := new.raw_user_meta_data ->> 'avatar_url';
    else
        picture_url := null;
    end if;

    insert into public.accounts(id,
                                name,
                                picture_url,
                                email)
    values (new.id,
            user_name,
            picture_url,
            new.email);

    return new;

end;

$$;

-- Trigger: Create account when a new user signs up via auth.users
create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute procedure public.new_user_created_setup();
