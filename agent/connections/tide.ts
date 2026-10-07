import { defineMcpClientConnection } from "eve/connections";

// Tools Tide annotates readOnlyHint: true. eve does not hand MCP annotations
// to approval policies, so they are listed here. Anything not on this list —
// including tools Tide adds later — pauses for human approval.
const READ_ONLY = new Set([
  "tide_get_status",
  "tide_list_strategies",
  "tide_list_signals",
  "tide_get_signal",
  "tide_export_signals",
  "tide_list_decisions",
  "tide_get_decision",
  "tide_list_versions",
  "tide_list_scans",
  "tide_get_performance",
  "tide_list_research",
  "tide_list_params",
  "tide_get_params",
  "tide_get_paper_work",
  "tide_check_paper_signal",
]);

export default defineMcpClientConnection({
  url: "https://api.tide.chest.chat/mcp",
  description:
    "Tide trading-signal ledger: strategies, recent and open signals, scans, " +
    "per-bar strategy decisions, settings versions, research runs, paper " +
    "signals, and R-based performance. Use it for anything about trading " +
    "signals, setups, strategy results, or how Tide's strategies are doing. " +
    "It is not an exchange account: no balances, positions, or live quotes.",
  auth: {
    getToken: async () => {
      const token = process.env.TIDE_MCP_KEY;
      if (!token) throw new Error("TIDE_MCP_KEY is not set.");
      return { token };
    },
  },
  // Access administration stays out of the agent's reach entirely.
  tools: { block: ["tide_list_users", "tide_add_user", "tide_dismiss_access_request"] },
  approval: ({ toolName }) => {
    // eve qualifies remote tools as <connection>__<tool>; recover the bare name.
    const sep = toolName.indexOf("__");
    const bare = sep === -1 ? toolName : toolName.slice(sep + 2);
    return READ_ONLY.has(bare) ? "not-applicable" : "user-approval";
  },
});
