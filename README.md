# Product card review

A small product card, and a GitHub Copilot dynamic workflow that reviews it
before it ships.

The card was written with ten deliberate issues, so the reviews have something
to find; one, the off-scale padding, has since been fixed. Don't copy it into a
real product. [`results/`](results/) lists the issues and what two recorded
runs found.

- `product-card.js`, `product-card.css` and `index.html` are the card: plain
  HTML, CSS and JavaScript with no build step.
- `BRIEF.md` says what the card must do, and `DESIGN.md` says how it must look.
- `.github/extensions/product-card-review/workflow.mjs` is the workflow. It
  runs four reviews in parallel (design, product, accessibility and security),
  pauses so a person can approve the copy, then translates the card's messages.

## See the card

Serve the folder with any static server and open it in a browser:

```sh
python3 -m http.server 4177
```

Then visit <http://127.0.0.1:4177/>.

## Run the workflow

You need the GitHub Copilot CLI with dynamic workflows, which are in public
preview. Run this from the repository root:

```sh
GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true copilot --experimental \
  --name card-review \
  workflow run product-card-review --args '{"locales":["de","ar"]}'
```

`GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true` lets the command load this
repository's workflow even if you haven't trusted the folder in the CLI. That
runs code from this repository, so read it first. `--name` names the session,
so you can resume it by name.

The agents only read files in this folder, which needed no permission in my
run. The command can't show permission prompts, so if your setup asks before
reads, add `--allow-tool=read`.

The run pauses at `approve-copy`, prints its run ID and exits with status 1.

### Review only what changed

Pass `changed`, the files a change touched, and the workflow runs only the
steps those files need. `routes` in `workflow.mjs` maps them: CSS gets design
and accessibility, `messages/` gets translation, and `data/` gets product and
security. Any other file gets every step. The reviewers focus on the changed
files and read the rest for context. Translation, and the pause before it,
runs only when a route asks for it.

```sh
GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true copilot --experimental \
  workflow run product-card-review \
  --args '{"locales":["de","ar"],"changed":["product-card.css"]}'
```

In CI, fill `changed` from `git diff --name-only`.
[`results/one-line-change.md`](results/one-line-change.md) records a run on a
one-line CSS change.
[`results/recording/`](results/recording/README.md) has the session log of a
recorded full run, to open in [session-flame](https://lab.raghib.io/session-flame/).

## Resume

Change what you want, then resume the run in the same session. On resume the
workflow runs from the top, but finished reviews return their saved results
instead of running again. The translators start fresh and read your changes.

The docs resume interactively: open the session with
`copilot --experimental --resume card-review`, enter `/workflows`, select the
run and press R.

From a script, resume it with a prompt. That is how I resumed the recorded
run; [`results/`](results/README.md#commands) has the exact command.

```sh
GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true copilot --experimental \
  --resume card-review --allow-tool=workflow \
  -p "Call run_dynamic_workflow with resumeFromRunId <run-id>. Do nothing else."
```

Without `GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS=true`, this fails with "No
workflow registered", even in a trusted folder. The prompt is an ordinary agent
turn, so it costs credits on top of the workflow.

## Test

```sh
npm test
```

## License

[MIT](LICENSE)
