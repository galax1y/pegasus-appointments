#[tauri::command]
pub fn create_project(name: &str) {
  println!("Project created with name : {}", name);
}

#[tauri::command]
pub fn update_project(name: &str) {
  println!("Updated project created with name : {}", name);
}

#[tauri::command]
pub fn delete_project(name: &str) {
  println!("Deleted project with name : {}", name);
}