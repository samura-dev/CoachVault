// Миграция: создание коллекции metrics
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "metrics",
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
        type: "number",
        name: "weight",
        min: 20,
        max: 500,
      },
      {
        type: "number",
        name: "chest",
        min: 0,
        max: 300,
      },
      {
        type: "number",
        name: "waist",
        min: 0,
        max: 300,
      },
      {
        type: "number",
        name: "hips",
        min: 0,
        max: 300,
      },
      {
        type: "number",
        name: "bicep_left",
        min: 0,
        max: 100,
      },
      {
        type: "number",
        name: "bicep_right",
        min: 0,
        max: 100,
      },
      {
        type: "number",
        name: "neck",
        min: 0,
        max: 100,
      },
      {
        type: "number",
        name: "body_fat",
        min: 0,
        max: 100,
      },
      {
        type: "text",
        name: "note",
        max: 2000,
      },
      {
        type: "date",
        name: "measured_at",
        required: true,
      },
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("metrics");
  app.delete(collection);
});
