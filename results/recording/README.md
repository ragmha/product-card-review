# A recorded full run

`events.jsonl` is the session log of a full run, recorded on October 20, 2026
with version 1.0.101-0 of the CLI: four reviews, the pause, the copy fix in
[`9b46bf2`](https://github.com/ragmha/product-card-review/commit/9b46bf2c766e7287d602a0a27f94aa324a37ca5f),
then the resume and two translations. It ran on the original card and workflow
at [`a5c4fd9`](https://github.com/ragmha/product-card-review/tree/a5c4fd9),
before routes existed, so every step ran.

The findings differ from the [first recorded run](../README.md). This time the
reviewers returned 14 findings: design 6, product 4, accessibility 2 and
security 2. The design reviewer also found that the card's `overflow: hidden`
clips the link's focus outline.

## Open it

Load `events.jsonl` in [session-flame](https://lab.raghib.io/session-flame/).
The file stays in your browser. The chart shows the session, each reviewer and
translator, their model calls and tool calls, and folds the pause into a break.

## What was removed

The log is otherwise as the CLI wrote it. Before publishing I removed:

- the system prompt, replaced by its length;
- model reasoning, encrypted content and transformed prompts;
- the contents of skills loaded from my own setup, and hook inputs and outputs;
- the list of tools available on my machine;
- my home folder and email address. The working folder reads
  `/workspace/product-card-review`.
