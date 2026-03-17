// Миграция: восстановление пропущенных из-за сортировки коллекций и полей
migrate((app) => {
  const athleteCol = app.findCollectionByNameOrId("athletes");
  const programWorkoutCol = app.findCollectionByNameOrId("program_workouts");
  const exerciseCol = app.findCollectionByNameOrId("program_exercises");

  // 1. Создаем workout_logs
  try {
    app.findCollectionByNameOrId("workout_logs");
    console.log("workout_logs already exists");
  } catch (e) {
    const workoutLogsCol = new Collection({
      type: "base",
      name: "workout_logs",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "athlete_id", required: true, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "program_workout_id", required: true, collectionId: programWorkoutCol.id, cascadeDelete: false, maxSelect: 1 },
        { type: "date", name: "date", required: true },
        { type: "select", name: "status", required: true, values: ["completed", "skipped", "in_progress"], maxSelect: 1 },
        { type: "number", name: "duration_min", required: false, min: 1, max: 1440 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
      ],
    });
    app.save(workoutLogsCol);
    console.log("Created workout_logs");
  }

  // 2. Создаем set_logs
  try {
    app.findCollectionByNameOrId("set_logs");
    console.log("set_logs already exists");
  } catch (e) {
    const workoutLogCol = app.findCollectionByNameOrId("workout_logs");
    const setLogsCol = new Collection({
      type: "base",
      name: "set_logs",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "workout_log_id", required: true, collectionId: workoutLogCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "relation", name: "exercise_id", required: true, collectionId: exerciseCol.id, cascadeDelete: false, maxSelect: 1 },
        { type: "number", name: "set_number", required: true, min: 1, max: 20 },
        { type: "number", name: "weight", required: false, min: 0 },
        { type: "number", name: "reps", required: false, min: 0 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
      ],
    });
    app.save(setLogsCol);
    console.log("Created set_logs");
  }

  // 3. Создаем daily_tracking
  try {
    app.findCollectionByNameOrId("daily_tracking");
    console.log("daily_tracking already exists");
  } catch (e) {
    const dailyTrackingCol = new Collection({
      type: "base",
      name: "daily_tracking",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { type: "relation", name: "athlete_id", required: true, collectionId: athleteCol.id, cascadeDelete: true, maxSelect: 1 },
        { type: "date", name: "date", required: true },
        { type: "number", name: "calories", required: false, min: 0 },
        { type: "number", name: "protein", required: false, min: 0 },
        { type: "number", name: "fats", required: false, min: 0 },
        { type: "number", name: "carbs", required: false, min: 0 },
        { type: "bool", name: "workout_completed", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
      ],
    });
    app.save(dailyTrackingCol);
    console.log("Created daily_tracking");
  }

  // 4. Восстанавливаем поля nutrition_plan, gender, height_cm в athletes
  try {
    let saved = false;
    if (!athleteCol.fields.getByName("nutrition_plan")) {
      athleteCol.fields.add(new Field({ name: "nutrition_plan", type: "json", required: false }));
      saved = true;
    }
    if (!athleteCol.fields.getByName("gender")) {
      athleteCol.fields.add(new Field({ name: "gender", type: "select", required: false, values: ["male", "female"], maxSelect: 1 }));
      saved = true;
    }
    if (!athleteCol.fields.getByName("height_cm")) {
      athleteCol.fields.add(new Field({ name: "height_cm", type: "number", required: false, min: 0, max: 300 }));
      saved = true;
    }
    
    if (saved) {
      app.save(athleteCol);
      console.log("Updated athletes with missing fields");
    }
  } catch (e) {
    console.log("Error updating athletes: " + e.message);
  }

}, (app) => {
  // Откат
  try { app.delete(app.findCollectionByNameOrId("workout_logs")); } catch (e) { }
  try { app.delete(app.findCollectionByNameOrId("set_logs")); } catch (e) { }
  try { app.delete(app.findCollectionByNameOrId("daily_tracking")); } catch (e) { }
  try {
    const athleteCol = app.findCollectionByNameOrId("athletes");
    athleteCol.fields.removeByName("nutrition_plan");
    athleteCol.fields.removeByName("gender");
    athleteCol.fields.removeByName("height_cm");
    app.save(athleteCol);
  } catch (e) { }
});
