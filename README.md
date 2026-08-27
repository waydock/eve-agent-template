# waydock-eve-agent

A chief-of-staff [eve](https://eve.dev) agent backed by [Waydock](https://waydock.ai): ask about
your day, inbox, meetings, follow-ups, and tasks, and let the agent act on them
with your approval.

Waydock is wired in as an [MCP connection](https://eve.dev/docs/connections)
(`agent/connections/waydock.ts`). The model discovers Waydock tools at runtime
via `connection_search` and calls them as `waydock__<tool>`. Read tools flow
freely; anything that sends, creates, or mutates (emails, nudges, tasks,
preference changes) pauses for human approval via a per-call policy.

## Setup

1. Install dependencies and link a Vercel project for AI Gateway credentials:

   ```bash
   npm install
   npx eve link
   ```

2. Configure the Waydock connection in `.env.local` (and in Vercel env for
   production):

   ```bash
   WAYDOCK_MCP_URL=...   # your Waydock MCP endpoint
   WAYDOCK_API_KEY=...   # sent as Authorization: Bearer <token>
   ```

3. Run it:

   ```bash
   npm run dev
   ```

   Try: "what does my day look like?", "anything urgent in my inbox?",
   "nudge the pending follow-ups" (this one will ask for approval).

## Structure

| Path | Purpose |
| --- | --- |
| `agent/agent.ts` | Model config (`anthropic/claude-sonnet-5` via AI Gateway) |
| `agent/instructions.md` | Identity and behavior |
| `agent/connections/waydock.ts` | Waydock MCP connection, auth, and approval policy |
| `agent/channels/eve.ts` | Default HTTP channel and route auth |

## Deploy

```bash
npx eve deploy
```

Set `WAYDOCK_MCP_URL` and `WAYDOCK_API_KEY` on the Vercel project first. Before
real use, replace `placeholderAuth()` in `agent/channels/eve.ts` with your auth
provider — see [Authentication](https://eve.dev/docs/guides/auth-and-route-protection).
