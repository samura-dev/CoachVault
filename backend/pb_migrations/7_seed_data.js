// Migration: optional dev-only seed data (disabled by default)
migrate((app) => {
  // Guard: seed only when explicitly enabled.
  // Set env SD_SEED_DATA=1 only in a local/dev environment.
  try {
    if (!process?.env?.SD_SEED_DATA) return;
  } catch (e) {
    return;
  }

  // Avoid duplicates if already seeded.
  try {
    app.findAuthRecordByEmail("_pb_users_auth_", "trainer@test.com");
    return;
  } catch (e) { }

  // 1) Create a dev coach account.
  const usersCollection = app.findCollectionByNameOrId("_pb_users_auth_");
  const coachRecord = new Record(usersCollection);
  coachRecord.set("email", "trainer@test.com");
  coachRecord.set("emailVisibility", true);
  coachRecord.set("password", "12345678");
  coachRecord.set("passwordConfirm", "12345678");
  coachRecord.set("name", "Dev Trainer");
  coachRecord.set("role", "coach");
  app.save(coachRecord);

  // 2) Create a sample athlete for that coach.
  const athletesCollection = app.findCollectionByNameOrId("athletes");
  const athleteRecord = new Record(athletesCollection);
  athleteRecord.set("coach_id", coachRecord.id);
  athleteRecord.set("name", "Sample Athlete");
  athleteRecord.set("goal", "cutting");
  athleteRecord.set("start_weight", 95.5);
  athleteRecord.set("target_weight", 80.0);
  athleteRecord.set("status", "active");
  athleteRecord.set("is_coach_self", false);
  app.save(athleteRecord);

  // 3) Create a base metric.
  const metricsCollection = app.findCollectionByNameOrId("metrics");
  const metricRecord = new Record(metricsCollection);
  metricRecord.set("athlete_id", athleteRecord.id);
  metricRecord.set("weight", 95.5);
  metricRecord.set("measured_at", new Date().toISOString());
  app.save(metricRecord);
}, (app) => {
  // Rollback: remove the dev coach if it exists.
  try {
    const record = app.findAuthRecordByEmail("_pb_users_auth_", "trainer@test.com");
    if (record) app.delete(record);
  } catch { }
});
