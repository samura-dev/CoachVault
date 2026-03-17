// Миграция: временно упрощаем ВСЕ API rules до '@request.auth.id != ""'
// Это гарантированно рабочий формат — create rules с ним работают
// После того как убедимся что всё работает — добавим фильтрацию

const SIMPLE_RULE = '@request.auth.id != ""';

const COLLECTIONS = [
  "sd_notifications",
  "athletes",
  "programs",
  "metrics",
  "notes",
  "photos",
  "share_links",
  "sd_activity_logs",
  "reminders",
  "client_programs",
  "daily_tracking",
  "workout_logs",
  "set_logs",
  "program_workouts",
  "program_exercises",
];

migrate((app) => {
  for (const name of COLLECTIONS) {
    try {
      const col = app.findCollectionByNameOrId(name);
      col.listRule = SIMPLE_RULE;
      col.viewRule = SIMPLE_RULE;
      col.createRule = SIMPLE_RULE;
      col.updateRule = SIMPLE_RULE;
      col.deleteRule = SIMPLE_RULE;
      app.save(col);
    } catch (e) {
      console.log(name + ": " + e);
    }
  }
}, (app) => {
  // Откат не нужен
});
