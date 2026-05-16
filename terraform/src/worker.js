export default {
  async fetch(request) {
    return new Response("zeaz-platform worker ok\n", {
      headers: { "content-type": "text/plain" }
    });
  }
}
