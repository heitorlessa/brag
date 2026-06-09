/**
 * Expose the Brag ingestion API on `window.brag` so browser-driving agents,
 * the devtools console, or a WebMCP client can add data programmatically.
 *
 * This is intentionally always-on: it's the only way for automation to reach
 * the in-browser OPFS database (there is no server). The data is the user's own
 * and local, so there's no secret to protect.
 */
import { type AgentApi, agentApi } from "~/services/ingest";

declare global {
  interface Window {
    brag?: AgentApi;
  }
}

export default defineNuxtPlugin(() => {
  if (typeof window !== "undefined") {
    window.brag = agentApi;
  }
});
