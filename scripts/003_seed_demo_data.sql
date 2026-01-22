-- Insert demo users into profiles table
-- Note: These users need to be created in Supabase Auth first
-- For demo purposes, we'll create the profile entries

-- Demo User 1: Dana Cohen (Admin)
insert into public.profiles (id, name, email, avatar, role)
values 
  ('11111111-1111-1111-1111-111111111111', 'דנה כהן', 'dana@insurance.co.il', '/woman-with-brown-hair-professional.jpg', 'admin')
on conflict (id) do nothing;

-- Demo User 2: Yossi Levy (User)
insert into public.profiles (id, name, email, avatar, role)
values 
  ('22222222-2222-2222-2222-222222222222', 'יוסי לוי', 'yossi@insurance.co.il', '/professional-man-glasses.png', 'user')
on conflict (id) do nothing;

-- Demo User 3: Michal Avraham (Admin)
insert into public.profiles (id, name, email, avatar, role)
values 
  ('33333333-3333-3333-3333-333333333333', 'מיכל אברהם', 'michal@insurance.co.il', '/professional-blonde-woman.png', 'admin')
on conflict (id) do nothing;

-- Demo User 4: Alon Shamir (User)
insert into public.profiles (id, name, email, avatar, role)
values 
  ('44444444-4444-4444-4444-444444444444', 'אלון שמיר', 'alon@insurance.co.il', '/man-beard-professional.jpg', 'user')
on conflict (id) do nothing;

-- Insert demo tasks
insert into public.tasks (id, title, description, "column", status, priority, due_date, assignee_id, figma_link, tagged_user_ids, "order", created_by, created_at, updated_at)
values 
  (
    'task-1',
    'עיצוב דף הבית החדש',
    'לעצב את דף הבית החדש של האתר עם מראה מודרני ונקי',
    'todo',
    'todo',
    'high',
    now() + interval '5 days',
    '11111111-1111-1111-1111-111111111111',
    'https://www.figma.com/file/example1',
    array['22222222-2222-2222-2222-222222222222']::uuid[],
    1,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '4 days',
    now() - interval '3 days'
  ),
  (
    'task-2',
    'פיתוח API למשתמשים',
    'לפתח API endpoints לניהול משתמשים במערכת',
    'in-progress',
    'in-progress',
    'high',
    now() + interval '3 days',
    '22222222-2222-2222-2222-222222222222',
    null,
    array[]::uuid[],
    1,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'task-3',
    'בדיקות QA למודול התשלומים',
    'לבצע בדיקות QA מקיפות למודול התשלומים',
    'done',
    'done',
    'medium',
    now() - interval '8 days',
    '33333333-3333-3333-3333-333333333333',
    null,
    array[]::uuid[],
    1,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '12 days',
    now() - interval '5 days'
  ),
  (
    'task-4',
    'תיעוד טכני של המערכת',
    'לכתוב תיעוד טכני מקיף של כל המערכת',
    'in-progress',
    'on-hold',
    'medium',
    now() + interval '10 days',
    '44444444-4444-4444-4444-444444444444',
    null,
    array[]::uuid[],
    2,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    'task-5',
    'אופטימיזציה של ביצועי המערכת',
    'לשפר את ביצועי המערכת וזמני הטעינה',
    'qa-review',
    'qa',
    'high',
    now() + interval '2 days',
    '22222222-2222-2222-2222-222222222222',
    null,
    array[]::uuid[],
    1,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '10 days',
    now() - interval '2 days'
  ),
  (
    'task-6',
    'עדכון ספריות צד שלישי',
    'לעדכן את כל הספריות לגרסאות האחרונות',
    'done-done',
    'done',
    'low',
    now() - interval '4 days',
    '33333333-3333-3333-3333-333333333333',
    null,
    array[]::uuid[],
    1,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '14 days',
    now() - interval '14 days'
  );

-- Insert demo comments
insert into public.task_comments (task_id, user_id, content, tagged_user_ids, created_at)
values 
  (
    'task-1',
    '22222222-2222-2222-2222-222222222222',
    'נראה מעולה! @דנה כהן אפשר לקבל פידבק?',
    array['11111111-1111-1111-1111-111111111111']::uuid[],
    now() - interval '2 days'
  ),
  (
    'task-2',
    '11111111-1111-1111-1111-111111111111',
    'התקדמות טובה, תמשיך ככה!',
    array[]::uuid[],
    now() - interval '1 day'
  );

-- Insert demo task history
insert into public.task_history (task_id, user_id, action, field, old_value, new_value, created_at)
values 
  (
    'task-1',
    '11111111-1111-1111-1111-111111111111',
    'עדכן',
    'status',
    null,
    'todo',
    now() - interval '4 days'
  ),
  (
    'task-2',
    '22222222-2222-2222-2222-222222222222',
    'עדכן',
    'column',
    'todo',
    'in-progress',
    now() - interval '1 day'
  );
