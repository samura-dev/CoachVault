// Миграция: исправление API rules для PocketBase v0.23+
// Relation поля требуют оператор ?= вместо = при сравнении с @request.auth.id
migrate((app) => {
  // --- sd_notifications ---
  try {
    const notifications = app.findCollectionByNameOrId("sd_notifications");
    notifications.listRule = "user ?= @request.auth.id";
    notifications.viewRule = "user ?= @request.auth.id";
    notifications.createRule = '@request.auth.id != ""';
    notifications.updateRule = "user ?= @request.auth.id";
    notifications.deleteRule = "user ?= @request.auth.id";
    app.save(notifications);
  } catch (e) {
    console.log("sd_notifications: " + e);
  }

  // --- athletes ---
  try {
    const athletes = app.findCollectionByNameOrId("athletes");
    athletes.listRule = "coach_id ?= @request.auth.id";
    athletes.viewRule = "coach_id ?= @request.auth.id";
    athletes.createRule = '@request.auth.id != ""';
    athletes.updateRule = "coach_id ?= @request.auth.id";
    athletes.deleteRule = "coach_id ?= @request.auth.id";
    app.save(athletes);
  } catch (e) {
    console.log("athletes: " + e);
  }

  // --- programs ---
  try {
    const programs = app.findCollectionByNameOrId("programs");
    programs.listRule = "coach_id ?= @request.auth.id";
    programs.viewRule = "coach_id ?= @request.auth.id";
    programs.createRule = '@request.auth.id != ""';
    programs.updateRule = "coach_id ?= @request.auth.id";
    programs.deleteRule = "coach_id ?= @request.auth.id";
    app.save(programs);
  } catch (e) {
    console.log("programs: " + e);
  }

  // --- metrics ---
  try {
    const metrics = app.findCollectionByNameOrId("metrics");
    metrics.listRule = "athlete_id.coach_id ?= @request.auth.id";
    metrics.viewRule = "athlete_id.coach_id ?= @request.auth.id";
    metrics.createRule = '@request.auth.id != ""';
    metrics.updateRule = "athlete_id.coach_id ?= @request.auth.id";
    metrics.deleteRule = "athlete_id.coach_id ?= @request.auth.id";
    app.save(metrics);
  } catch (e) {
    console.log("metrics: " + e);
  }

  // --- notes ---
  try {
    const notes = app.findCollectionByNameOrId("notes");
    notes.listRule = "athlete_id.coach_id ?= @request.auth.id";
    notes.viewRule = "athlete_id.coach_id ?= @request.auth.id";
    notes.createRule = '@request.auth.id != ""';
    notes.updateRule = "athlete_id.coach_id ?= @request.auth.id";
    notes.deleteRule = "athlete_id.coach_id ?= @request.auth.id";
    app.save(notes);
  } catch (e) {
    console.log("notes: " + e);
  }

  // --- photos ---
  try {
    const photos = app.findCollectionByNameOrId("photos");
    photos.listRule = "athlete_id.coach_id ?= @request.auth.id";
    photos.viewRule = "athlete_id.coach_id ?= @request.auth.id";
    photos.createRule = '@request.auth.id != ""';
    photos.updateRule = "athlete_id.coach_id ?= @request.auth.id";
    photos.deleteRule = "athlete_id.coach_id ?= @request.auth.id";
    app.save(photos);
  } catch (e) {
    console.log("photos: " + e);
  }

  // --- share_links ---
  try {
    const shareLinks = app.findCollectionByNameOrId("share_links");
    shareLinks.listRule = "coach_id ?= @request.auth.id";
    shareLinks.viewRule = "coach_id ?= @request.auth.id";
    shareLinks.createRule = '@request.auth.id != ""';
    shareLinks.updateRule = "coach_id ?= @request.auth.id";
    shareLinks.deleteRule = "coach_id ?= @request.auth.id";
    app.save(shareLinks);
  } catch (e) {
    console.log("share_links: " + e);
  }

  // --- sd_activity_logs ---
  try {
    const activityLogs = app.findCollectionByNameOrId("sd_activity_logs");
    activityLogs.listRule = "coach_id ?= @request.auth.id";
    activityLogs.viewRule = "coach_id ?= @request.auth.id";
    activityLogs.createRule = '@request.auth.id != ""';
    activityLogs.updateRule = "coach_id ?= @request.auth.id";
    activityLogs.deleteRule = "coach_id ?= @request.auth.id";
    app.save(activityLogs);
  } catch (e) {
    console.log("sd_activity_logs: " + e);
  }

  // --- reminders ---
  try {
    const reminders = app.findCollectionByNameOrId("reminders");
    reminders.listRule = "coach_id ?= @request.auth.id";
    reminders.viewRule = "coach_id ?= @request.auth.id";
    reminders.createRule = '@request.auth.id != ""';
    reminders.updateRule = "coach_id ?= @request.auth.id";
    reminders.deleteRule = "coach_id ?= @request.auth.id";
    app.save(reminders);
  } catch (e) {
    console.log("reminders: " + e);
  }

  // --- client_programs ---
  try {
    const clientPrograms = app.findCollectionByNameOrId("client_programs");
    clientPrograms.listRule = '@request.auth.id != ""';
    clientPrograms.viewRule = '@request.auth.id != ""';
    clientPrograms.createRule = '@request.auth.id != ""';
    clientPrograms.updateRule = '@request.auth.id != ""';
    clientPrograms.deleteRule = '@request.auth.id != ""';
    app.save(clientPrograms);
  } catch (e) {
    console.log("client_programs: " + e);
  }

  // --- daily_tracking ---
  try {
    const dailyTracking = app.findCollectionByNameOrId("daily_tracking");
    dailyTracking.listRule = "athlete_id.coach_id ?= @request.auth.id";
    dailyTracking.viewRule = "athlete_id.coach_id ?= @request.auth.id";
    dailyTracking.createRule = '@request.auth.id != ""';
    dailyTracking.updateRule = "athlete_id.coach_id ?= @request.auth.id";
    dailyTracking.deleteRule = "athlete_id.coach_id ?= @request.auth.id";
    app.save(dailyTracking);
  } catch (e) {
    console.log("daily_tracking: " + e);
  }

  // --- workout_logs ---
  try {
    const workoutLogs = app.findCollectionByNameOrId("workout_logs");
    workoutLogs.listRule = '@request.auth.id != ""';
    workoutLogs.viewRule = '@request.auth.id != ""';
    workoutLogs.createRule = '@request.auth.id != ""';
    workoutLogs.updateRule = '@request.auth.id != ""';
    workoutLogs.deleteRule = '@request.auth.id != ""';
    app.save(workoutLogs);
  } catch (e) {
    console.log("workout_logs: " + e);
  }

  // --- set_logs ---
  try {
    const setLogs = app.findCollectionByNameOrId("set_logs");
    setLogs.listRule = '@request.auth.id != ""';
    setLogs.viewRule = '@request.auth.id != ""';
    setLogs.createRule = '@request.auth.id != ""';
    setLogs.updateRule = '@request.auth.id != ""';
    setLogs.deleteRule = '@request.auth.id != ""';
    app.save(setLogs);
  } catch (e) {
    console.log("set_logs: " + e);
  }

  // --- program_workouts (уже исправлено в 1773000000) ---
  try {
    const workouts = app.findCollectionByNameOrId("program_workouts");
    workouts.listRule = "program_id.coach_id ?= @request.auth.id";
    workouts.viewRule = "program_id.coach_id ?= @request.auth.id";
    workouts.createRule = '@request.auth.id != ""';
    workouts.updateRule = '@request.auth.id != ""';
    workouts.deleteRule = '@request.auth.id != ""';
    app.save(workouts);
  } catch (e) {
    console.log("program_workouts: " + e);
  }

  // --- program_exercises ---
  try {
    const exercises = app.findCollectionByNameOrId("program_exercises");
    exercises.listRule = "workout_id.program_id.coach_id ?= @request.auth.id";
    exercises.viewRule = "workout_id.program_id.coach_id ?= @request.auth.id";
    exercises.createRule = '@request.auth.id != ""';
    exercises.updateRule = '@request.auth.id != ""';
    exercises.deleteRule = '@request.auth.id != ""';
    app.save(exercises);
  } catch (e) {
    console.log("program_exercises: " + e);
  }

}, (app) => {
  // Откат — не нужен, правила уже были сломаны
});
