migrate((app) => {
  const programsCollection = app.findCollectionByNameOrId("programs");

  const collection = new Collection({
    type: "base",
    name: "program_workouts",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      {
        type: "relation",
        name: "program_id",
        required: true,
        collectionId: programsCollection.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        type: "number",
        name: "day_number",
        required: true,
        min: 1,
        max: 365,
      },
      {
        type: "text",
        name: "name",
        required: true,
        max: 100,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("program_workouts");
  app.delete(collection);
});
