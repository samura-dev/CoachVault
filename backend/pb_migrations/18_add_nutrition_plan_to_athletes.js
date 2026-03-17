migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("athletes");
    if (!collection.fields.getByName("nutrition_plan")) {
      const nutritionField = new Field({
        name: "nutrition_plan",
        type: "json",
        required: false,
      });
      collection.fields.add(nutritionField);
      app.save(collection);
    }
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("athletes");
    collection.fields.removeByName("nutrition_plan");
    app.save(collection);
  } catch (e) { }
});
