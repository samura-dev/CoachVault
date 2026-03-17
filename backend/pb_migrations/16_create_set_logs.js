migrate((app) => {
  try {
    const workoutLogCol = app.findCollectionByNameOrId("workout_logs");
    const exerciseCol = app.findCollectionByNameOrId("program_exercises");

    const collection = new Collection({
      type: "base",
      name: "set_logs",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "workout_log_id", required: true, collectionId: workoutLogCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "exercise_id", required: true, collectionId: exerciseCol.id, cascadeDelete: false, maxSelect: 1 },
        { type: "number", name: "set_number", required: true, min: 1, max: 20 },
        { type: "number", name: "weight", required: false, min: 0 },
        { type: "number", name: "reps", required: false, min: 0 },
      ],
    });
    app.save(collection);
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("set_logs");
    app.delete(collection);
  } catch (e) { }
});
