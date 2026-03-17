migrate((app) => {
  // Tighten collection rules to per-coach access and add missing workout_logs fields.
  try {
    const dailyCol = app.findCollectionByNameOrId("daily_tracking");
    dailyCol.listRule = "@request.auth.id = athlete_id.coach_id";
    dailyCol.viewRule = "@request.auth.id = athlete_id.coach_id";
    dailyCol.createRule = "@request.auth.id = athlete_id.coach_id";
    dailyCol.updateRule = "@request.auth.id = athlete_id.coach_id";
    dailyCol.deleteRule = "@request.auth.id = athlete_id.coach_id";
    app.save(dailyCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");
    remindersCol.listRule = "@request.auth.id = coach_id";
    remindersCol.viewRule = "@request.auth.id = coach_id";
    remindersCol.createRule = "@request.auth.id = coach_id";
    remindersCol.updateRule = "@request.auth.id = coach_id";
    remindersCol.deleteRule = "@request.auth.id = coach_id";
    app.save(remindersCol);
  } catch (e) { }

  try {
    const clientProgramsCol = app.findCollectionByNameOrId("client_programs");
    clientProgramsCol.listRule = "@request.auth.id = athlete_id.coach_id";
    clientProgramsCol.viewRule = "@request.auth.id = athlete_id.coach_id";
    clientProgramsCol.createRule = "@request.auth.id = athlete_id.coach_id";
    clientProgramsCol.updateRule = "@request.auth.id = athlete_id.coach_id";
    clientProgramsCol.deleteRule = "@request.auth.id = athlete_id.coach_id";
    app.save(clientProgramsCol);
  } catch (e) { }

  try {
    const workoutLogsCol = app.findCollectionByNameOrId("workout_logs");
    workoutLogsCol.listRule = "@request.auth.id = athlete_id.coach_id";
    workoutLogsCol.viewRule = "@request.auth.id = athlete_id.coach_id";
    workoutLogsCol.createRule = "@request.auth.id = athlete_id.coach_id";
    workoutLogsCol.updateRule = "@request.auth.id = athlete_id.coach_id";
    workoutLogsCol.deleteRule = "@request.auth.id = athlete_id.coach_id";

    if (!workoutLogsCol.fields.getByName("client_program_id")) {
      const clientProgramsCol = app.findCollectionByNameOrId("client_programs");
      workoutLogsCol.fields.add(new Field({
        type: "relation",
        name: "client_program_id",
        required: false,
        collectionId: clientProgramsCol.id,
        cascadeDelete: false,
        maxSelect: 1,
      }));
    }

    app.save(workoutLogsCol);
  } catch (e) { }

  try {
    const setLogsCol = app.findCollectionByNameOrId("set_logs");
    setLogsCol.listRule = "@request.auth.id = workout_log_id.athlete_id.coach_id";
    setLogsCol.viewRule = "@request.auth.id = workout_log_id.athlete_id.coach_id";
    setLogsCol.createRule = "@request.auth.id = workout_log_id.athlete_id.coach_id";
    setLogsCol.updateRule = "@request.auth.id = workout_log_id.athlete_id.coach_id";
    setLogsCol.deleteRule = "@request.auth.id = workout_log_id.athlete_id.coach_id";
    app.save(setLogsCol);
  } catch (e) { }
}, (app) => {
  // No-op rollback for rules.
});
