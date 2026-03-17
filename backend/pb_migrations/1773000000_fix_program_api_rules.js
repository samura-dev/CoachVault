migrate((app) => {
  // Обновляем program_workouts
  const workoutsCollection = app.findCollectionByNameOrId("program_workouts");
  if (workoutsCollection) {
    // В идеале мы хотим, чтобы тренировки мог видеть автор программы
    // Но для обратной связи в PocketBase иногда требуется более простое правило или правило, используемое в связанной коллекции.
    // Сделаем их читаемыми для авторизованных, как и было, но добавим фильтр на уровне фронта. 
    // Либо привяжем явно к программе.
    workoutsCollection.listRule = "@request.auth.id != '' && program_id.coach_id = @request.auth.id";
    workoutsCollection.viewRule = "@request.auth.id != '' && program_id.coach_id = @request.auth.id";
    app.save(workoutsCollection);
  }

  // Обновляем program_exercises
  const exercisesCollection = app.findCollectionByNameOrId("program_exercises");
  if (exercisesCollection) {
    exercisesCollection.listRule = "@request.auth.id != '' && workout_id.program_id.coach_id = @request.auth.id";
    exercisesCollection.viewRule = "@request.auth.id != '' && workout_id.program_id.coach_id = @request.auth.id";
    app.save(exercisesCollection);
  }

}, (app) => {
  // откатываем
  const workoutsCollection = app.findCollectionByNameOrId("program_workouts");
  if (workoutsCollection) {
    workoutsCollection.listRule = "@request.auth.id != ''";
    workoutsCollection.viewRule = "@request.auth.id != ''";
    app.save(workoutsCollection);
  }

  const exercisesCollection = app.findCollectionByNameOrId("program_exercises");
  if (exercisesCollection) {
    exercisesCollection.listRule = "@request.auth.id != ''";
    exercisesCollection.viewRule = "@request.auth.id != ''";
    app.save(exercisesCollection);
  }
});
