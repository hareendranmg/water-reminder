use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, Window, Emitter,
};
use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;
use std::fs;
use std::path::PathBuf;

// Shared state to hold the interval
struct AppState {
    interval_secs: Mutex<u64>,
    last_shown: Mutex<Instant>,
}

#[tauri::command]
async fn hide_window(window: Window) {
    if let Err(e) = window.hide() {
        eprintln!("Failed to hide window: {}", e);
    }
}

#[tauri::command]
async fn show_window(window: Window) {
    if let Err(e) = window.show() {
        eprintln!("Failed to show window: {}", e);
    }
    let _ = window.set_focus();
    let _ = window.set_always_on_top(true);
}

// Define the settings path
fn get_settings_path(app_handle: &tauri::AppHandle) -> PathBuf {
    app_handle.path().app_config_dir().unwrap().join("settings.json")
}

#[tauri::command]
async fn get_settings(state: tauri::State<'_, Arc<AppState>>) -> Result<u64, String> {
    let interval = *state.interval_secs.lock().unwrap();
    Ok(interval)
}

#[tauri::command]
async fn update_settings(app_handle: tauri::AppHandle, state: tauri::State<'_, Arc<AppState>>, interval: u64) -> Result<(), String> {
    *state.interval_secs.lock().unwrap() = interval;

    // Persist to disk
    let path = get_settings_path(&app_handle);
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let json = serde_json::to_string(&interval).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(AppState {
        interval_secs: Mutex::new(3600), // Default 1 hour
        last_shown: Mutex::new(Instant::now()),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .plugin(tauri_plugin_opener::init())
        .manage(state.clone())
        .invoke_handler(tauri::generate_handler![hide_window, show_window, get_settings, update_settings])
        .setup(move |app| {
            // Enable autostart on startup
            let _ = app.autolaunch().enable();

            // Load settings
            let path = get_settings_path(app.handle());
            if path.exists() {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(saved_interval) = serde_json::from_str::<u64>(&content) {
                        *state.interval_secs.lock().unwrap() = saved_interval;
                    }
                }
            }

            // System Tray Setup
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
            let show_i = MenuItem::with_id(app, "show", "Open Water Reminder", true, None::<&str>).unwrap();
            let menu = Menu::with_items(app, &[&show_i, &quit_i]).unwrap();

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "quit" => app.exit(0),
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("show-reminder", ());
                            }
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("show-reminder", ());
                        }
                    }
                })
                .build(app);


            let app_handle = app.handle().clone();
            let state_clone = state.clone();

            // Spawn a thread to check elapsed time every second
            std::thread::spawn(move || {
                loop {
                    thread::sleep(Duration::from_secs(1));

                    let interval = *state_clone.interval_secs.lock().unwrap();
                    let last_shown = *state_clone.last_shown.lock().unwrap();

                    if last_shown.elapsed().as_secs() >= interval {
                        if let Some(window) = app_handle.get_webview_window("main") {
                             // Only emit if window is not visible?
                             // Or just emit and let frontend handle it.
                             // Ideally we reset the timer ONLY if the user acknowledges,
                             // but for simplicity, we reset it when we show the reminder.

                             let _ = window.show();
                             let _ = window.set_focus();
                             let _ = window.set_always_on_top(true);
                             let _ = window.emit("show-reminder", ());

                             *state_clone.last_shown.lock().unwrap() = Instant::now();
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
