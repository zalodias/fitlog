-- Remove session type: type is now derived from blocks (exercises + workouts)
alter table sessions drop column type;
