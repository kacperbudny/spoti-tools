# HTTP clients

Use [ky](https://github.com/sindresorhus/ky) instead of native `fetch` for app HTTP calls. Import the shared client from `@/lib/http/ky`.

Native `fetch` is fine when a library requires it directly or ky cannot support the use case (e.g. some framework internals).
