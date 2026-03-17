migrate((app) => {
  // Harden rules so each coach can only access their own data.
  // Keep rules compatible with current frontend payloads.

  try {
    const athletesCol = app.findCollectionByNameOrId("athletes");
    athletesCol.createRule = '@request.auth.id != "" && @request.data.coach_id = @request.auth.id';
    app.save(athletesCol);
  } catch (e) { }

  try {
    const programsCol = app.findCollectionByNameOrId("programs");
    programsCol.createRule = '@request.auth.id != "" && @request.data.coach_id = @request.auth.id';
    app.save(programsCol);
  } catch (e) { }

  try {
    const workoutsCol = app.findCollectionByNameOrId("program_workouts");
    workoutsCol.listRule = "@request.auth.id = program_id.coach_id";
    workoutsCol.viewRule = "@request.auth.id = program_id.coach_id";
    workoutsCol.createRule = "@request.auth.id = program_id.coach_id";
    workoutsCol.updateRule = "@request.auth.id = program_id.coach_id";
    workoutsCol.deleteRule = "@request.auth.id = program_id.coach_id";
    app.save(workoutsCol);
  } catch (e) { }

  try {
    const exercisesCol = app.findCollectionByNameOrId("program_exercises");
    exercisesCol.listRule = "@request.auth.id = workout_id.program_id.coach_id";
    exercisesCol.viewRule = "@request.auth.id = workout_id.program_id.coach_id";
    exercisesCol.createRule = "@request.auth.id = workout_id.program_id.coach_id";
    exercisesCol.updateRule = "@request.auth.id = workout_id.program_id.coach_id";
    exercisesCol.deleteRule = "@request.auth.id = workout_id.program_id.coach_id";
    app.save(exercisesCol);
  } catch (e) { }

  try {
    const shareLinksCol = app.findCollectionByNameOrId("share_links");
    shareLinksCol.listRule = "@request.auth.id = athlete_id.coach_id";
    shareLinksCol.viewRule = "@request.auth.id = athlete_id.coach_id";
    app.save(shareLinksCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");
    // Ensure coach_id can't be forged on create.
    remindersCol.createRule = "@request.auth.id = @request.data.coach_id";
    remindersCol.updateRule = "@request.auth.id = coach_id";
    remindersCol.deleteRule = "@request.auth.id = coach_id";
    remindersCol.listRule = "@request.auth.id = coach_id";
    remindersCol.viewRule = "@request.auth.id = coach_id";
    app.save(remindersCol);
  } catch (e) { }

  try {
    const notificationsCol = app.findCollectionByNameOrId("sd_notifications");
    notificationsCol.createRule = '@request.auth.id != "" && @request.data.user = @request.auth.id';
    app.save(notificationsCol);
  } catch (e) { }

  try {
    const activityCol = app.findCollectionByNameOrId("sd_activity_logs");
    activityCol.createRule = '@request.auth.id != "" && @request.data.user = @request.auth.id';
    app.save(activityCol);
  } catch (e) { }
}, (app) => {
  // No-op rollback.
});

