use sqlx::{Error, SqlitePool};
use std::env;

pub struct User {
    pub id: i32,
    pub light_id: String,
    pub light_type: String,
}

pub async fn db() -> Result<SqlitePool, Error> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    let pool = SqlitePool::connect(&database_url).await?;
    Ok(pool)
}

pub fn generate_url(light_id: &str) -> String {
    let bridge_ip = env::var("BRIDGE_IP").expect("BRIDGE_IP is not set");

    format!("https://{}/clip/v2/resource/light/{}", bridge_ip, light_id)
}

pub fn get_access_token() -> String {
    env::var("ACCESS_TOKEN").expect("ACCESS_TOKEN is not set")
}
