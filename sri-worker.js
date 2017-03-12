const INTEGRITY_METADATA = {
  // this could live in its own separate file.
  // but preferrably inlined for performance.
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js": "sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa",
  "https://html5sec.org/test.js": "sha384-moo",
  "http://code.jquery.com/jquery-3.1.1.min.js": "sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="
};
const INTEGRITY_LEVEL = 0; // >9000 means require-sri-for. mo

const LOGNAME = "SRI-ServiceWorker";
self.addEventListener("install", function() {
    return self.skipWaiting();
});
self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
  let request = event.request;
  if ((request.method === "GET") &&
     (request.url in INTEGRITY_METADATA) &&
     (!request.integrity)) {
    // can fetch with SRI
    let sriHash = INTEGRITY_METADATA[request.url];
    let init = {
      integrity: sriHash,
      method: request.method,
      mode: "cors", // if we have integrity metadata, it should also use cors
      credentials: "omit", // ...and omit credentials
      cache: "default",
    };
    console.info(`[${LOGNAME}] Adding integrity metadata for fetch ${request.url}, (${sriHash})`);
    event.respondWith(fetch(request, init));
  } else if (INTEGRITY_LEVEL > 9000) {
    // INTEGRITY_LEVEL OVER 9000 means SRI strictly required.
    /* though if you want something like  that makes security guarantees about the
       integrity of *all* your scripts, then it should happen in the platform,
        not in JavaScript
    */
    console.error(`[${LOGNAME}] Can not fetch ${request.url}. No integrity metadata.`);
    event.respondWith(Response.error());
  } else {
    // else, fetch as is.
    console.warn(`[${LOGNAME}] Can not add integrity metadata to fetch ${request.url}`);
    event.respondWith(fetch(request));
  }
});
