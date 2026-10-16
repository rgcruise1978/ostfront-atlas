import fs from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:5198';
const out = `phase-v-edit-review/${process.argv[3] || 'local'}`;
fs.mkdirSync(`${out}/screenshots`, { recursive: true });
const events = JSON.parse(fs.readFileSync('src/data/barbarossa-phase-v-timeline.json'));
const studies = events.map(e => JSON.parse(fs.readFileSync(`src/content/articles/${e.articleSlug}.json`)));
const browser = await chromium.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: true, args: ['--no-sandbox'] });
const results = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [index, article] of studies.entries()) {
      errors = [];
      await page.goto(`${base}/articles/${article.slug}`, { waitUntil: 'networkidle' });
      await page.locator('.article-body').waitFor();
      const state = await page.evaluate(expected => {
        const expectedBody = document.createElement('div'); expectedBody.innerHTML = expected;
        const normalized = s => s.replace(/\s+/g, ' ').trim();
        const body = document.querySelector('.article-body');
        const prose = body.cloneNode(true);
        prose.querySelectorAll('h1,h2,h3,h4,h5,h6,sup,.eyebrow').forEach(el => el.remove());
        const words = (prose.textContent.match(/[\p{L}\p{N}_]+(?:[’'–-][\p{L}\p{N}_]+)*/gu) || []).length;
        const anchors = [...document.querySelectorAll('.source-ref a,.citation-return,.article-contents a')];
        const missing = anchors.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash);
        return {
          title: document.querySelector('h1').textContent,
          bodyMatches: normalized(body.textContent) === normalized(expectedBody.textContent),
          publication: document.querySelector('.article-meta')?.textContent,
          sourcePassages: document.querySelectorAll('details.source-passages').length,
          words, paragraphs: body.querySelectorAll('p').length,
          sections: body.querySelectorAll('h2').length, asides: body.querySelectorAll('aside').length,
          citationOccurrences: body.querySelectorAll('.source-ref').length,
          sources: document.querySelectorAll('.article-sources > ol > li').length,
          missing, author: document.head.querySelector('meta[name="author"]')?.content,
          robots: document.head.querySelector('meta[name="robots"]')?.content,
          review: document.querySelector('.study-review-notice')?.textContent,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          previous: document.querySelector('.previous-chapter a')?.getAttribute('href'),
          next: document.querySelector('.next-chapter a')?.getAttribute('href'),
          map: document.querySelector('.article-facts a')?.getAttribute('href'),
        };
      }, article.body);
      const failures = [];
      if (state.title !== article.title || state.author !== 'R.G. Cruise') failures.push('title or author');
      if (state.words !== article.substantiveWordCount || state.words < 3000 || state.words > 5000) failures.push('rendered word count');
      if (state.missing.length || state.sources !== article.sourceIds.length) failures.push('citation or contents targets');
      if (state.sections !== article.sections.length || state.asides !== 2) failures.push('sections or asides');
      if (!state.robots?.includes('noindex') || state.review || !state.publication?.includes('Published 2026-10-16')) failures.push('publication status');
      if (!state.bodyMatches) failures.push('full article text mismatch');
      if (state.sourcePassages !== article.sourceIds.length) failures.push('source locator disclosures');
      if (state.previous !== `/articles/${article.previousArticleSlug}` || state.next !== (article.nextArticleSlug ? `/articles/${article.nextArticleSlug}` : undefined)) failures.push('reading sequence');
      const map = new URL(state.map, base);
      if (map.searchParams.get('date') !== article.historicalDate || map.searchParams.get('phase') !== '5' || map.searchParams.get('region') !== events[index].defaultView) failures.push('dated map context');
      if (state.overflow || errors.length) failures.push('layout or runtime');
      // Exercise a citation, its return link and a contents link rather than only checking their markup.
      const firstId = article.sourceIds[0];
      await page.locator('details.source-passages summary').first().click();
      if (!(await page.locator('details.source-passages').first().getAttribute('open')) && await page.locator('details.source-passages').first().getAttribute('open') !== '') failures.push('source passage disclosure');
      await page.locator('.source-ref a').first().click();
      if (new URL(page.url()).hash !== `#source-${firstId}`) failures.push('citation click');
      await page.locator(`#source-${firstId} .citation-return`).click();
      if (new URL(page.url()).hash !== `#cite-${firstId}`) failures.push('citation return click');
      await page.locator('.article-contents ol a').last().click();
      if (new URL(page.url()).hash !== `#${article.sections.at(-1).id}`) failures.push('contents click');
      if (index === 0 || index === studies.length - 1) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${out}/screenshots/${article.historicalDate}-${width}-header.png` });
        await page.locator('.history-aside').first().screenshot({ path: `${out}/screenshots/${article.historicalDate}-${width}-aside.png` });
      }
      if (index === 4) await page.locator('.article-sources > ol > li').first().screenshot({ path: `${out}/screenshots/canal-${width}-source.png` });
      results.push({ date: article.historicalDate, width, ...state, failures, errors });
      console.log(article.historicalDate, width, failures.length ? failures : 'PASS');
    }
    for (const [route, selector, expected] of [
      ['/campaigns/barbarossa-1941?phase=5', '.campaign-chapters article', 8],
      ['/articles?collection=barbarossa-1941%3A5', '.article-list article', 8],
      ['/collections', '.collection-cards article', 6],
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const text = await page.locator('main').innerText();
      const failures = [];
      if (await page.locator(selector).count() !== expected) failures.push('entry count');
      if (/awaiting review|editorial review pending/i.test(text)) failures.push('stale review status');
      if (route.startsWith('/articles?')) {
        if (await page.locator('.article-list .article-meta').filter({ hasText: 'Published 2026-10-16' }).count() !== 8) failures.push('published article cards');
      } else if (!/8 published studies/i.test(text)) failures.push('published collection status');
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) failures.push('overflow');
      if (route.startsWith('/campaigns')) {
        if (!text.includes('military map reconstructions remain in preparation')) failures.push('map status');
        await page.screenshot({ path: `${out}/screenshots/collection-${width}.png`, fullPage: true });
      }
      results.push({ check: route, width, failures });
    }
    await page.close();
  }
} finally {
  await browser.close();
  fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(results, null, 2) + '\n');
}
assert.equal(results.length, 22);
assert.equal(results.filter(result => result.failures.length).length, 0, 'Browser checks failed; inspect browser-results.json');
console.log('PASS: 22 desktop/mobile study and collection checks.');
