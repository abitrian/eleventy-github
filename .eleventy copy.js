/**
 * @license
 * Copyright 2024 Cells
 */

const ENV = require('./environments.js').getEnvironment();

const { execSync } = require('child_process')
const CleanCSS = require('clean-css');
const crypto = require('crypto');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const fastGlob = require('fast-glob');
const fs = require('fs/promises');
const fsSync = require('fs');
const htmlMinifier = require('html-minifier');
const luxon = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const path = require('path');
const pluginTOC = require('eleventy-plugin-nesting-toc');
const slugifyLib = require('slugify');

// Use the same slugify as 11ty for markdownItAnchor. It's similar to Jekyll,
// and preserves the existing URL fragments
const slugify = (s) => slugifyLib(s, {lower: true});

const cspInlineScriptHashes = new Set();

/**
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * @returns {ReturnType<import("@11ty/eleventy/src/defaultConfig")>}
 */
module.exports = function (eleventyConfig) {
  // https://github.com/JordanShurmer/eleventy-plugin-toc#readme
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: 'div',
    wrapperClass: '',
  });
  
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy('site/css');
  eleventyConfig.addPassthroughCopy('site/js');
  eleventyConfig.addPassthroughCopy('site/fonts');
  eleventyConfig.addPassthroughCopy('site/images');

  // Placeholder shortcode for TODOs
  // Formatting is intentional: outdenting the HTML causes the
  // markdown processor to quote it.
  eleventyConfig.addPairedShortcode('todo', function (content) {
    console.warn(`TODO item in ${this.page.url}`);
    return `
      <div class="alert alert-todo">
        <h3>TO DO</h3>
        ${content}
      </div>
    `;
  });

  const linkAfterHeaderBase = markdownItAnchor.permalink.linkAfterHeader({
    style: 'visually-hidden',
    class: 'anchor',
    visuallyHiddenClass: 'offscreen',
    assistiveText: (title) => `Permalink to “${title}”`,
  });

  /**
   * The built-in linkAfterHeader permalink renderer is almost exactly what we
   * need for accessible permalinks, except it doesn't put a wrapper element
   * around the header + anchor link, so they won't appear on the same line.
   *
   * This function fixes up the base renderer to do so, based on the comment at
   * https://github.com/valeriangalliat/markdown-it-anchor/issues/100#issuecomment-906745405.
   */
  const linkAfterHeaderWithWrapper = (slug, opts, state, idx) => {
    const headingTag = state.tokens[idx].tag;
    if (!headingTag.match(/^h[123456]$/)) {
      throw new Error(`Expected token to be a h1-6: ${headingTag}`);
    }
    state.tokens.splice(
      idx,
      0,
      Object.assign(new state.Token('div_open', 'div', 1), {
        attrs: [['class', `heading ${headingTag}`]],
        block: true,
      })
    );
    state.tokens.splice(
      idx + 4,
      0,
      Object.assign(new state.Token('div_close', 'div', -1), {
        block: true,
      })
    );
    linkAfterHeaderBase(slug, opts, state, idx + 1);
  };

  const md = markdownIt({
    html: true,
    breaks: false, // 2 newlines for paragraph break instead of 1
    linkify: true,
  })
    .use(markdownItAttrs)
    .use(markdownItAnchor, {
      slugify,
      permalink: linkAfterHeaderWithWrapper,
      permalinkClass: 'anchor',
      permalinkSymbol: '#',
      level: [2, 3, 4],
    });
  eleventyConfig.setLibrary('md', md);

  /**
   * Sometimes we don't want automatically generated heading anchors, like blog
   * articles. But it's not possible to change markdown settings on a per-page
   * basis (!). This filter just removes the anchor elements after rendering
   * instead.
   */
  eleventyConfig.addFilter('removeHeadingAnchors', function (content) {
    return content.replace(/<a class="anchor".*<\/a>/g, '');
  });

  /**
   * For the latest versioned urls, this filter returns the unversioned url
   * which is used in the rel=canonical link.
   */
  eleventyConfig.addFilter(
    'removeLatestVersionFromUrl',
    function (url, latestVersion) {
      if (!latestVersion) {
        throw new Error(
          `No latestVersion provided to 'removeLatestVersionFromUrl`
        );
      }
      if (!url.includes(`/${latestVersion}/`)) {
        throw new Error(
          `'${url}' does not include the latestVersion versioned path segment`
        );
      }
      return url.replace(`/${latestVersion}/`, '/');
    }
  );

  // used for debugging and printing out data in the console
  eleventyConfig.addFilter('debug', function (value) {
    console.log(value);
    return value;
  });

  const sortDocs = (a, b) => {
    if (a.fileSlug == 'docs') {
      return -1;
    }
    if (a.fileSlug < b.fileSlug) {
      return -1;
    }
    if (b.fileSlug < a.fileSlug) {
      return 1;
    }
    return 0;
  };

  const documentByUrl = new Map();

  eleventyConfig.addCollection('docs', function (collection) {
    const docs = collection.getFilteredByGlob('site/docs/**').sort(sortDocs);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
    }
    return docs;
  });

  eleventyConfig.addTransform('htmlMinify', function (content, outputPath) {
    if (!outputPath.endsWith('.html')) {
      return content;
    }

    const minified = htmlMinifier.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });
    return minified;
  });

  /**
   * Flatten a navigation object into an array, and add "next" and "prev"
   * properties.
   *
   * See https://github.com/11ty/eleventy-navigation/issues/22
   */
  eleventyConfig.addFilter('flattenNavigationAndAddNextPrev', (nav) => {
    const flat = [];
    // TODO(aomarks) For an unknown reason, every page in the "Templates"
    // section is duplicated in the nav. Doesn't affect any other section. Just
    // de-dupe by URL for now.
    const seen = new Set();
    const visit = (items) => {
      for (const item of items) {
        if (seen.has(item.url)) {
          continue;
        }
        seen.add(item.url);
        flat.push(item);
        visit(item.children);
      }
    };
    visit(nav);
    for (let i = 0; i < flat.length; i++) {
      const item = flat[i];
      item.prev = flat[i - 1];
      item.next = flat[i + 1];
    }
    return flat;
  });

  /**
   * Gets the title given a document URL.
   */
  eleventyConfig.addFilter('documentUrlTitle', (url) => {
    return documentByUrl.get(url)?.data?.title;
  });

  /**
   * Render the given content as markdown, with HTML disabled.
   */
  eleventyConfig.addFilter('markdownWithoutHtml', (content) => {
    if (!content) {
      return '';
    }
    // We should be able to create two markdownit instances -- one that allows
    // HTML and one that doesn't -- but for some reason having two (even when
    // configured the same way!) disables syntax highlighting. Maybe there's a
    // bug in markdownit where there's some global state? Toggling HTML off and
    // on in here does work, though.
    const htmlBefore = md.options.html;
    md.set({html: false});
    const result = md.render(content);
    md.set({html: htmlBefore});
    return result;
  });

  /**
   * Render the `typeof` of the given value.
   */
  eleventyConfig.addFilter('typeof', (value) => typeof value);

  /**
   * Return whether the given table-of-contents HTML includes at least one <a>
   * tag. It always renders a surrounding <nav> element, even when there are no
   * items.
   */
  eleventyConfig.addFilter('tocHasEntries', (html) => {
    return html.includes('<a');
  });

  /**
   * Bundle, minify, and inline a CSS file. Path is relative to ./site/css/.
   *
   * In dev mode, instead import the CSS file directly.
   */
  eleventyConfig.addShortcode('inlinecss', (path) => {
    return `<link rel="stylesheet" href="/css/${path}">`;
    // const result = new CleanCSS({inline: ['local']}).minify([
    //   `./site/css/${path}`,
    // ]);

    // if (result.errors.length > 0 || result.warnings.length > 0) {
    //   throw new Error(
    //     `CleanCSS errors/warnings on file ${path}:\n\n${[
    //       ...result.errors,
    //       ...result.warnings,
    //     ].join('\n')}`
    //   );
    // }
    // return `<style>${result.styles}</style>`;
  });

  /**
   * Inline the Rollup-bundled version of a JavaScript module. Path is relative
   * to ./rollupout.
   *
   * In dev mode, instead directly import the module, which has already been
   * symlinked directly to the TypeScript output directory.
   */
  eleventyConfig.addShortcode('inlinejs', (path) => {
    return `<script type="module" src="/js/${path}"></script>`;
    
    // Note we must trim before hashing, because our html-minifier will trim
    // inline script trailing newlines, and otherwise our hash will be wrong.
    // const script = fsSync.readFileSync(`rollupout/${path}`, 'utf8').trim();
    // const hash =
    //   'sha256-' + crypto.createHash('sha256').update(script).digest('base64');
    // cspInlineScriptHashes.add(hash);
    // return `<script type="module">${script}</script>`;
  });

  // Source: https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'LLL d, yyyy'
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('yyyymmdd', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'yyyy-LL-dd'
    );
  });

  eleventyConfig.on('eleventy.before', () => {
    cspInlineScriptHashes.clear();
  });

  eleventyConfig.on('eleventy.after', async () => {
    // The eleventyNavigation plugin requires that each section heading in our
    // docs has its own actual markdown file. But we don't actually use these
    // for content, they only exist to generate sections. Delete the HTML files
    // generated from them so that users can't somehow navigate to some
    // "index.html" and see a weird empty page.
    const emptyDocsIndexFiles = (
      await fastGlob(
        [
          ENV.eleventyOutDir + '/docs/introduction.html',
          ENV.eleventyOutDir + '/docs/*/index.html',
        ]
      )
    ).filter(
      // TODO(aomarks) This is brittle, we need a way to annotate inside an md
      // file that a page shouldn't be generated.
      (file) =>
        !file.includes('getting-started') &&
        !file.includes('browser-support')
    );

    await Promise.all(emptyDocsIndexFiles.map((path) => fs.unlink(path)));

    // Pagefind 
    execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
  });

  /**
   * An aside for extra information.
   *
   * Usage:
   *
   *   {% aside "positive" %}
   *
   *   Here is some content! This line is bolded.
   *
   *   This line is not bolded but on the same line as the previous one.
   *
   *   This line is another paragraph
   *
   *   {% endaside %}
   *
   *   {% aside "info" "no-header" %}
   *
   *   This one does not have a bolded header.
   *
   *   {% endaside %}
   */
  eleventyConfig.addPairedShortcode(
    'aside',
    (content, variant, noHeader = '') => {
      const acceptableVariants = [
        'info',
        'warn',
        'positive',
        'negative',
        'labs',
      ];

      // If statement needs to be written this way to assert exhaustive check.
      if (
        acceptableVariants[0] !== variant &&
        acceptableVariants[1] !== variant &&
        acceptableVariants[2] !== variant &&
        acceptableVariants[3] !== variant &&
        acceptableVariants[4] !== variant
      ) {
        // This will throw an error at runtime if it does not match and will
        // throw a TS build time error if we add another variant and forget to
        // update this file.
        neverReach(
          variant,
          `Invalid {% aside ${variant} %}.` +
            ` variant "${variant}" is not an acceptable variant of:` +
            ` ${acceptableVariants.join(', ')}.`
        );
      }

      const noHeaderAttribute = noHeader === 'no-header' ? ' no-header' : '';

      // Matches the first line's leading whitespace and applies it to the other
      // HTML nodes to preserve the same indentation.
      const contentIndent = (content.match(/^\s*/) ?? [''])[0];

      // htmlmin:ignore will prevent minifier from formatting the contents.
      // otherwise, in the prod build, there will not be a space between the
      // bolded header and the second line.
      return (
        `${contentIndent}<litdev-aside type="${variant}"${noHeaderAttribute}>` +
        `\n${contentIndent}<!-- htmlmin:ignore -->\n\n` +
        content +
        `\n\n${contentIndent}<!-- htmlmin:ignore -->` +
        `\n${contentIndent}</litdev-aside>`
      );
    }
  );

  return {
    dir: {
      input: 'site', 
      output: ENV.eleventyOutDir
    },
    htmlTemplateEngine: 'njk',
    // TODO: Switch markdown to Nunjucks
    // markdownTemplateEngine: 'njk',
  };
};

const unlinkIfExists = async (path) => {
  try {
    await fs.unlink(path);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
};

const symlinkForce = async (target, path) => {
  await unlinkIfExists(path);
  await fs.symlink(target, path);
};
