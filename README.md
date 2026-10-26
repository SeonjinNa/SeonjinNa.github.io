# Seonjin Na

Personal academic website at [seonjinna.github.io](https://seonjinna.github.io/), built with Jekyll and al-folio v1.

The migration uses upstream starter commit `f2a2765c8a9413f6ec703fc02070fbe6becf1572` and its v1.2 plugin pins. `Gemfile.lock` records the resolved dependencies.

## Local preview

```bash
bundle install
npm ci
JEKYLL_ENV=production bundle exec jekyll build
python3 -m http.server 4001 --bind 127.0.0.1 --directory _site
```

Open <http://localhost:4001/>. The browser checks use installed Google Chrome locally; CI installs Chromium.

```bash
npm test
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade overrides audit --fail-on-stale
```

`npm test` starts a local server when port 4001 is free, or reuses the preview server. Set `SITE_URL` to check another running preview.

On Homebrew Python installations, if nbconvert cannot find its templates, build with `JUPYTER_PATH="$(brew --prefix)/share/jupyter"` in the environment.

## Personal content

- `_pages/about.md`: biography and profile settings.
- `_data/work_experiences.yml`: homepage work history.
- `_includes/academic_services.liquid`: homepage academic service history.
- `_bibliography/papers.bib`: publications and technical reports.
- `_news/`: dated announcements.
- `_data/cv.yml`: CV sections in RenderCV-compatible YAML. The existing downloadable CV remains in `assets/pdf/Seonjin_CV.pdf`.
- `_data/socials.yml`: contact and profile links.

The local about layout adds Work Experiences and Academic Services to the current gem layout. The Sass entrypoint adds `_sass/_site.scss` for the blue/cyan palette and work history layout. `.al-folio-overrides.yml` records the upstream files reviewed for these overrides.

## Theme updates and deployment

Update plugin pins in `Gemfile`, run `bundle install`, review the upgrade and override audits, then rebuild and run the browser checks. The runtime, shared layouts, styles, and scripts are provided by versioned gems instead of copied legacy theme files.

Pushes to `source` run the production build, migration audits, and browser checks before deploying to `gh-pages`. Keep `url: https://seonjinna.github.io` and an empty `baseurl` for this personal GitHub Pages site.
