// Safe schema patch
migrate((app) => {
  try {
    const athletesApp = app.findCollectionByNameOrId("athletes");
    if (athletesApp) {
      if (!athletesApp.fields.getByName("is_coach_self")) {
        const isCoachSelfField = new Field({
          type: "bool",
          name: "is_coach_self",
          required: false,
        });
        athletesApp.fields.add(isCoachSelfField);
        app.save(athletesApp);
      }
    }
  } catch (e) {
    console.log("Athletes already updated or missing.");
  }

  try {
    const notesApp = app.findCollectionByNameOrId("notes");
    if (notesApp) {
      const typeField = notesApp.fields.getByName("type");
      if (typeField && !typeField.values.includes("medical")) {
        typeField.values = ["general", "injury", "diet", "mood", "training", "nutrition", "medical"];
        app.save(notesApp);
      }
    }
  } catch (e) {
    console.log("Notes already updated or missing.");
  }

}, (app) => {
  try {
    const athletesApp = app.findCollectionByNameOrId("athletes");
    if (athletesApp) {
      athletesApp.fields.removeByName("is_coach_self");
      app.save(athletesApp);
    }
  } catch (e) { }
});
