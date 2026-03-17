migrate((app) => {
  const workoutCol = app.findCollectionByNameOrId("program_workouts");

  const collection = new Collection({
    type: "base",
    name: "program_exercises",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { type: "relation", name: "workout_id", required: true, collectionId: workoutCol.id, cascadeDelete: true, maxSelect: 1 },
      { type: "text", name: "exercise_name", required: true, max: 100 },
      { type: "number", name: "sets", required: true, min: 1, max: 20 },
      { type: "text", name: "reps", required: true, max: 50 },
      { type: "text", name: "rest_time", required: false, max: 50 },
      { type: "number", name: "order", required: true },
    ],
  });
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("program_exercises");
  app.delete(collection);
});
