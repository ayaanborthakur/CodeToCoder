/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) {
      return;
    } else if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach((client) => client.navigate(client.url));
      });
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
      return;
    }

    const request = (coepCredentialless && r.mode === "no-cors" && r.credentials === "omit")
      ? new Request(r, {
        credentials: "same-origin",
      })
      : r;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy",
            coepCredentialless ? "credentialless" : "require-corp"
          );
          if (!newHeaders.get("Cross-Origin-Opener-Policy")) {
              newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
          }

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    // You can customize the behavior of this script through a global `coi` variable.
    const coi = {
      shouldRegister: () => true,
      shouldDeregister: () => false,
      coepCredentialless: () => true,
      doReload: () => window.location.hostname.includes("localhost"),
      quiet: false,
      ...window.coi
    };

    const n = navigator;
    if (coi.shouldDeregister() && n.serviceWorker && n.serviceWorker.controller) {
      n.serviceWorker.controller.postMessage({ type: "deregister" });
    }

    // If we're already coi: do nothing. Perhaps it's due to this script doubling up.
    if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

    if (!n.serviceWorker) {
      return;
    }

    n.serviceWorker.register(window.document.currentScript.src).then(
      (registration) => {
        if (!coi.quiet) console.log("coi-serviceworker registered");

        registration.installing?.postMessage({
            type: "coepCredentialless",
            value: coi.coepCredentialless(),
        });

        if (coi.doReload()) {
          window.location.reload();
        }
      },
      (err) => {
        if (!coi.quiet) console.error("coi-serviceworker failed to register", err);
      }
    );
  })();
}
