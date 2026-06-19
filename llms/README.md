# /llms — Per-component LLM context

This directory contains per-component context files for LLM assistants. Each file is a structured Markdown document covering:

- When to use the component (and when not to)
- Variants and their use cases
- Accessibility considerations
- Example usage
- Where the canonical source file lives

These files complement (don't replace) the top-level `llms.txt` and `PRIZM.md`. Read those first.

## Naming

Each file is named `<slug>.md`, matching the component slug in `lib/components-registry.ts`.

## When to write a new one

Every stable component should have a corresponding LLM context file. Alpha and planned components don't need them yet.
