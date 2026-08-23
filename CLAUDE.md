@AGENTS.md

# Claude-Specific Notes

This project follows the Claude Code Collaboration Prompt for Murathathorn Clinic: Claude Code is the main
developer/implementation agent, ChatGPT is the product architect/reviewer, and this repository is the shared
source of truth. Everything in `AGENTS.md` applies to Claude Code directly.

Additional Claude-specific working notes:

- Implement, don't just describe. If asked to build a feature, produce working code, not a plan-only response.
- Run the verification loop in `AGENTS.md` before saying a task is complete.
- Update `docs/AI_HANDOFF.md` at the end of every meaningful task — that file is written for an agent with zero
  prior context, so be concrete about file paths and current status.
- No live Supabase project is connected yet. Anything that needs a real database call should be built against
  the abstractions in `src/lib/supabase` so it works the moment `.env.local` is filled in — see
  `docs/AI_HANDOFF.md` for the exact setup steps.
