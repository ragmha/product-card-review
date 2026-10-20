# One recorded run

I ran the workflow once and kept what it returned. This page records that run.
Another run, model or setup will find different things.

| | |
| --- | --- |
| Date | 2026-10-20 |
| Commit reviewed | `a5c4fd903b36d1614e89d728a1d8be9097d47728` |
| Copy fix made during the pause | `9b46bf2c766e7287d602a0a27f94aa324a37ca5f` |
| Run ID | `e22694b5-1d47-4ede-bfc0-8428f507b651` |
| Arguments | `{"locales":["de","ar"]}` |
| CLI | GitHub Copilot CLI 1.0.101-0, with `--experimental` |
| Model | gpt-6.1-sol for all six agents; the workflow doesn't pick one |
| Active time | 91.9 seconds, not counting the pause |
| Workflow cost | 27.55 AI credits |

[`run.json`](run.json) is the result exactly as the workflow returned it.

## Planted issues

I wrote the card with ten deliberate issues, two for each lens. This list
stayed outside the repository until the run finished, so no agent could read
it.

| # | Planted issue | Caught by |
| --- | --- | --- |
| D1 | The button color is hard-coded as `#2563eb` instead of `var(--color-action)`. | design |
| D2 | `padding: 13px` is off the 4, 8, 12, 16 and 24 scale. | design |
| P1 | Add to cart stays enabled when stock is 0. | product |
| P2 | A product on sale never shows its original price. | product |
| A1 | The product image has no `alt` attribute. | accessibility, product |
| A2 | The wishlist control is a `span`: no role, no name, no keyboard access. | accessibility, design, product |
| S1 | The merchant description is inserted as raw HTML. | security, product |
| S2 | The product URL's scheme is never checked, so `javascript:` links get through. | security |
| T1 | "Only N left" is built from two fragments. | product |
| T2 | The price is `"$" + toFixed(2)`, whatever the currency. | product, both translators |

All ten were caught. The product reviewer caught T1 and T2 during the review,
before the translators ran.

The four reviewers returned 15 findings. Four are duplicates: three reviewers
reported the wishlist control, and two each reported the raw description and
the missing `alt`.

## Findings that were not planted

- **Design, low:** the wishlist control is 1.125rem and the button text is
  weight 600, but `DESIGN.md` says everything except the name and price is
  1rem regular. True. I made that mistake by accident.
- **Product, medium:** the demo page's add and wishlist handlers only log to
  the console. True of `index.html`, but that is demo wiring, not the card.
- **Product, in the same finding as T1 and T2:** nothing picks a locale or sets
  the text direction. The Arabic translator said the same. True.
- **German translator:** long German compounds can be clipped, because the
  card is 320px wide with `overflow: hidden` and no `overflow-wrap`.
  Plausible: the CSS matches.
- **Both translators:** product names and descriptions come straight from the
  data, so translating the messages leaves them in English.

## The pause

The run stopped at `approve-copy` after the four reviews. I fixed T1 there, in
`9b46bf2`: one `onlyLeft` message, "Only {count} left", replaces the
fragments. Then I resumed the run.

On resume the workflow code runs again from the top, but agents that already
finished are not called again: their saved results come back instead. So the
four reviews still describe `a5c4fd9`, while the two translators read the
fixed copy.

The Arabic translator then found what my fix missed. The count is inserted
without being localized, and wording that counts a noun needs Arabic plural
rules. Its translation, «الكمية المتبقية: {count} فقط» ("remaining quantity:
{count} only"), counts no noun.

## Cost

| Step | AI credits |
| --- | --- |
| Review: four agents | 16.99 |
| Translate: two agents | 10.56 |
| **Workflow total** | **27.55** |
| Two prompt-mode resume turns, outside the workflow | 15.43 |

I resumed from a script. The first attempt failed with "No workflow registered
with stored name" because I hadn't set `GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS`.
Each attempt was an ordinary agent turn, billed on top of the workflow. Each
cost about 7.7 credits, because my CLI loads about 141,000 tokens of tool
definitions from the MCP servers I have installed. Yours will differ.

## Commands

The run, from the repository root:

```sh
copilot --experimental workflow run product-card-review \
  --args '{"locales":["de","ar"]}' --output-format json
```

It printed the run ID and the checkpoint name, then exited with status 1. The
resume, after committing the fix:

```sh
GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true copilot --experimental \
  --resume c45b98ef-7e6a-415c-ba0f-99ffda3794ce --allow-tool=workflow \
  -p "Call run_dynamic_workflow with resumeFromRunId e22694b5-1d47-4ede-bfc0-8428f507b651. Do nothing else. Then report its final status." \
  --output-format json
```
