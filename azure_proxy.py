import json, urllib.request, sys, os, threading, time
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

AZURE_KEY = os.environ["AZURE_OPENAI_API_KEY"]
AZURE_URL = os.environ["AZURE_OPENAI_CHAT_COMPLETIONS_URL"]
OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]
OPENROUTER_URL = os.environ.get("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions")
NVIDIA_KEY = os.environ["NVIDIA_API_KEY"]
NVIDIA_URL = os.environ.get("NVIDIA_URL", "https://integrate.api.nvidia.com/v1/chat/completions")

MODELS = {
    "gpt-5-mini": {
        "name": "GPT-5 Mini (Azure)", "provider": "azure",
        "api_key": AZURE_KEY, "api_url": AZURE_URL
    },
    "openrouter-auto": {
        "name": "OpenRouter (Auto)", "provider": "openrouter",
        "api_key": OPENROUTER_KEY, "api_url": OPENROUTER_URL
    },
    "nvidia-nim": {
        "name": "NVIDIA NIM", "provider": "nvidia",
        "api_key": NVIDIA_KEY, "api_url": NVIDIA_URL
    }
}

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ["/v1/models", "/models"]:
            self.send_json(200, {
                "object": "list", "data": [
                    {"id": mid, "object": "model", "created": 1700000000, "owned_by": cfg["provider"]}
                    for mid, cfg in MODELS.items()
                ]
            })
        else:
            self.send_json(404, {"error": "Not found"})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        if "/chat/completions" not in self.path:
            return self.send_json(404, {"error": "Not found"})

        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len)
        try:
            req_body = json.loads(body)
        except:
            return self.send_json(400, {"error": "Invalid JSON"})

        model_id = req_body.get("model", "gpt-5-mini")
        if model_id not in MODELS:
            return self.send_json(404, {"error": f"Model {model_id} not found"})

        cfg = MODELS[model_id]
        stream = req_body.get("stream", False)

        if cfg["provider"] == "azure":
            headers = {"Content-Type": "application/json", "api-key": cfg["api_key"]}
        else:
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {cfg['api_key']}"}
            if cfg["provider"] == "openrouter":
                headers["HTTP-Referer"] = "http://localhost:3001"

        if stream:
            self.handle_streaming(cfg["api_url"], body, headers)
        else:
            self.handle_non_streaming(cfg["api_url"], body, headers)

    def handle_non_streaming(self, url, body, headers):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_json(e.code, json.loads(e.read()))

    def handle_streaming(self, url, body, headers):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                while True:
                    chunk = resp.read(4096)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
        except urllib.error.HTTPError as e:
            self.wfile.write(f"data: {json.dumps({'error': str(e)})}\n\n".encode())
            self.wfile.flush()
        finally:
            try:
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
            except:
                pass

    def send_json(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        print(f"[proxy] {args}", file=sys.stderr)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    server = ThreadedHTTPServer(("0.0.0.0", port), ProxyHandler)
    print(f"Async multi-model proxy on port {port}", file=sys.stderr)
    server.serve_forever()
