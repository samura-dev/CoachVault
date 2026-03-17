// Миграция: создание коллекции share_links
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "share_links",
    // Публичный List/View для просмотра по токену (фильтрация на клиенте)
    listRule: "",
    viewRule: "",
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
        name: "token",
        required: true,
        min: 10,
        max: 100,
      },
      {
        type: "date",
        name: "expires_at",
        required: true,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("share_links");
  app.delete(collection);
});
