# al-folio v1 migration

Goal: migrate the approved personal site to upstream main f2a2765c8a9413f6ec703fc02070fbe6becf1572 (v1.2 plugin pins), preserving personal content and testing locally before publication.

## Runtime and configuration

- Use upstream Gemfile/lockfile, plugin activation and v1 Tailwind contract. Replace copied legacy runtime with gem-owned files.
- Preserve identity, URLs, social links, scholar configuration, all publications/news, profile, downloadable PDFs, projects/posts and blue/cyan colors.
- Keep only intentional modern about-layout and theme overrides; record gem checksums with override audit.
- Convert legacy CV data to a supported schema without dropping text; retain the existing CV PDF.

## Validation

- Capture original site content in site-specific checks; establish missing site/publication search as failing behavior before migration.
- Build production HTML; test home, publications, CV, projects/posts and news links on localhost.
- Check site search, publication filtering, mobile navigation, theme switching and horizontal overflow.
- Run upgrade audit and override audit; ensure no blocking migration findings, missing assets, or demo identity.

## Publication

- Open the localhost preview after validation. The user requested migration and upload after localhost testing.
- Commit only migration changes with Seonjin Na identity/sign-off and no Co-authored-by. Publish the validated migration to the SeonjinNa repository.

## Migration decisions

- Bootstrap compatibility is disabled: its global collapse visibility rule hides desktop navigation. The core supports the retained legacy grid and native data-toggle table examples without that layer. Browser tests caught the conflict before release.
- CV award date ranges use en dashes so the RenderCV renderer preserves both endpoints without a template override.

## Validation results

- Production build and the deployment CSS purge completed successfully.
- Seven browser checks passed: content/news preservation, report credits/PDFs, publication filtering, keyboard site search, CV contents/date ranges, mobile navigation, and theme persistence.
- All 87 original CV values are present in rendered HTML. Bibliography, news, posts, and projects source content are unchanged.
- Primary routes and local scripts/styles/images exist; browser checks reported no page errors or missing local assets.
- Upgrade audit: zero blocking findings; four non-blocking legacy table markers remain in the original example post. Both intentional gem overrides are acknowledged and current.
