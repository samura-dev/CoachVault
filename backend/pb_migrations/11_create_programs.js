migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "programs",
    listRule: "@request.auth.id = coach_id",
    viewRule: "@request.auth.id = coach_id",
    createRule: '@request.auth.id != ""',
    updateRule: "@request.auth.id = coach_id",
    deleteRule: "@request.auth.id = coach_id",
    fields: [
      {
        type: "relation",
        name: "coach_id",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        type: "text",
        name: "name",
        required: true,
        max: 100,
      },
      {
        type: "text",
        name: "description",
        required: false,
        max: 2000,
      },
      {
        type: "number",
        name: "duration_weeks",
        required: false,
        min: 1,
        max: 52,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("programs");
  app.delete(collection);
});
