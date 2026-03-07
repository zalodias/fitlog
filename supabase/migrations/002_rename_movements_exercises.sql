-- Rename library table: exercises → movements
alter table exercises rename to movements;

-- Strength blocks become "exercises" (one movement + sets per day)
alter table strength_blocks rename column exercise_id to movement_id;
alter table strength_blocks rename to exercises;

-- Sets belong to an exercise (was strength_block_id)
alter table sets rename column strength_block_id to exercise_id;

-- Workout ingredients: workout_exercises → workout_movements
alter table workout_exercises rename column exercise_id to movement_id;
alter table workout_exercises rename to workout_movements;

-- Update indexes (recreate with new table/column names for clarity)
drop index if exists strength_blocks_session_id_idx;
create index on exercises(session_id);

drop index if exists sets_strength_block_id_idx;
create index on sets(exercise_id);

drop index if exists workout_exercises_workout_id_idx;
create index on workout_movements(workout_id);
