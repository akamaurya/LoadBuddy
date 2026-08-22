-- Pause state must live on the profile, not as a OneSignal tag: the notify
-- edge function targets users by external_id alias, which bypasses tag and
-- segment filters entirely, so a tag-only pause never suppressed anything.
alter table public.profiles
  add column if not exists paused boolean not null default false;

comment on column public.profiles.paused is
  'When true, the notify edge function skips this user.';
