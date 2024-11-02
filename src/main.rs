use rmpv::Value;
use socketioxide::{
    extract::{Data, SocketRef},
    ParserConfig, SocketIo,
};
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, services::ServeDir};
use tracing::info;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_default_env())
        .init();

    info!("Starting server");

    let (layer, io) = SocketIo::builder()
        .with_parser(ParserConfig::msgpack())
        .build_layer();

    io.ns("/", |s: SocketRef| {
        s.on("draw", |s: SocketRef, Data::<Value>(data)| {
            info!("drawing event!");
            s.broadcast().emit("draw", &data).unwrap();});
        });

    let app = axum::Router::new()
        .nest_service("/", ServeDir::new("web"))
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive()) // Enable CORS policy
                .layer(layer),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:4269").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
