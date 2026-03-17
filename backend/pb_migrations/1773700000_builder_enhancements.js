// Миграция: Расширение структуры БД для продвинутого конструктора программ
migrate((app) => {
  // 1. Обновляем коллекцию users (добавляем custom_set_columns)
  try {
    const usersCol = app.findCollectionByNameOrId("users");
    if (!usersCol.fields.getByName("custom_set_columns")) {
      usersCol.fields.add(new Field({
        name: "custom_set_columns",
        type: "json",
        required: false,
      }));
      app.save(usersCol);
      console.log("Добавлено поле custom_set_columns в users");
    }
  } catch (e) {
    console.log("Ошибка обновления users:", e.message);
  }

  // 2. Обновляем коллекцию programs (добавляем specialization и goals)
  try {
    const programsCol = app.findCollectionByNameOrId("programs");
    let changed = false;
    
    if (!programsCol.fields.getByName("specialization")) {
      programsCol.fields.add(new Field({
        name: "specialization",
        type: "text",
        required: false,
        max: 100
      }));
      changed = true;
    }

    if (!programsCol.fields.getByName("goals")) {
      programsCol.fields.add(new Field({
        name: "goals",
        type: "text",
        required: false,
        max: 2000
      }));
      changed = true;
    }

    if (changed) {
      app.save(programsCol);
      console.log("Добавлены поля specialization и goals в programs");
    }
  } catch (e) {
    console.log("Ошибка обновления programs:", e.message);
  }

  // 3. Обновляем коллекцию program_exercises (добавляем sets_data)
  // И делаем старые поля (sets, reps) необязательными, так как теперь данные подходов хранятся в sets_data
  try {
    const exercisesCol = app.findCollectionByNameOrId("program_exercises");
    let changed = false;

    if (!exercisesCol.fields.getByName("sets_data")) {
      exercisesCol.fields.add(new Field({
        name: "sets_data",
        type: "json",
        required: false,
      }));
      changed = true;
    }

    // Делаем старые поля необязательными
    try {
      const setsField = exercisesCol.fields.getByName("sets");
      if (setsField && setsField.required) {
        setsField.required = false;
        changed = true;
      }
      const repsField = exercisesCol.fields.getByName("reps");
      if (repsField && repsField.required) {
        repsField.required = false;
        changed = true;
      }
    } catch (e) {}

    if (changed) {
      app.save(exercisesCol);
      console.log("Добавлено поле sets_data в program_exercises");
    }
  } catch (e) {
    console.log("Ошибка обновления program_exercises:", e.message);
  }

}, (app) => {
  // Откат
  try {
    const usersCol = app.findCollectionByNameOrId("users");
    usersCol.fields.removeByName("custom_set_columns");
    app.save(usersCol);
  } catch (e) {}

  try {
    const programsCol = app.findCollectionByNameOrId("programs");
    programsCol.fields.removeByName("specialization");
    programsCol.fields.removeByName("goals");
    app.save(programsCol);
  } catch (e) {}

  try {
    const exercisesCol = app.findCollectionByNameOrId("program_exercises");
    exercisesCol.fields.removeByName("sets_data");
    app.save(exercisesCol);
  } catch (e) {}
});
