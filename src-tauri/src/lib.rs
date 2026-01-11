use linker::Linker;

#[tauri::command]
async fn get_linker() -> Result<(Linker, Vec<String>), String> {
    let (linker, res) = Linker::parse().await.map_err(|e| format!("{}", e))?;
    Ok((linker, res))
}

#[tauri::command(rename_all = "snake_case")]
async fn invoke_weapon(weapon_name: String) -> Result<(), String> {
    let (linker, _res) = Linker::parse().await.map_err(|e| format!("{}", e))?;
    linker
        .invoke_weapon(weapon_name)
        .await
        .map_err(|e| format!("{}", e))?;
    Ok(())
}

#[tauri::command]
async fn get_config_path() -> Result<String, String> {
    let config_path = linker::linker_config_path().map_err(|e| e.to_string())?;
    Ok(config_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_linker,
            invoke_weapon,
            get_config_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
