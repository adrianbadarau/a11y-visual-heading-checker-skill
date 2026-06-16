import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const targetUrl = process.argv[2] || 'http://localhost:5173';
const ARTIFACT_DIR = path.resolve(process.cwd(), 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

(async () => {
  console.log(`Launching browser and navigating to ${targetUrl}...`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  console.log('Evaluating elements in page...');
  const candidates = await page.evaluate(() => {
    const excludedTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'NAV', 'FOOTER', 'BUTTON', 'A', 'SCRIPT', 'STYLE', 'SVG', 'INPUT', 'LABEL'];
    const allElements = document.querySelectorAll('*');
    const list = [];
    let candidateCount = 0;

    for (const el of allElements) {
      if (excludedTags.includes(el.tagName)) continue;
      if (el.role === 'heading' || el.getAttribute('role') === 'heading') continue;

      // Ensure element contains direct visible text and is not empty
      const text = (el.innerText || '').trim();
      if (!text) continue;
      
      // Skip if this text is identical to a child's text to prevent double-selecting containers
      let hasMatchingChild = false;
      for (let i = 0; i < el.children.length; i++) {
        if ((el.children[i].innerText || '').trim() === text) {
          hasMatchingChild = true;
          break;
        }
      }
      if (hasMatchingChild) continue;

      const style = window.getComputedStyle(el);
      const fontSizeVal = parseFloat(style.fontSize);
      const fontWeightVal = parseInt(style.fontWeight, 10);
      const textTransform = style.textTransform;

      const isHeadingSize = fontSizeVal >= 18;
      const isHeadingWeight = fontWeightVal >= 600;
      const isHeadingCase = textTransform === 'uppercase' && text.length > 5 && text.length < 50;

      if (isHeadingSize || isHeadingWeight || isHeadingCase) {
        candidateCount++;
        
        // Store original outer HTML for metadata
        const originalHtml = el.outerHTML;

        // Annotate style
        el.setAttribute('data-a11y-candidate', String(candidateCount));
        el.style.outline = '2px solid #ef4444';
        el.style.outlineOffset = '2px';
        el.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';

        // Inject label badge absolute overlay
        const badge = document.createElement('span');
        badge.innerText = `[${candidateCount}]`;
        badge.style.position = 'absolute';
        badge.style.backgroundColor = '#ef4444';
        badge.style.color = '#ffffff';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '4px';
        badge.style.zIndex = '999999';
        badge.style.pointerEvents = 'none';

        // Position badge near element top-left
        const rect = el.getBoundingClientRect();
        badge.style.top = `${rect.top + window.scrollY}px`;
        badge.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(badge);

        list.push({
          candidateId: candidateCount,
          tagName: el.tagName.toLowerCase(),
          text: text.substring(0, 80),
          htmlSnippet: originalHtml.substring(0, 250)
        });
      }
    }
    return list;
  });

  console.log(`Found ${candidates.length} visual heading candidates.`);
  
  // Save annotated screenshot and JSON data
  const screenshotPath = path.join(ARTIFACT_DIR, 'a11y-screenshot.png');
  const jsonPath = path.join(ARTIFACT_DIR, 'a11y-candidates.json');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  fs.writeFileSync(jsonPath, JSON.stringify(candidates, null, 2));

  console.log(`Screenshot saved to: ${screenshotPath}`);
  console.log(`Candidates JSON saved to: ${jsonPath}`);

  await browser.close();
})();
