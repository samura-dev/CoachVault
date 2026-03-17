migrate((app) => {
  try {
    const athleteCol = app.findCollectionByNameOrId("athletes");
    const programCol = app.findCollectionByNameOrId("programs");

    const collection = new Collection({
      type: "base",
      name: "client_programs",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "athlete_id", required: true, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "program_id", required: true, collectionId: programCol.id, cascadeDelete: false, maxSelect: 1 },
        { type: "date", name: "start_date", required: true },
        { type: "date", name: "end_date", required: false },
        { type: "select", name: "status", required: true, values: ["active", "completed", "cancelled"], maxSelect: 1 },
      ],
    });
    app.save(collection);
  } catch (e) {
    console.log("Collection client_programs already exists or dependencies missing, skipping creation.");
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("client_programs");
    app.delete(collection);
  } catch (e) { }
});
