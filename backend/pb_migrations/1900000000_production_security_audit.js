migrate((app) => {
  console.log("🔒 Running Production Security Audit & Rules Enforcement...");

  const cols = app.findAllCollections();
  
  for (const col of cols) {
    console.log(`Checking ${col.name}...`);
    
    // 1. Ensure users collection is secure
    if (col.name === "users") {
      col.listRule = "id = @request.auth.id";
      col.viewRule = "id = @request.auth.id";
      col.updateRule = "id = @request.auth.id";
      col.deleteRule = "id = @request.auth.id";
      col.createRule = ""; // Empty string allows public signup
      app.save(col);
      continue;
    }
    
    // 2. Ensure system collections are skipped 
    if (col.system) continue;

    // 3. Prevent null rules (public access) on ALL other collections
    // If a rule is null, it means no one can access it (which is secure).
    // If a rule is "", it means EVERYONE (public) can access it.
    // We want to make sure there are NO empty string "" rules for non-users.
    
    let modified = false;
    
    const rules = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"];
    for (const r of rules) {
      if (col[r] === "") {
        console.warn(`⚠️ Warning: ${col.name}.${r} was public (""). Locking it down.`);
        col[r] = "@request.auth.id != ''";
        modified = true;
      }
    }
    
    if (modified) {
      app.save(col);
      console.log(`✅ Secured ${col.name}`);
    }
  }

  console.log("✅ Production Security Audit Complete");
}, (app) => {});
