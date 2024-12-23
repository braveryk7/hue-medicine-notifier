mod hue_light_control;
mod modules;

use crate::modules::connection;
use crate::modules::connection::User;
use dotenv::dotenv;
use futures::future::join_all;
use hue_light_control::hue_light_control;
use sqlx::query_as;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug)]
struct Task {
    id: i32,
    plan_id: i32,
    user_id: i32,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let pool = connection::db().await?;

    let tasks: Vec<Task> = query_as!(
        Task,
        r#"
        SELECT 
            Task.id AS "id: i32",
            Task.plan_id AS "plan_id: i32",
            Plan.user_id AS "user_id: i32"
        FROM Task
        INNER JOIN Plan ON Task.plan_id = Plan.id
        INNER JOIN User ON Plan.user_id = User.id
        WHERE 
            is_completed = false AND
            Task.date <= strftime('%s', 'now') AND
            Task.date > strftime('%s', 'now', '-1 day');
        "#
    )
    .fetch_all(&pool)
    .await?;

    if tasks.is_empty() {
        println!("No tasks to process");
        return Ok(());
    }

    let users: Vec<User> = query_as!(
        User,
        r#"
        SELECT 
            id AS "id: i32",
            light_id AS "light_id: String",
            light_type AS "light_type: String",
            utc_offset AS "utc_offset: i32"
        FROM User
        WHERE is_deleted = false
        ORDER BY id
        "#
    )
    .fetch_all(&pool)
    .await?;

    let users_map: HashMap<i32, User> = users.into_iter().map(|user| (user.id, user)).collect();

    let light_locks: Arc<Mutex<HashMap<String, Arc<Mutex<()>>>>> =
        Arc::new(Mutex::new(HashMap::new()));

    let tasks_futures: Vec<_> = tasks
        .into_iter()
        .map(|task| {
            let users_map = &users_map;
            let light_locks = Arc::clone(&light_locks);

            async move {
                println!("task.id: {}", task.id);

                if let Some(user) = users_map.get(&task.user_id) {
                    let light_id = user.light_id.clone();

                    let lock = {
                        let mut locks = light_locks.lock().await;
                        locks
                            .entry(light_id.clone())
                            .or_insert_with(|| Arc::new(Mutex::new(())))
                            .clone()
                    };

                    let _guard = lock.lock().await;

                    match hue_light_control(task.plan_id, users_map).await {
                        Ok(_) => {
                            println!("Task for plan_id {} completed successfully", task.plan_id)
                        }
                        Err(err) => println!("Task for plan_id {} failed: {:?}", task.plan_id, err),
                    }
                } else {
                    println!("No user found for task with plan_id: {}", task.plan_id);
                }
            }
        })
        .collect();

    join_all(tasks_futures).await;

    Ok(())
}
