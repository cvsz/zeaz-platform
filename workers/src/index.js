export default {
  async fetch() {
    return new Response("zeaz-platform worker online\n", {
      headers: { "content-type": "text/plain" }
    });
  }
}
