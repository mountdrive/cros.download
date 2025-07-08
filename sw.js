//https://stackoverflow.com/a/41797377/21330993
function hex_to_b64(hex) {
  return btoa(hex.match(/\w{2}/g).map(function(a) {
      return String.fromCharCode(parseInt(a, 16));
  }).join(""));
}

async function fetch_chunks(controller, base_url, chunks) {
  try {
    for (let chunk of chunks) {
      let chunk_url = `${base_url}/${chunk}`;
      let response = await fetch(chunk_url);

      if (!response.ok) 
        throw new Error(`Failed to fetch ${chunk_url}: ${res.status}`);

      let reader = response.body.getReader();
      while (true) {
        let data = await reader.read();
        if (data.done) break;
        controller.enqueue(data.value);
      }
    }
    controller.close();
  } 
  catch (err) {
    controller.error(err);
  }
}

async function fetch_shim(path) {
  let zip_file = path.split("/").at(-1);
  let board_name = zip_file.split(".")[0];
  let base_url = `https://cdn.cros.download/files/${board_name}`
  let manifest_url = `${base_url}/${zip_file}.manifest`;

  let response = await fetch(manifest_url);
  let manifest = await response.json();

  let stream = new ReadableStream({
    async start(controller) {
      await fetch_chunks(controller, base_url, manifest.chunks);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${zip_file}"`,
      "Content-Length": manifest.size,
      "Content-Digest": `sha-256=:${hex_to_b64(manifest.hash)}:`
    }
  });
}

self.addEventListener("fetch", (event) => {
  let request = event.request;
  let path = new URL(request.url).pathname;

  if (path.startsWith("/sw/shims/")) {
    event.respondWith(fetch_shim(path));
  }
});
