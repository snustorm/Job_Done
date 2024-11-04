// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Debug, Clone, serde::Serialize)]
struct Task {
    content: String,
    priority: String,
}

lazy_static! {
    static ref TASK_LIST: Mutex<Vec<Task>> = Mutex::new(vec![]);
}

#[tauri::command]
fn add_task(content: String, priority: String) -> Result<Vec<Task>, String> {
    let mut tasks = TASK_LIST.lock().map_err(|_| "Failed to lock the task list".to_string())?;

    tasks.push(Task { content, priority });

    tasks.sort_by(|a, b| {
        let a_priority_value = if a.priority == "high" { 1 } else { 0 };
        let b_priority_value = if b.priority == "high" { 1 } else { 0 };
        b_priority_value.cmp(&a_priority_value)
    });

    for task in tasks.iter() {
        println!("Task: content = {}, priority = {}", task.content, task.priority);
    }


    Ok(tasks.clone())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, add_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
