migrate((app) => {
  try {
    const athleteCol = app.findCollectionByNameOrId("athletes");
    const programWorkoutCol = app.findCollectionByNameOrId("program_workouts");

    const collection = new Collection({
      type: "base",
      name: "workout_logs",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "athlete_id", required: true, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "program_workout_id", required: true, collectionId: programWorkoutCol.id, cascadeDelete: false, maxSelect: 1 },
        { type: "date", name: "date", required: true },
        { type: "select", name: "status", required: true, values: ["completed", "skipped", "in_progress"], maxSelect: 1 },
        { type: "number", name: "duration_min", required: false, min: 1, max: 1440 },
      ],
    });
    app.save(collection);
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("workout_logs");
    app.delete(collection);
  } catch (e) { }
});
