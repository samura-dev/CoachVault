migrate((app) => {
  const RULES = {
    athletes: '@request.auth.id != "" && coach_id = @request.auth.id',
    programs: '@request.auth.id != "" && coach_id = @request.auth.id',
    metrics: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    notes: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    photos: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    share_links: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    sd_activity_logs: '@request.auth.id != "" && user = @request.auth.id',
    sd_notifications: '@request.auth.id != "" && user = @request.auth.id',
    reminders: '@request.auth.id != "" && coach_id = @request.auth.id',
    client_programs: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    daily_tracking: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    workout_logs: '@request.auth.id != "" && athlete_id.coach_id = @request.auth.id',
    set_logs: '@request.auth.id != "" && workout_log_id.athlete_id.coach_id = @request.auth.id',
    program_workouts: '@request.auth.id != "" && program_id.coach_id = @request.auth.id',
    program_exercises: '@request.auth.id != "" && workout_id.program_id.coach_id = @request.auth.id'
  };

  for (const [colName, rule] of Object.entries(RULES)) {
    try {
      const col = app.findCollectionByNameOrId(colName);
      
      // Strict List, View, Update, Delete
      col.listRule = rule;
      col.viewRule = rule;
      col.updateRule = rule;
      col.deleteRule = rule;
      
      // For createRule we need to check request.data if it's direct, but PocketBase v0.22+ 
      // allows checking relation data on create via rules. We will use the same rule for create.
      // Exception: programs and athletes createRule had specific rules in previous migrations.
      if (colName === 'athletes' || colName === 'programs' || colName === 'reminders') {
        col.createRule = '@request.auth.id != "" && @request.data.coach_id = @request.auth.id';
      } else if (colName === 'sd_activity_logs' || colName === 'sd_notifications') {
        col.createRule = '@request.auth.id != "" && @request.data.user = @request.auth.id';
      } else {
        col.createRule = rule;
      }
      
      app.save(col);
    } catch (e) {
      console.log("Failed to strictly secure " + colName + ": " + e);
    }
  }
}, (app) => {
  // Reverting would mean un-securing, so we do nothing on rollback.
});
