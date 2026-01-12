use tauri::{Manager, Window};
use std::{thread, time::Duration};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;
use tauri::Emitter;

#[tauri::command]
async fn hide_window(window: Window) {
    window.hide().unwrap();
}

#[tauri::command]
async fn show_window(window: Window) {
    window.show().unwrap();
    window.set_focus().unwrap();
    window.set_always_on_top(true).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![hide_window, show_window])
        .setup(|app| {
            // Enable autostart on startup
            let _ = app.autolaunch().enable();

            let app_handle = app.handle().clone();
            // Spawn a thread to show the window every hour
            std::thread::spawn(move || {
                loop {
                    // Wait for 1 hour
                    thread::sleep(Duration::from_secs(3600));

                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.set_always_on_top(true);
                        // Emit event so frontend knows to switch to reminder mode
                        let _ = window.emit("show-reminder", ());
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
