migrate((app) => {
  // Add missing fields required by frontend forms without removing existing ones.
  try {
    const athletesCol = app.findCollectionByNameOrId("athletes");

    if (!athletesCol.fields.getByName("height")) {
      athletesCol.fields.add(new Field({
        name: "height",
        type: "number",
        required: false,
        min: 0,
        max: 300,
      }));
    }

    if (!athletesCol.fields.getByName("competition_type")) {
      athletesCol.fields.add(new Field({
        name: "competition_type",
        type: "select",
        required: false,
        values: ["bodybuilding", "powerlifting", "triathlon", "weightlifting", "other"],
        maxSelect: 1,
      }));
    }

    if (!athletesCol.fields.getByName("tags")) {
      athletesCol.fields.add(new Field({
        name: "tags",
        type: "select",
        required: false,
        values: ["low", "medium", "high"],
        maxSelect: 3,
      }));
    }

    app.save(athletesCol);
  } catch (e) { }

  try {
    const notesCol = app.findCollectionByNameOrId("notes");
    const typeField = notesCol.fields.getByName("type");
    if (typeField && typeField.type === "select") {
      typeField.values = ["general", "training", "nutrition", "medical", "injury", "diet", "mood"];
    }

    if (!notesCol.fields.getByName("importance")) {
      notesCol.fields.add(new Field({
        name: "importance",
        type: "select",
        required: false,
        values: ["low", "medium", "high"],
        maxSelect: 1,
      }));
    }

    if (!notesCol.fields.getByName("is_private")) {
      notesCol.fields.add(new Field({
        name: "is_private",
        type: "bool",
        required: false,
      }));
    }

    app.save(notesCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");

    const priorityField = remindersCol.fields.getByName("priority");
    if (priorityField) {
      priorityField.required = false;
    }

    const typeField = remindersCol.fields.getByName("type");
    if (!typeField) {
      remindersCol.fields.add(new Field({
        name: "type",
        type: "select",
        required: true,
        values: ["measurement", "nutrition", "training", "payment", "photo", "other", "check_in"],
        maxSelect: 1,
      }));
    } else if (typeField.type === "select") {
      typeField.values = ["measurement", "nutrition", "training", "payment", "photo", "other", "check_in"];
    }

    app.save(remindersCol);
  } catch (e) { }

  try {
    const metricsCol = app.findCollectionByNameOrId("metrics");

    if (!metricsCol.fields.getByName("bicep")) {
      metricsCol.fields.add(new Field({
        name: "bicep",
        type: "number",
        required: false,
        min: 0,
        max: 100,
      }));
    }

    app.save(metricsCol);
  } catch (e) { }

  try {
    const dailyCol = app.findCollectionByNameOrId("daily_tracking");

    if (!dailyCol.fields.getByName("water")) {
      dailyCol.fields.add(new Field({
        name: "water",
        type: "number",
        required: false,
        min: 0,
      }));
    }

    if (!dailyCol.fields.getByName("steps")) {
      dailyCol.fields.add(new Field({
        name: "steps",
        type: "number",
        required: false,
        min: 0,
      }));
    }

    if (!dailyCol.fields.getByName("notes")) {
      dailyCol.fields.add(new Field({
        name: "notes",
        type: "text",
        required: false,
        max: 5000,
      }));
    }

    if (!dailyCol.fields.getByName("is_perfect")) {
      dailyCol.fields.add(new Field({
        name: "is_perfect",
        type: "bool",
        required: false,
      }));
    }

    app.save(dailyCol);
  } catch (e) { }
}, (app) => {
  try {
    const athletesCol = app.findCollectionByNameOrId("athletes");
    athletesCol.fields.removeByName("height");
    athletesCol.fields.removeByName("competition_type");
    athletesCol.fields.removeByName("tags");
    app.save(athletesCol);
  } catch (e) { }

  try {
    const notesCol = app.findCollectionByNameOrId("notes");
    notesCol.fields.removeByName("importance");
    notesCol.fields.removeByName("is_private");
    app.save(notesCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");
    remindersCol.fields.removeByName("type");
    app.save(remindersCol);
  } catch (e) { }

  try {
    const metricsCol = app.findCollectionByNameOrId("metrics");
    metricsCol.fields.removeByName("bicep");
    app.save(metricsCol);
  } catch (e) { }

  try {
    const dailyCol = app.findCollectionByNameOrId("daily_tracking");
    dailyCol.fields.removeByName("water");
    dailyCol.fields.removeByName("steps");
    dailyCol.fields.removeByName("notes");
    dailyCol.fields.removeByName("is_perfect");
    app.save(dailyCol);
  } catch (e) { }
});
