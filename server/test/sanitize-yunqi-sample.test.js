import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeNewsHtml } from '../../src/lib/sanitize-news-html.js'

const sample = `<section pingfang="" sc="" style="max-width:760px;margin:0 auto;padding:38px 34px 46px;border-top:8px solid #17385f;border-bottom:4px solid #c4a16a;background:#ffffff;box-shadow:0 8px 28px rgba(17,45,77,.10);color:#25364b;font-family:">
<h1 style="border-bottom:3px solid #c4a16a; color:#17385f; font-size:30px; font-weight:700; letter-spacing:.6px; line-height:1.55; margin-bottom:32px; margin-left:32px; margin-right:32px; margin-top:32px; padding:0 0 28px; text-align:center">云栖大会 &middot; 2026</h1>
<p style="background:#f1f5fa; border-left:4px solid #c4a16a; color:#203b5e; font-size:17px; letter-spacing:.25px; line-height:2.05; margin-bottom:34px; margin-left:34px; margin-right:34px; margin-top:34px; padding:22px 24px; text-align:justify">近日，安墨客惊艳亮相2026云栖大会。</p>
<p style="color:#65778f; font-size:14px; letter-spacing:.2px; line-height:1.8; margin-bottom:11px; margin-left:38px; margin-right:38px; margin-top:11px; padding:0 8px; text-align:center"><img alt="" class="fullScreen" height="407.6602830974188" src="//nwzimg.wezhan.net/contents/sitefiles3609/18046385/images/174364781.jpg" /></p>
</section>`

test('yunqi migrated article keeps card layout styles', () => {
  const html = sanitizeNewsHtml(sample)
  assert.match(html, /<section style="/)
  assert.match(html, /max-width:760px/)
  assert.match(html, /border-top:8px solid #17385f/)
  assert.match(html, /border-bottom:4px solid #c4a16a/)
  assert.match(html, /box-shadow:0 8px 28px rgba\(17,45,77,.10\)/)
  assert.match(html, /background:#ffffff/)
  assert.match(html, /<h1 style="/)
  assert.match(html, /font-size:30px/)
  assert.match(html, /text-align:center/)
  assert.match(html, /background:#f1f5fa/)
  assert.match(html, /border-left:4px solid #c4a16a/)
  assert.match(html, /https:\/\/nwzimg\.wezhan\.net\/contents\/sitefiles3609\/18046385\/images\/174364781\.jpg/)
  assert.match(html, /class="sx-news-img"/)
  assert.match(html, /height="408"/)
  assert.doesNotMatch(html, /pingfang|sc="/)
})
