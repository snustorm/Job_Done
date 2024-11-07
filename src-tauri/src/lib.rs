// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Mutex;
use lazy_static::lazy_static;
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Task {
    content: String,
    priority: String,
}

lazy_static! {
    static ref TASK_LIST: Mutex<Vec<Task>> = Mutex::new(load_tasks_from_file().expect("Failed to load tasks on startup"));
}

//println!("Loaded initial tasks: {:?}", *TASK_LIST.lock().unwrap());
#[tauri::command]
fn load_tasks_from_file() -> Result<Vec<Task>, String> {
    let path = "tasks.json";
    let data = std::fs::read_to_string(path).unwrap_or_else(|_| "[]".to_string()); // Default to an empty list if file is missing

    // Deserialize with error handling
    match serde_json::from_str(&data) {
        Ok(tasks) => Ok(tasks),
        Err(e) => {
            println!("Failed to load tasks from file: {:?}", e); // Log the error
            Err("Failed to load tasks".to_string())
        }
    }
}

fn save_tasks_to_file(tasks: &Vec<Task>) -> Result<(), String> {
    let data = serde_json::to_string(tasks).map_err(|_| "Failed to serialize tasks".to_string())?;
    fs::write("tasks.json", data).map_err(|_| "Failed to save tasks to file".to_string())

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

    save_tasks_to_file(&tasks)?;

    for task in tasks.iter() {
        println!("Task: content = {}, priority = {}", task.content, task.priority);
    }

    Ok(tasks.clone())
}


#[tauri::command]
fn reset() -> Result<(), String> {
    let mut tasks = TASK_LIST.lock().map_err(|_| "Failed to lock the task list".to_string())?;

    tasks.clear();

    save_tasks_to_file(&tasks).map_err(|e| {
        println!("Failed to save tasks to file after reset: {:?}", e);
        "Failed to reset tasks".to_string()
    })
}

#[tauri::command]
fn complete_task(index: usize) -> Result<(), String> {
    
    let mut ongoing_tasks = load_tasks_from_file()?;

    if index >= ongoing_tasks.len() {
        return Err("Invalid task index".to_string());
    }

    ongoing_tasks.remove(index);

    save_tasks_to_file(&ongoing_tasks)?;

    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, add_task, load_tasks_from_file, reset, complete_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
