use std::{net::SocketAddr, time::Duration};

use axum::Router;
use tokio::{net::TcpListener, signal, time::timeout};

pub async fn run_server(
    app: Router,
    addr: SocketAddr,
    shutdown_timeout: Duration,
) -> std::io::Result<()> {
    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal(shutdown_timeout))
        .await
}

pub async fn shutdown_signal(shutdown_timeout: Duration) {
    let ctrl_c = async {
        let _ = signal::ctrl_c().await;
    };

    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut sigterm) = signal::unix::signal(signal::unix::SignalKind::terminate()) {
            let _ = sigterm.recv().await;
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    let _ = timeout(shutdown_timeout, async {
        tokio::select! {
            _ = ctrl_c => {},
            _ = terminate => {},
        }
    })
    .await;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn shutdown_signal_times_out() {
        let start = tokio::time::Instant::now();
        shutdown_signal(Duration::from_millis(25)).await;
        assert!(start.elapsed() >= Duration::from_millis(25));
    }
}
