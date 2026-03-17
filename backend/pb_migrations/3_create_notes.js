// Миграция: создание коллекции notes
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "notes",
    listRule: "@request.auth.id = athlete_id.coach_id",
    viewRule: "@request.auth.id = athlete_id.coach_id",
    createRule: "@request.auth.id = athlete_id.coach_id",
    updateRule: "@request.auth.id = athlete_id.coach_id",
    deleteRule: "@request.auth.id = athlete_id.coach_id",
    fields: [
      {
        type: "relation",
        name: "athlete_id",
        required: true,
        collectionId: app.findCollectionByNameOrId("athletes").id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        type: "text",
        name: "content",
        required: true,
        min: 1,
        max: 5000,
      },
      {
        type: "select",
        name: "type",
        required: true,
        values: ["general", "injury", "diet", "mood"],
        maxSelect: 1,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("notes");
  app.delete(collection);
});
