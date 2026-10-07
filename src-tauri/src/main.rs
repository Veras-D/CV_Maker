// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
async fn fetch_url_html(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network request failed: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Website returned HTTP status {}", res.status()));
    }

    res.text()
        .await
        .map_err(|e| format!("Failed to read website response body: {}", e))
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn save_file_to_directory(directory: String, filename: String, bytes: Vec<u8>) -> Result<String, String> {
    use std::path::Path;
    use std::fs;

    let dir = Path::new(&directory);
    if !dir.exists() {
        fs::create_dir_all(dir).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    let target_path = dir.join(&filename);
    fs::write(&target_path, bytes).map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(target_path.to_string_lossy().to_string())
}

#[tauri::command]
fn pick_directory() -> Result<Option<String>, String> {
    #[cfg(target_os = "linux")]
    {
        let output = std::process::Command::new("zenity")
            .args(["--file-selection", "--directory", "--title=Select Download Destination Folder"])
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                let path_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !path_str.is_empty() {
                    return Ok(Some(path_str));
                }
            }
        }

        let output = std::process::Command::new("kdialog")
            .args(["--getexistingdirectory"])
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                let path_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !path_str.is_empty() {
                    return Ok(Some(path_str));
                }
            }
        }

        Ok(None)
    }

    #[cfg(target_os = "windows")]
    {
        let script = r#"
            Add-Type -AssemblyName System.Windows.Forms
            $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
            $dialog.Description = "Select Download Destination Folder"
            if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
                Write-Output $dialog.SelectedPath
            }
        "#;
        let output = std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", script])
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                let path_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !path_str.is_empty() {
                    return Ok(Some(path_str));
                }
            }
        }
        Ok(None)
    }

    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .args(["-e", "POSIX path of (choose folder with prompt \"Select Download Destination Folder\")"])
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                let path_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !path_str.is_empty() {
                    return Ok(Some(path_str));
                }
            }
        }
        Ok(None)
    }
}

fn main() {
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch_url_html,
            open_external_url,
            save_file_to_directory,
            pick_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
