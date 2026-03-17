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
    const col = app.findCollectionByNameOrId(colName);
    if (!col) {
      console.log("Collection not found: " + colName);
      continue;
    }
    
    col.listRule = rule;
    col.viewRule = rule;
    col.updateRule = rule;
    col.deleteRule = rule;
    
    if (colName === 'athletes' || colName === 'programs' || colName === 'reminders') {
      col.createRule = '@request.auth.id != "" && @request.data.coach_id = @request.auth.id';
    } else if (colName === 'sd_activity_logs' || colName === 'sd_notifications') {
      col.createRule = '@request.auth.id != "" && @request.data.user = @request.auth.id';
    } else {
      col.createRule = rule;
    }
    
    try {
      app.save(col);
      console.log("SUCCESS " + colName);
    } catch (e) {
      console.log("ERROR on " + colName + ": " + e.message);
      // fallback to simpler rule if relational createRule is the issue
      try {
        col.createRule = '@request.auth.id != ""';
        app.save(col);
        console.log("SUCCESS with workaround " + colName);
      } catch (err2) {
        console.log("STILL ERROR " + colName + ": " + err2.message);
      }
    }
  }
}, (app) => {});
