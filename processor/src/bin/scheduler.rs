use chrono::{Duration, TimeZone, Utc};
use dotenv::dotenv;
use hue_medicine_notifier::modules::connection;
use sqlx::query_as;

#[derive(Debug)]
struct User {
    id: i32,
    utc_offset: i32, // ユーザーのUTCオフセットを保持
}

#[derive(Debug)]
struct Plan {
    id: i32,
    time_of_day: i32,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let pool = connection::db().await?;

    let users: Vec<User> = query_as!(
        User,
        r#"
        SELECT
            id AS "id: i32",
            utc_offset AS "utc_offset: i32"
        FROM User
        WHERE is_deleted = false
        ORDER BY id
        "#
    )
    .fetch_all(&pool)
    .await?;

    for user in users {
        let plans: Vec<Plan> = query_as!(
            Plan,
            r#"
            SELECT
                id AS "id: i32",
                time_of_day AS "time_of_day: i32"
            FROM Plan
            WHERE is_active = true AND user_id = ?
            ORDER BY id
            "#,
            user.id
        )
        .fetch_all(&pool)
        .await?;

        for plan in plans {
            println!(
                "Checking plan_id: {} with time_of_day: {}",
                plan.id, plan.time_of_day
            );

            let user_offset = Duration::minutes(user.utc_offset.into());
            let now = Utc::now();
            let today_user_time = (now + user_offset).naive_utc().date();

            let mut days_offset = 0;
            let mut total_minutes = plan.time_of_day;

            if total_minutes < 0 {
                days_offset -= 1;
                total_minutes += 24 * 60
            }

            let hours = total_minutes / 60;
            let minutes = total_minutes % 60;

            let adjusted_date = today_user_time + Duration::days(days_offset);

            let naive_datetime = match adjusted_date.and_hms_opt(hours as u32, minutes as u32, 0) {
                Some(time) => time,
                None => {
                    eprintln!(
                        "Error: Unable to calculate naive_datetime for plan_id: {} with time_of_day: {} (hours: {}, minutes: {})",
                        plan.id, plan.time_of_day, hours, minutes
                    );
                    continue;
                }
            };

            let datetime_utc = Utc.from_utc_datetime(&naive_datetime);
            let timestamp = datetime_utc.timestamp();

            let existing_task = sqlx::query_scalar!(
                r#"
                SELECT plan_id
                FROM Task
                WHERE plan_id = ? AND date = ?
                "#,
                plan.id,
                timestamp
            )
            .fetch_optional(&pool)
            .await?;

            if existing_task.is_some() {
                continue;
            }

            let result = sqlx::query!(
                r#"
                INSERT INTO Task (plan_id, date, is_completed, completed_at, light_action_count)
                VALUES (?, ?, ?, ?, ?)
                "#,
                plan.id,
                timestamp,
                false,
                None::<i64>,
                0
            )
            .execute(&pool)
            .await?;

            println!("Inserted Task with ID: {:?}", result.last_insert_rowid());
        }
    }

    Ok(())
}
