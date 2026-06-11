from packages.queue.render_queue import InMemoryQueue, RenderTask, enqueue_render


def test_enqueue_render_returns_local_id() -> None:
    queue = InMemoryQueue()
    task = RenderTask(prompt="scene", style="cinematic", duration=15)

    job_id = enqueue_render(task, queue)

    assert job_id == "local-1"
    assert queue.jobs == [task]
