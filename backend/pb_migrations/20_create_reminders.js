migrate((app) => {
  try {
    const usersCol = app.findCollectionByNameOrId("_pb_users_auth_");
    const athleteCol = app.findCollectionByNameOrId("athletes");

    const collection = new Collection({
      type: "base",
      name: "reminders",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "coach_id", required: true, collectionId: usersCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "athlete_id", required: false, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "text", name: "title", required: true, max: 100 },
        { type: "text", name: "description", required: false, max: 500 },
        { type: "date", name: "due_date", required: true },
        { type: "bool", name: "is_completed", required: false },
        { type: "select", name: "priority", required: true, values: ["low", "medium", "high"], maxSelect: 1 },
      ],
    });

    app.save(collection);
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("reminders");
    app.delete(collection);
  } catch (e) { }
});
