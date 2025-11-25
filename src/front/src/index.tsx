import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for every route; real API will be added later.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
