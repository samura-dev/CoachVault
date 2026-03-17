// Миграция: создание коллекции athletes
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "athletes",
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
        type: "file",
        name: "avatar",
        required: false,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        thumbs: ["100x100", "200x200"],
        maxSelect: 1,
        maxSize: 5242880,
      },
      {
        type: "select",
        name: "goal",
        required: true,
        values: ["cutting", "bulking", "recomp", "maintenance"],
        maxSelect: 1,
      },
      {
        type: "number",
        name: "start_weight",
        required: true,
        min: 20,
        max: 300,
      },
      {
        type: "number",
        name: "target_weight",
        required: true,
        min: 20,
        max: 300,
      },
      {
        type: "date",
        name: "birth_date",
        required: false,
      },
      {
        type: "text",
        name: "notes",
        required: false,
        max: 5000,
      },
      {
        type: "select",
        name: "status",
        required: true,
        values: ["active", "paused", "archived"],
        maxSelect: 1,
      },
      {
        type: "bool",
        name: "is_coach_self",
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("athletes");
  app.delete(collection);
});
