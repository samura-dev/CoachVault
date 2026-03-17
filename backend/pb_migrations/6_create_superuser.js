// Migration: optional dev-only superuser (disabled by default)
migrate((app) => {
  // Guard: never create a superuser unless explicitly enabled.
  // Set env SD_CREATE_SUPERUSER=1 only in a local/dev environment.
  try {
    if (!process?.env?.SD_CREATE_SUPERUSER) return;
  } catch (e) {
    return;
  }

  const superusers = app.findCollectionByNameOrId("_superusers");

  const record = new Record(superusers);
  record.set("email", "dev-superuser@example.com");
  record.set("password", "change-me-now");

  app.save(record);
}, (app) => {
  try {
    const record = app.findAuthRecordByEmail("_superusers", "dev-superuser@example.com");
    app.delete(record);
  } catch { }
});
