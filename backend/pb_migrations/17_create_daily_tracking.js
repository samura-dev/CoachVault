migrate((app) => {
  try {
    const athleteCol = app.findCollectionByNameOrId("athletes");

    const collection = new Collection({
      type: "base",
      name: "daily_tracking",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "athlete_id", required: true, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "date", name: "date", required: true },
        { type: "number", name: "calories", required: false, min: 0 },
        { type: "number", name: "protein", required: false, min: 0 },
        { type: "number", name: "fats", required: false, min: 0 },
        { type: "number", name: "carbs", required: false, min: 0 },
        { type: "bool", name: "workout_completed", required: false },
      ],
    });
    app.save(collection);
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("daily_tracking");
    app.delete(collection);
  } catch (e) { }
});
