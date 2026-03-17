// Миграция: создание коллекции sd_notifications
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "sd_notifications",
    listRule: "@request.auth.id = user",
    viewRule: "@request.auth.id = user",
    createRule: '@request.auth.id != ""',
    updateRule: "@request.auth.id = user",
    deleteRule: "@request.auth.id = user",
    fields: [
      {
        type: "relation",
        name: "user",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        type: "text",
        name: "title",
        required: true,
        max: 255,
      },
      {
        type: "text",
        name: "message",
        required: false,
        max: 1000,
      },
      {
        type: "select",
        name: "type",
        required: true,
        values: ["info", "success", "warning", "error"],
        maxSelect: 1,
      },
      {
        type: "bool",
        name: "is_read",
      },
      {
        type: "text",
        name: "link",
        required: false,
        max: 500,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("sd_notifications");
  app.delete(collection);
});
