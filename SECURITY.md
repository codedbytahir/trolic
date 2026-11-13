# Security considerations

Trolic is experimental. Its source/value/expansion budgets are safeguards, not an isolation boundary. Do not expose untrusted compilation or rendering in a privileged process. Use isolated workers, explicit input/time/memory limits and authenticated host APIs where appropriate.

AgentSession is process-local and has no authentication, persistence or tenant separation. Revision checking prevents stale edits inside a session; it is not access control.

Never put access tokens, API keys, `.env` files or private project data in source, examples, issue reports or the public website. Revoke credentials exposed in chat or logs. The publication credential is not part of this repository.

For a potentially exploitable issue, contact the repository maintainer privately before posting operational details publicly. Use GitHub private vulnerability reporting if it is enabled. No response-time or security-certification guarantee is implied.
