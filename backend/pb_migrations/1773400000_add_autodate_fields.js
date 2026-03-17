// Миграция: добавление autodate полей (created/updated) во все коллекции
// В PocketBase v0.23+ эти поля не создаются автоматически
migrate((app) => {
  const collections = [
    "athletes",
    "metrics",
    "notes",
    "photos",
    "share_links",
    "sd_notifications",
    "sd_activity_logs",
    "programs",
    "program_workouts",
    "program_exercises",
    "reminders",
  ];

  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name);

      // Добавляем поле created (дата создания)
      collection.fields.add(new Field({
        type: "autodate",
        name: "created",
        onCreate: true,
        onUpdate: false,
      }));

      // Добавляем поле updated (дата обновления)
      collection.fields.add(new Field({
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      }));

      app.save(collection);
      console.log(name + ": autodate fields added");
    } catch (e) {
      console.log(name + ": " + e.message);
    }
  }
}, (app) => {
  // Откат: удалить autodate поля
  const collections = [
    "athletes",
    "metrics",
    "notes",
    "photos",
    "share_links",
    "sd_notifications",
    "sd_activity_logs",
    "programs",
    "program_workouts",
    "program_exercises",
    "reminders",
  ];

  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      collection.fields.removeByName("created");
      collection.fields.removeByName("updated");
      app.save(collection);
    } catch (e) {
      console.log(name + ": " + e.message);
    }
  }
});
