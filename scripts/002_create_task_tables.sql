-- Create profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Policies for profiles
create policy "profiles_select_all"
  on public.profiles for select
  using (true); -- Everyone can see all profiles

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  column text not null check (column in ('todo', 'in-progress', 'done', 'pm-review', 'qa-review', 'done-done')),
  status text not null check (status in ('todo', 'in-progress', 'done', 'on-hold', 'qa', 'canceled')),
  priority text not null check (priority in ('high', 'medium', 'low')),
  due_date timestamp with time zone,
  assignee_id uuid references public.profiles(id) on delete set null,
  figma_link text,
  tagged_user_ids uuid[] default '{}',
  "order" integer not null default 1,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

-- Policies for tasks
create policy "tasks_select_all"
  on public.tasks for select
  using (true); -- Everyone can view all tasks

create policy "tasks_insert_authenticated"
  on public.tasks for insert
  with check (auth.uid() = created_by);

create policy "tasks_update_own_or_assigned_or_admin"
  on public.tasks for update
  using (
    auth.uid() = created_by OR 
    auth.uid() = assignee_id OR 
    auth.uid() = ANY(tagged_user_ids) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

create policy "tasks_delete_own_or_admin"
  on public.tasks for delete
  using (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create task_files table
create table if not exists public.task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  name text not null,
  type text not null,
  url text not null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  uploaded_at timestamp with time zone default now()
);

alter table public.task_files enable row level security;

create policy "task_files_select_all"
  on public.task_files for select
  using (true);

create policy "task_files_insert_authenticated"
  on public.task_files for insert
  with check (auth.uid() = uploaded_by);

create policy "task_files_delete_own_or_admin"
  on public.task_files for delete
  using (
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create task_comments table
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  tagged_user_ids uuid[] default '{}',
  created_at timestamp with time zone default now()
);

alter table public.task_comments enable row level security;

create policy "task_comments_select_all"
  on public.task_comments for select
  using (true);

create policy "task_comments_insert_authenticated"
  on public.task_comments for insert
  with check (auth.uid() = user_id);

create policy "task_comments_update_own"
  on public.task_comments for update
  using (auth.uid() = user_id);

create policy "task_comments_delete_own_or_admin"
  on public.task_comments for delete
  using (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create task_history table
create table if not exists public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  field text,
  old_value text,
  new_value text,
  created_at timestamp with time zone default now()
);

alter table public.task_history enable row level security;

create policy "task_history_select_all"
  on public.task_history for select
  using (true);

create policy "task_history_insert_authenticated"
  on public.task_history for insert
  with check (auth.uid() = user_id);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  task_id uuid references public.tasks(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_tasks_column on public.tasks(column);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_task_comments_task on public.task_comments(task_id);
create index if not exists idx_task_files_task on public.task_files(task_id);
create index if not exists idx_task_history_task on public.task_history(task_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- Create function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger for auto-creating profile
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
