use anyhow::{Context, Result};
use microsandbox::{ExecEvent, Sandbox};
use std::env;
use std::path::{Path, PathBuf};
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<()> {
    let image = env::var("OPENWORK_MICROSANDBOX_IMAGE")
        .unwrap_or_else(|_| "openwork-microsandbox:dev".to_string());
    let name = env::var("OPENWORK_MICROSANDBOX_NAME")
        .unwrap_or_else(|_| "openwork-microsandbox-rust".to_string());
    let workspace_dir = env::var("OPENWORK_MICROSANDBOX_WORKSPACE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| default_bind_dir(&name, "workspace"));
    let data_dir = env::var("OPENWORK_MICROSANDBOX_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| default_bind_dir(&name, "data"));
    let replace = env_flag("OPENWORK_MICROSANDBOX_REPLACE");
    let connect_host =
        env::var("OPENWORK_CONNECT_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let client_token =
        env::var("OPENWORK_TOKEN").unwrap_or_else(|_| "microsandbox-token".to_string());
    let host_token =
        env::var("OPENWORK_HOST_TOKEN").unwrap_or_else(|_| "microsandbox-host-token".to_string());

    println!("Starting microsandbox `{name}` from image `{image}`");

    ensure_bind_dir(&workspace_dir).await?;
    ensure_bind_dir(&data_dir).await?;

    let mut builder = Sandbox::builder(&name)
        .image(image.as_str())
        .memory(2048)
        .cpus(2)
        .env("OPENWORK_CONNECT_HOST", &connect_host)
        .env("OPENWORK_TOKEN", &client_token)
        .env("OPENWORK_HOST_TOKEN", &host_token)
        .env("OPENWORK_APPROVAL_MODE", "auto")
        .volume("/workspace", |v| {
            v.bind(workspace_dir.to_string_lossy().as_ref())
        })
        .volume("/data", |v| v.bind(data_dir.to_string_lossy().as_ref()));

    if replace {
        builder = builder.replace();
    }

    let sandbox = builder
        .create()
        .await
        .with_context(|| {
            format!(
                "failed to create microsandbox from image `{image}`; if this image only exists in Docker, push it to a registry or otherwise make it available as an OCI image reference first"
            )
        })?;

    let server = sandbox
        .exec_stream(
            "/bin/sh",
            ["-lc", "/usr/local/bin/microsandbox-entrypoint.sh"],
        )
        .await
        .context("failed to start the OpenWork microsandbox entrypoint inside the VM")?;

    let log_task = tokio::spawn(async move {
        let mut server = server;
        while let Some(event) = server.recv().await {
            match event {
                ExecEvent::Stdout(data) => print!("{}", String::from_utf8_lossy(&data)),
                ExecEvent::Stderr(data) => eprint!("{}", String::from_utf8_lossy(&data)),
                ExecEvent::Exited { code } => {
                    eprintln!("microsandbox entrypoint exited with code {code}");
                    break;
                }
                _ => {}
            }
        }
    });

    println!();
    println!("Host port publishing is disabled in this dependency-safe build.");
    println!("Use microsandbox CLI/runtime networking when a patched networking stack is available.");
    println!("Configured connect host: {connect_host}");
    println!("Remote connect token: {client_token}");
    println!("Host/admin token: {host_token}");
    println!("Workspace dir: {}", workspace_dir.display());
    println!("Data dir: {}", data_dir.display());
    println!("Sandbox logs are streaming below.");
    println!("Press Ctrl+C to stop the sandbox.");

    tokio::signal::ctrl_c()
        .await
        .context("failed waiting for Ctrl+C")?;
    println!("Stopping microsandbox `{name}`...");
    sandbox
        .stop()
        .await
        .context("failed to stop microsandbox")?;
    let _ = tokio::time::timeout(Duration::from_secs(5), log_task).await;

    Ok(())
}

fn env_flag(name: &str) -> bool {
    matches!(
        env::var(name).ok().as_deref(),
        Some("1") | Some("true") | Some("TRUE") | Some("yes") | Some("YES")
    )
}

fn default_bind_dir(name: &str, suffix: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join(".state")
        .join(name)
        .join(suffix)
}

async fn ensure_bind_dir(path: &Path) -> Result<()> {
    tokio::fs::create_dir_all(path)
        .await
        .with_context(|| format!("failed to create bind mount directory `{}`", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn env_flag_accepts_truthy_values() {
        unsafe { std::env::set_var("OPENWORK_MICROSANDBOX_TEST_FLAG", "yes") };
        assert!(env_flag("OPENWORK_MICROSANDBOX_TEST_FLAG"));
        unsafe { std::env::remove_var("OPENWORK_MICROSANDBOX_TEST_FLAG") };
    }
}
