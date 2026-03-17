migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("athletes");

    if (!collection.fields.getByName("gender")) {
      const genderField = new Field({
        name: "gender",
        type: "select",
        required: false,
        values: ["male", "female"],
        maxSelect: 1,
      });
      collection.fields.add(genderField);
    }

    if (!collection.fields.getByName("height_cm")) {
      const heightField = new Field({
        name: "height_cm",
        type: "number",
        required: false,
        min: 0,
        max: 300,
      });
      collection.fields.add(heightField);
    }

    app.save(collection);
  } catch (e) { }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("athletes");
    collection.fields.removeByName("gender");
    collection.fields.removeByName("height_cm");
    app.save(collection);
  } catch (e) { }
});
