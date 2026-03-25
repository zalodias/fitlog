create type metric as enum ('reps', 'weight', 'duration', 'distance', 'calories');

alter table movements add column metrics metric[] not null default '{}';

alter table sets add column distance numeric(8,2);
alter table sets add column calories numeric(6,2);

alter table workout_movements add column duration integer;
alter table workout_movements add column calories numeric(6,2);

-- Backfill metrics by movement name
update movements set metrics = array['reps', 'weight']::metric[]
  where name in (
    'Back Squat', 'Front Squat', 'Deadlift', 'Clean', 'Snatch',
    'Thruster', 'Press', 'Push Press', 'Bench Press',
    'KB Swing', 'KB Clean', 'KB Snatch'
  );

update movements set metrics = array['reps']::metric[]
  where name in (
    'Pull-up', 'Muscle-up', 'Handstand Push-up',
    'Toes-to-Bar', 'Box Jump', 'Double-Unders', 'Burpee'
  );

update movements set metrics = array['distance', 'duration']::metric[]
  where name in ('Row', 'Run');

update movements set metrics = array['calories', 'duration']::metric[]
  where name in ('Bike');
