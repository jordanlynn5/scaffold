-- Slice 6: WhatsApp is on hold for version 1 (learner decision, Oct 23,
-- 2026), so Sarah's nudge goes by email and also waits on Home. Home shows
-- the same opening line as that day's email, so the line is kept.

alter table public.nudge_log add column line text;
