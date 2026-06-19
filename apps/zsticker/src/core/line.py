import os
import httpx
import asyncio
import logging
from src.utils.logger import get_logger
from src.utils.metrics import line_send_success

logger = get_logger(__name__)

class LineAPI:
    def __init__(self, config):
        self.line_token = config.line_token
        self.group_id = config.line_group_id
        self.imgur_id = config.imgur_client_id
        self.headers = {
            "Authorization": f"Bearer {self.line_token}",
            "Content-Type": "application/json"
        }
        self.base_url = "https://api.line.me/v2/bot/message/push"
        
        # Async Queue to respect 1000 msg/min rate limit
        self.queue = asyncio.Queue()
        self.worker_task = None

    async def start_worker(self):
        if self.worker_task is None:
            self.worker_task = asyncio.create_task(self._worker())

    async def stop_worker(self):
        if self.worker_task:
            self.worker_task.cancel()
            self.worker_task = None

    async def _worker(self):
        while True:
            payload, future = await self.queue.get()
            try:
                # 1000 messages / 60 seconds = ~16 msgs / sec. Delay 0.065s to be safe.
                await asyncio.sleep(0.065)
                async with httpx.AsyncClient() as client:
                    resp = await client.post(self.base_url, headers=self.headers, json=payload)
                    result = self._parse_response(resp)
                    
                    if result['error_code'] == 429:
                        wait_time = result['retry_after'] or 60
                        logger.warning(f"Rate limited. Waiting {wait_time}s before next request.")
                        await asyncio.sleep(wait_time)
                        
                    future.set_result(result)
            except Exception as e:
                future.set_exception(e)
            finally:
                self.queue.task_done()

    async def upload_to_imgur(self, image_path: str, retries: int = 3) -> str:
        for attempt in range(retries):
            try:
                logger.info(f"Uploading {image_path} to Imgur (Attempt {attempt+1}/{retries})")
                async with httpx.AsyncClient() as client:
                    with open(image_path, "rb") as f:
                        img_data = f.read()
                    resp = await client.post(
                        "https://api.imgur.com/3/image",
                        headers={"Authorization": f"Client-ID {self.imgur_id}"},
                        files={"image": img_data},
                        timeout=10.0
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    url = data['data']['link']
                    logger.info(f"Imgur upload success: {url}")
                    return url
            except Exception as e:
                logger.warning(f"Imgur upload failed: {e}")
                if attempt == retries - 1:
                    logger.warning("Falling back to LINE native upload...")
                    return await self.fallback_upload_to_line(image_path)
                await asyncio.sleep(2 ** attempt)

    async def fallback_upload_to_line(self, image_path: str) -> str:
        # Note: LINE Messaging API does not host images for push messages directly.
        # This fallback is a stub. In a full production app, you might fall back to AWS S3, GCS, etc.
        logger.error("LINE does not support native image hosting for push messages. Needs external CDN.")
        raise RuntimeError("Imgur upload failed and LINE native upload is not supported.")

    def _parse_response(self, response: httpx.Response) -> dict:
        result = {
            "success": response.status_code == 200,
            "message_id": "",
            "error_code": response.status_code,
            "retry_after": 0
        }
        if response.status_code == 200:
            data = response.json()
            logger.info("Message sent successfully (200)")
            line_send_success.inc()
            # Push API does not return message_id in the response body. 
        elif response.status_code == 429:
            retry_after = response.headers.get("Retry-After", 60)
            result["retry_after"] = int(retry_after)
            logger.warning(f"Rate limit exceeded (429). Retry-After: {retry_after}s")
        elif response.status_code == 401:
            logger.error("Unauthorized (401) - Check LINE_TOKEN")
        elif response.status_code == 400:
            logger.error(f"Bad Request (400): {response.text}")
        else:
            logger.error(f"API Error {response.status_code}: {response.text}")
            
        logger.debug(f"API Result Payload: {result}")
        return result

    async def _enqueue_payload(self, to: str, messages: list) -> dict:
        await self.start_worker()
        payload = {"to": to, "messages": messages}
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        await self.queue.put((payload, future))
        return await future

    async def send_text(self, text: str, to: str = None) -> dict:
        to = to or self.group_id
        messages = [{"type": "text", "text": text}]
        return await self._enqueue_payload(to, messages)

    async def send_image(self, image_url: str, caption: str = "", to: str = None) -> dict:
        to = to or self.group_id
        messages = [{"type": "image", "originalContentUrl": image_url, "previewImageUrl": image_url}]
        if caption:
            messages.append({"type": "text", "text": caption})
        return await self._enqueue_payload(to, messages)

    async def send_flex(self, alt_text: str, contents: dict, to: str = None) -> dict:
        to = to or self.group_id
        messages = [{"type": "flex", "altText": alt_text, "contents": contents}]
        return await self._enqueue_payload(to, messages)
