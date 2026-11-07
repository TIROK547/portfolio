# Search and AI discovery

The site uses the public `SITE_URL` origin for canonical URLs, social cards,
structured data, RSS, sitemap, and the optional `/llms.txt` navigation index.
Set it to the production HTTPS origin before building/running the deployment.
Keep profile, skills, project summaries, and article excerpts accurate in the editor.

## Implemented

- Unique page descriptions, an unduplicated home title, and project-specific Open
  Graph/Twitter cards. Blog posts use their generated article image.
- Self-canonical pagination; filtered blog/project URLs use `noindex, follow` so
  internal search variations do not compete with primary pages. Empty later blog
  pages return not-found. Tracking parameters do not enter canonical URLs.
- Stable Person and WebSite IDs connected to ProfilePage, article, and project
  entities. Project markup describes source code/creative work, without invented
  ratings, prices, credentials, or claims of sole ownership.
- Visible descriptive headings, article author links, machine-readable publication
  and update dates, and source/demo links from project pages.
- Metadata is delivered in the initial HTML head for every user agent. This avoids
  relying on JavaScript or bot-name detection for metadata discovery. The tradeoff
  is waiting for the small local SQLite metadata lookup before streaming content.
- Published-only `/sitemap.xml`, `/feed.xml`, and `/llms.txt`. Unpublishing removes
  entries on the next request. RSS/llms endpoints require revalidation, though
  copies already fetched by external readers/crawlers cannot be recalled.
- Public crawling is allowed, including an explicit OAI-SearchBot rule; admin/API
  restrictions remain. The admin hostname serves a disallow-all robots file.
  AI training policy is unchanged; search and training controls are separate.

`llms.txt` is an optional factual navigation aid, not a standard ranking signal or
an instruction to AI systems. Search visibility/citations are not guaranteed.
Google says its AI features use the same SEO foundations and require no special
AI text files or schema: [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).
OpenAI distinguishes search discovery from training crawling:
[OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).

## Production setup

1. Verify the domain in Google Search Console and Bing Webmaster Tools. DNS
   verification works without code changes. For HTML-tag verification, set
   `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` to the token values
   shown by the services, then restart the app.
2. Submit `https://<public-host>/sitemap.xml` in both services. Inspect home, about,
   one project, and one published article after deployment.
3. Confirm the reverse proxy/CDN permits verified search crawlers, including the
   published OAI-SearchBot IP ranges. A permissive robots file cannot override a
   WAF challenge or firewall block. Do not allowlist arbitrary clients solely
   because they claim a bot user-agent.
4. Validate article/profile markup with Google's Rich Results Test and general
   schema with Schema.org's validator. Valid markup does not guarantee a rich result.
5. Measure indexing, query impressions, clicks, and AI referral traffic. Compare
   changes over time instead of treating a one-off AI answer as a ranking test.

## Content that deserves citation

For each substantial project, write a concise summary followed by the problem,
your specific contribution, architecture/technology choices, tradeoffs, and links
to inspectable code or a demo. Include measured outcomes only when you can support
them. In articles, state the answer early, show reproducible examples, identify
versions/dates where relevant, and explain the limitations. Keep public identity
and professional profiles consistent. Do not add hidden keyword blocks, fabricated
FAQ answers, or instructions asking AI systems to rank/recommend the site.

## Validation

Run `npm run test:seo`, `npm run lint`, and `npm run build`. The SEO suite checks
canonical URLs, filtered noindex rules, Unicode slugs, structured entity IDs,
XML/JSON escaping, published-only discovery, and removal after unpublishing.
Actual indexing, Search Console/Bing verification, and CDN behavior must be checked
on the deployed public domain; local checks cannot establish them.
