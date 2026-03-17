migrate((app) => {
  try {
    const notesCol = app.findCollectionByNameOrId("notes");
    const typeField = notesCol.fields.getByName("type");
    if (typeField && typeField.type === "select") {
      typeField.values = ["general", "training", "nutrition", "medical", "injury", "diet", "mood"];
    }
    app.save(notesCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");

    const typeField = remindersCol.fields.getByName("type");
    if (typeField && typeField.type === "select") {
      typeField.values = ["measurement", "nutrition", "training", "payment", "photo", "other", "check_in"];
    }

    const priorityField = remindersCol.fields.getByName("priority");
    if (priorityField) {
      priorityField.required = false;
    }

    app.save(remindersCol);
  } catch (e) { }
}, (app) => {
  // No-op rollback.
});
