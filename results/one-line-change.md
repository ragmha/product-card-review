# A one-line change

After the [first run](README.md), I fixed D2 in one line of CSS and ran the
workflow again with `changed` set to that file. This page records that run.

| | |
| --- | --- |
| Date | 2026-10-20 |
| Commit reviewed | `5e9121c5dedab9055d8efb9e8137d8f54ab7e662` |
| Change | `padding: 13px` became `padding: var(--space-3)` in `product-card.css` |
| Run ID | `caef1dcb-c86f-4d87-bac4-b24118dc6f4e` |
| Arguments | `{"locales":["de","ar"],"changed":["product-card.css"]}` |
| CLI | GitHub Copilot CLI 1.0.101-0, with `--experimental` |
| Model | gpt-6.1-sol for both agents; the workflow doesn't pick one |
| Active time | 42.4 seconds |
| Workflow cost | 10.71 AI credits |

[`one-line-change.json`](one-line-change.json) is the result exactly as the
workflow returned it.

| | First run | This run |
| --- | --- | --- |
| Agents | 6 | 2 |
| Pause for a person | yes | no |
| Active time | 91.9 s | 42.4 s |
| AI credits | 27.55 | 10.71 |

## What ran

The routes sent the CSS file to design and accessibility. Product, security,
the pause and both translators did not run, and the run finished with status 0.

## What it found

Six findings: four from design and two from accessibility.

- D2 is not reported. The fix held.
- D1, the hard-coded `#2563eb`, is reported again. It is in the same file.
- A1 and A2 are reported again, although both live in `product-card.js`. The
  reviewers were told to focus on the CSS and read the rest for context. They
  read the whole card and reported what they found. The focus sentence narrows
  attention; it doesn't fence it.
- The design reviewer repeated the first run's typography finding.
- **New, design, medium:** `.product-card` has `overflow: hidden`, and the link
  sits flush with the card's top and sides, so its 2px focus outline at a 2px
  offset is clipped. True. The first run did not report it.

## What the routes skipped

Nothing in this change touched behavior, data or copy, so skipping product,
security and translation was right this time. That is a judgment written into
`routes`, not a guarantee: a CSS change that hid the stock label would still
run only design and accessibility. A file that matches no route gets every
step.

## Command

From the repository root, with `changed` filled from
`git diff --name-only HEAD~1`:

```sh
GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true copilot --experimental \
  workflow run product-card-review \
  --args '{"locales":["de","ar"],"changed":["product-card.css"]}' \
  --output-format json
```
