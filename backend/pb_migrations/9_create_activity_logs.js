// Миграция: создание коллекции sd_activity_logs
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "sd_activity_logs",
    listRule: "@request.auth.id = user",
    viewRule: "@request.auth.id = user",
    createRule: '@request.auth.id != ""',
    updateRule: null, // Запрет редактирования
    deleteRule: null, // Запрет удаления
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
        type: "select",
        name: "action_type",
        required: true,
        values: ["create", "update", "delete", "status_change", "system"],
        maxSelect: 1,
      },
      {
        type: "select",
        name: "entity_type",
        required: true,
        values: ["athlete", "workout", "note", "measurement", "program", "system", "auth"],
        maxSelect: 1,
      },
      {
        type: "text",
        name: "entity_id",
        required: false,
        max: 200,
      },
      {
        type: "text",
        name: "title",
        required: true,
        max: 255,
      },
      {
        type: "json",
        name: "details",
        required: false,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("sd_activity_logs");
  app.delete(collection);
});
