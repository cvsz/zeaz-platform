import os
import json
import time
import redis
import psycopg2

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DB_URL = os.getenv("DATABASE_URL")

redis_client = redis.from_url(REDIS_URL)

def process_task(task):
    print(f"Processing task: {task['task_id']}")
    # Simulate LangGraph Execution Engine & Tool Runner
    time.sleep(2)
    
    # Store result in Postgres (Memory Store)
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute(
            "CREATE TABLE IF NOT EXISTS execution_results (task_id TEXT PRIMARY KEY, result JSONB)"
        )
        result = {"output": f"Successfully processed {task['graph_id']}", "status": "done"}
        cur.execute(
            "INSERT INTO execution_results (task_id, result) VALUES (%s, %s)",
            (task['task_id'], json.dumps(result))
        )
        conn.commit()
        cur.close()
        conn.close()
        print(f"Task {task['task_id']} completed successfully.")
    except Exception as e:
        print(f"Error persisting state: {e}")

if __name__ == "__main__":
    print("AI Runtime Worker started. Listening on ai_task_queue...")
    while True:
        try:
            _, message = redis_client.brpop("ai_task_queue", timeout=0)
            task = json.loads(message)
            process_task(task)
        except Exception as e:
            print(f"Worker Error: {e}")
            time.sleep(5)
