migrate((app) => {
  // Remove legacy dev superuser created by older migrations.
  try {
    const record = app.findAuthRecordByEmail("_superusers", "samura.dev@mail.ru");
    if (record) app.delete(record);
  } catch (e) { }
}, (app) => {
  // No-op rollback.
});

