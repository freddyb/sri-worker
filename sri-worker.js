// Define your subresources here
const INTEGRITY_METADATA = {
  // This could also live in its own, separate file,
  // but should preferrably be inlined for performance.
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js": "sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa",
  "https://html5sec.org/test.js": "sha384-moo",
  "http://code.jquery.com/jquery-3.1.1.min.js": "sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="
};

// Do you want to abort fetches that do not come with integrity?
const INTEGRITY_MANDATORY = false;
/* Enabling this will likely cause some breakage on your site,
 * because CSS @import, url() etc. do not allow specifying integrity
 * NB: If you want something  that makes security guarantees about the
 * integrity of *all* your scripts, then it should happen in the platform,
 * not in JavaScript. Look into the reqiure-sri-for CSP directive.
*/

const LOGNAME = "SRI-ServiceWorker";
self.addEventListener("install", function() {
    return self.skipWaiting();
});
self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
  let request = event.request;
  if (request.method === "GET") {
    if (request.url in INTEGRITY_METADATA) {
      let sriHash = request.integrity || INTEGRITY_METADATA[request.url];
      let fetchOptions = {
        integrity: sriHash,
        method: request.method,
        mode: "cors", // if we have integrity metadata, it should also use cors
        credentials: "omit", // ...and omit credentials
        cache: "default",
      };
      //console.info(`[${LOGNAME}] Adding integrity metadata for fetch ${request.url}, (${sriHash})`);
      event.respondWith(fetch(request, fetchOptions));
    } else { // no integrity metedata declared for Service Worker
      if (request.integrity) {
        // but declared somewhere else
        event.respondWith(fetch(request, { integrity: request.integrity}));
      } else {
        // no integrity data available for this request
        if (INTEGRITY_MANDATORY) {
          console.error(`[${LOGNAME}] Can not fetch ${request.url}. No integrity metadata.`);
          event.respondWith(Response.error());
        } else {
          // free pass
          console.warn(`[${LOGNAME}] Could not add integrity metadata to fetch ${request.url}, will continue without`);
          event.respondWith(fetch(request));
        }
      }
    }
  }
});
