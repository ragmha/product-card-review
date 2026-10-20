# Product card review

A small product card, and a GitHub Copilot dynamic workflow that reviews it
before it ships.

The card is plain HTML, CSS and JavaScript with no build step. `BRIEF.md` says
what the card must do and `DESIGN.md` says how it must look. The workflow in
`.github/extensions/product-card-review/` runs four reviews in parallel
(design, product, accessibility and security), pauses so a person can approve
the copy, and then translates the card's messages.

## See the card

Serve the folder with any static server and open it in a browser:

```sh
python3 -m http.server 4177
```

Then visit <http://127.0.0.1:4177/>.

## Run the workflow

Dynamic workflows are experimental. You need the GitHub Copilot CLI, and this
folder must be trusted.

```sh
copilot --experimental workflow run product-card-review --args '{"locales":["de","ar"]}'
```

## Test

```sh
npm test
```

## License

[MIT](LICENSE)
