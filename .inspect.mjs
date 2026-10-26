const BASE = "http://127.0.0.1:9224";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  let version;
  for (let i = 0; i < 60; i += 1) {
    try {
      version = await (await fetch(`${BASE}/json/version`)).json();
      break;
    } catch {
      await sleep(200);
    }
  }
  if (!version) throw new Error("No DevTools");

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  };

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Runtime.enable", {}, sessionId);
  await send("Page.enable", {}, sessionId);
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
    sessionId
  );
  await send("Page.navigate", { url: "http://127.0.0.1:4174/" }, sessionId);
  await sleep(7000);

  const evaluate = async (expression) => {
    const result = await send(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
      sessionId
    );
    return result.result.value;
  };

  const info = await evaluate(`(() => {
    const tiles = [...document.querySelectorAll(".leaflet-tile")];
    const containers = [...document.querySelectorAll(".leaflet-tile-container")].map((c) => {
      const r = c.getBoundingClientRect();
      return {
        z: c.style.zIndex,
        tiles: c.querySelectorAll(".leaflet-tile").length,
        loaded: c.querySelectorAll(".leaflet-tile-loaded").length,
        rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]
      };
    });
    return {
      tileCount: tiles.length,
      loaded: document.querySelectorAll(".leaflet-tile-loaded").length,
      zooms: [...new Set(tiles.map((t) => (t.src.match(/tile\\/(\\d+)\\//) || [])[1]))],
      firstSrc: tiles[0] ? tiles[0].src : null,
      containers,
      mapPaneStyle: document.querySelector(".leaflet-map-pane")?.getAttribute("style"),
      mapRect: (() => { const r = document.getElementById("map").getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })(),
      feedCards: document.querySelectorAll(".attack-card").length
    };
  })()`);

  console.log(JSON.stringify(info, null, 2));
  await send("Browser.close").catch(() => {});
  ws.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
