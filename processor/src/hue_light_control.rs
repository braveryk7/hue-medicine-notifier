use std::collections::HashMap;

use crate::modules::connection;
use crate::modules::connection::User;
use serde_json::{json, Value};
use sqlx::query_as;

#[derive(Debug)]
struct Plan {
    user_id: i32,
    xy_x: Option<f64>,
    xy_y: Option<f64>,
    brightness: i32,
    color_temperature: Option<i32>,
}

#[derive(Debug)]
struct GenerateBodyArgs {
    light_type: Option<String>,
    on_off: bool,
    brightness: f64,
    color: Option<(f64, f64)>,
    color_temperature: Option<i32>,
}

pub async fn hue_light_control(
    plan_id: i32,
    users_map: &HashMap<i32, User>, // User情報を格納したHashMap
) -> Result<(), Box<dyn std::error::Error>> {
    let pool = connection::db().await?;
    let access_token = connection::get_access_token();

    let plan: Option<Plan> = query_as!(
        Plan,
        r#"
        SELECT 
            user_id AS "user_id: i32",
            xy_x AS "xy_x: f64",
            xy_y AS "xy_y: f64",
            brightness AS "brightness: i32",
            color_temperature AS "color_temperature: i32"
        FROM Plan
        WHERE id = ?
        "#,
        plan_id
    )
    .fetch_optional(&pool)
    .await?;

    if let Some(plan) = plan {
        if let Some(user) = users_map.get(&plan.user_id) {
            let url = connection::generate_url(&user.light_id);

            let current_light =
                get_current_light_status(user.light_id.as_str(), access_token.as_str()).await?;

            let current_on_off = current_light
                .as_ref()
                .and_then(|data| data["on"]["on"].as_bool())
                .unwrap_or(false);

            let current_brightness = current_light
                .as_ref()
                .and_then(|data| data["dimming"]["brightness"].as_f64())
                .unwrap_or(0.0);

            let current_xy_color = current_light
                .as_ref()
                .and_then(|data| data["color"]["xy"].as_array())
                .and_then(|arr| {
                    if arr.len() == 2 {
                        Some((arr[0].as_f64()?, arr[1].as_f64()?))
                    } else {
                        None
                    }
                });

            let current_color_temperature = current_light
                .as_ref()
                .and_then(|data| data["color"]["color_temperature"]["mirek"].as_i64())
                .map(|ct| ct as i32);
            let color = match (plan.xy_x, plan.xy_y) {
                (Some(x), Some(y)) => Some((x, y)),
                _ => None,
            };

            // ライト操作
            let body = generate_body(GenerateBodyArgs {
                light_type: Some(user.light_type.clone()),
                on_off: true,
                brightness: plan.brightness as f64,
                color,
                color_temperature: plan.color_temperature,
            });

            let response = update_light_state(&url, body).await;
            handle_light_state_response(response, "Update light state").await;

            tokio::time::sleep(std::time::Duration::from_secs(4)).await;

            // ライト状態の復元
            let body = generate_body(GenerateBodyArgs {
                light_type: None,
                on_off: current_on_off,
                brightness: current_brightness,
                color: current_xy_color,
                color_temperature: current_color_temperature,
            });

            let restore_light_response = update_light_state(&url, body).await;
            handle_light_state_response(restore_light_response, "Restore light state").await;

            println!("Plan processed successfully.");
        } else {
            println!("No user found for User ID: {}", plan.user_id);
        }
    } else {
        println!("No plan found for Plan ID: {}", plan_id);
    }

    Ok(())
}

fn generate_body(args: GenerateBodyArgs) -> Value {
    let mut body = json!({
        "on": { "on": args.on_off },
        "dimming": { "brightness": args.brightness },
    });

    match &args.light_type {
        Some(light_type) => match light_type.as_str() {
            "color" => {
                if let Some((x, y)) = args.color {
                    body.as_object_mut().unwrap().insert(
                        "signaling".to_string(),
                        json!({
                            "signal": "on_off_color",
                            "duration": 5000,
                            "colors": [ {"xy": { "x": x, "y": y } } ]
                        }),
                    );
                }
            }
            "white" => {}
            "whiteAmbiance" => {
                if let Some(color_temperature) = args.color_temperature {
                    body.as_object_mut().unwrap().insert(
                        "color_temperature".to_string(),
                        json!({ "mirek": color_temperature }),
                    );
                }

                if let Some(color_temperature) = args.color_temperature {
                    body.as_object_mut().unwrap().insert(
                        "signaling".to_string(),
                        json!({
                            "signal": "on_off",
                            "duration": 5000,
                        }),
                    );
                    // bodyにcolor_temperature: { "mirek": color_temperature }を追加
                    body.as_object_mut().unwrap().insert(
                        "color_temperature".to_string(),
                        json!({ "mirek": color_temperature }),
                    );
                }
            }
            _ => {}
        },
        None => {
            body.as_object_mut().unwrap().insert(
                "dynamics".to_string(),
                json!({ "duration": 0, "speed": 1.0 }),
            );
        }
    }

    body
}

async fn update_light_state(url: &str, body: Value) -> Result<reqwest::Response, reqwest::Error> {
    let access_token = connection::get_access_token();
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()?;

    let response = client
        .put(url)
        .header("hue-application-key", &access_token)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await?;

    Ok(response)
}

async fn handle_light_state_response(
    response: Result<reqwest::Response, reqwest::Error>,
    context: &str,
) {
    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                println!(
                    "{} succeeded: {}",
                    context,
                    resp.text().await.unwrap_or_default()
                );
            } else {
                println!(
                    "{} failed: HTTP Status {} - {}",
                    context,
                    resp.status(),
                    resp.text().await.unwrap_or_default()
                );
            }
        }
        Err(err) => {
            println!("{} request failed: {:?}", context, err);
        }
    }
}

async fn get_current_light_status(
    light_id: &str,
    access_token: &str,
) -> Result<Option<Value>, Box<dyn std::error::Error>> {
    let url = connection::generate_url(light_id);

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()?;

    let header_value = reqwest::header::HeaderValue::from_str(access_token)
        .map_err(|e| format!("Invalid header value: {}", e))?;

    let response = client
        .get(&url)
        .header("hue-application-key", header_value)
        .header("Content-Type", "application/json")
        .send()
        .await?;

    let json: Value = response.json().await?;
    let current_light_data = json
        .get("data")
        .and_then(|data| data.as_array())
        .and_then(|array| array.first())
        .cloned();

    Ok(current_light_data)
}
