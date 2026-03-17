// Миграция: создание client_programs и исправление reminders
migrate((app) => {
  // 1. Создаем client_programs, так как оригинальная миграция была пропущена из-за неверного лексикографического порядка
  try {
    // Проверяем, существует ли уже
    app.findCollectionByNameOrId("client_programs");
    console.log("client_programs already exists");
  } catch (e) {
    const athleteCol = app.findCollectionByNameOrId("athletes");
    const programCol = app.findCollectionByNameOrId("programs");

    const clientProgramsCol = new Collection({
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
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
      ],
    });
    app.save(clientProgramsCol);
    console.log("Created client_programs collection");
  }

  // 2. Исправляем напоминания: убираем priority, добавляем type
  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");
    
    // Удаляем priority если есть
    try {
      remindersCol.fields.removeByName("priority");
    } catch (err) { }
    
    // Добавляем type если его еще нет
    try {
      if (!remindersCol.fields.getByName("type")) {
        remindersCol.fields.add(new Field({
          type: "select",
          name: "type",
          required: true,
          values: ["measurement", "nutrition", "training", "payment", "photo", "other"],
          maxSelect: 1,
        }));
      }
    } catch (err) { }
    
    app.save(remindersCol);
    console.log("Updated reminders schema to use 'type' instead of 'priority'");
  } catch (e) {
    console.log("Error updating reminders: " + e.message);
  }

}, (app) => {
  // Откат
  try {
    const clientProgramsCol = app.findCollectionByNameOrId("client_programs");
    app.delete(clientProgramsCol);
  } catch (e) { }

  try {
    const remindersCol = app.findCollectionByNameOrId("reminders");
    try {
      remindersCol.fields.removeByName("type");
    } catch (err) { }
    try {
      if (!remindersCol.fields.getByName("priority")) {
        remindersCol.fields.add(new Field({
          type: "select",
          name: "priority",
          required: true,
          values: ["low", "medium", "high"],
          maxSelect: 1,
        }));
      }
    } catch (err) { }
    app.save(remindersCol);
  } catch (e) { }
});
