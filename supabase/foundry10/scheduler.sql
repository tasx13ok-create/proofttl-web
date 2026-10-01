-- FOUNDRY-10 cloud scheduler. Safe to run only after schema.sql.
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname='foundry10_tick';

select cron.schedule(
  'foundry10_tick',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://evrsofjaaudibnihjafb.supabase.co/functions/v1/foundry10-api/scheduled-tick',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
