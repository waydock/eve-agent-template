import { defineMcpClientConnection } from "eve/connections";

// Tool-name fragments that mutate state or reach other people. Calls matching
// these need explicit user approval; read tools flow freely.
const GATED_FRAGMENTS = [
  "send",
  "nudge",
  "create",
  "promote",
  "save",
  "set_rule",
  "set_toggle",
  "remove",
  "delete",
];

// Waydock's MCP server. The model never sees the URL or token; it discovers
// tools via connection_search and calls them as waydock__<tool>.
// Required env: WAYDOCK_MCP_URL, WAYDOCK_API_KEY.
export default defineMcpClientConnection({
  url: process.env.WAYDOCK_MCP_URL ?? "https://waydock.ai/api/mcp/stream",
  description:
    "Waydock: the user's inbox, calendar, meetings, briefings, follow-ups, tasks, and projects.",
  auth: {
    getToken: async () => {
      const token = process.env.WAYDOCK_API_KEY;
      if (!token) {
        throw new Error("WAYDOCK_API_KEY is not set");
      }
      return { token };
    },
  },
  approval: ({ toolName }) =>
    GATED_FRAGMENTS.some((fragment) => toolName.includes(fragment))
      ? "user-approval"
      : "not-applicable",
});
