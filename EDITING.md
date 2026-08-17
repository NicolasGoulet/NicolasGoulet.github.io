# Editing the site

This site separates content, page structure, and visual settings so each can be
changed without rewriting the others.

## Show or hide header tabs

Edit `_data/navigation.yml`. A navigation item with `visible: false` stays out
of the header while its page and URL continue to exist. Delete that setting or
change it to `visible: true` to show the tab again. English links are under
`main`; French links are under `main_fr`.

## Change the overall design

Start with `_sass/_custom-settings.scss`. It contains the current values for:

- the light and dark color palettes;
- serif and sans-serif typefaces;
- maximum page and text widths;
- desktop and mobile page spacing;
- header controls;
- blog card and article proportions; and
- mobile breakpoints.

Changing a value there updates every rule that uses it. The current values
reproduce the existing design.

For detailed component styling, edit `_sass/_custom.scss`. Its section headings
identify the affected area:

- `BOOKS` controls book lists;
- `BLOG` controls Academic Interests hubs, blog hubs, series, and articles;
- `SITE: editorial presentation` controls the shared palette, header, page
  frame, typography, home page, and mobile behavior.

The import order is defined at the bottom of `assets/css/main.scss`. Keep
`custom-settings` immediately before `custom` so the settings are available to
the detailed rules.

## Change page structure or content

| Area | Content | Structure |
| --- | --- | --- |
| English home | `_pages/about.md` | `_layouts/single.html` |
| French home | `french/index.md` | `_layouts/single.html` |
| Academic Interests hub | `_pages/interests.md` | `_layouts/section-hub.html` |
| French academic hub | `french/academic-interests.md` | `_layouts/section-hub.html` |
| Academic period pages | `_pages/academic-interests-*.md` and `french/academic-interests-*.md` | `_layouts/interest-period.html` |
| Blog hub | `_pages/blog.html` and `french/blog.md` | `_layouts/section-hub.html` |
| Blog series | `_pages/blog-*.md` and `french/blog-*.md` | `_layouts/blog-index.html` |
| Blog articles | `_posts/*.md` | `_layouts/blog-post.html` |
| Hidden Books pages | `_pages/books.md` and `french/books.md` | `_layouts/single.html` |
| Hidden Music pages | `_pages/music.md` and `french/music.md` | `_layouts/single.html` |

The home-page markup now uses the classes `home-profile`,
`home-profile__title`, and `home-profile__image`; its appearance can therefore
be changed in `_sass/_custom.scss` without editing inline styles in two
languages.

Every page also receives a body class based on its layout, such as
`layout--section-hub`, `layout--blog-index`, or `layout--single`. To give one
page its own styling hook, add a class name to its front matter:

```yaml
body_class: page--my-page
```

You can then write a narrowly scoped rule such as
`.page--my-page .page__content { ... }` without affecting other pages.

## Preview

The project uses the pinned Ruby version in `.ruby-version`, the exact gem
versions in `Gemfile.lock`, and a local toolchain stored under the ignored
`.tools/` and `vendor/` directories.

Before pushing, run the complete production build and navigation verification:

```sh
scripts/site check
```

For a live local preview, run:

```sh
scripts/site serve
```

Then open `http://localhost:4000`. To reinstall gems from the lockfile, run
`scripts/site install`. Changes to `_config.yml` require restarting the server;
content and style changes normally rebuild automatically.
