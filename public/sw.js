const cache_name = "pwa";

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches
            .open(cache_name)
            .then((cache) => cache.addAll(["/"]))
            .then(() => self.skipWaiting())
    );
});
self.addEventListener("activate", async () => {
    const keys = await caches.keys();
    for (let k of keys) {
        if (k !== cache_name) {
            await caches.delete(k);
        }
    }
    await self.clients.claim();
});

self.addEventListener("fetch", async (e) => {
    async function getResponse() {
        try {
            if (navigator.onLine) {
                let cache = await caches.open(cache_name);
                let response = await fetch(e.request);
                if (response.ok) await cache.put(e.request, response.clone());
                return response;
            } else {
                return await caches.match(e.request);
            }
        } catch (error) {
            let res = await caches.match(e.request);
            if (!res) return caches.match("/");
            return res;
        }
    }
    e.respondWith(getResponse());
});
