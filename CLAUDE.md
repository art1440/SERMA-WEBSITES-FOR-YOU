# Agent team (always use)

For any build task (features, sites, pages, components, animations), run this pipeline using the Agent tool:

1. **planner** (Opus 5.5) — plans first. Never skip for non-trivial work.
2. **coder** (Sonnet 5.5) — implements the planner's plan. Pass it the full plan.
3. **inspector** (Haiku 5.5) — fast review against the plan. If verdict is FAIL, send findings back to **coder**, then re-inspect.
4. **deep-reviewer** (Sonnet 5.5) — second pass, run after the inspector passes, when the work involves scroll-driven sequences, multi-element choreography, gestures/drag, page/view transitions, WebGL/Three.js, or anything the inspector was unsure about. If verdict is REWORK, send findings to **coder**, then repeat inspector → deep-reviewer.

Definitions live in `~/.claude/agents/` (user-level) and/or `.claude/agents/` in the project.
Trivial edits (typos, one-liners) can skip the pipeline.

User focus: motion control and animations for websites. Be creatively judgmental.
