// Миграция: создание коллекции photos
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "photos",
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
        type: "file",
        name: "image",
        required: true,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        thumbs: ["100x100", "400x400"],
        maxSelect: 1,
        maxSize: 5242880,
      },
      {
        type: "select",
        name: "label",
        required: true,
        values: ["front", "side", "back", "other"],
        maxSelect: 1,
      },
      {
        type: "text",
        name: "note",
        max: 2000,
      },
      {
        type: "date",
        name: "taken_at",
        required: true,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("photos");
  app.delete(collection);
});
