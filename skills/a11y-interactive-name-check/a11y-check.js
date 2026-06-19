import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const targetUrl = process.argv[2] || 'http://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = path.resolve(__dirname, '../../artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

(async () => {
  let browser;
  try {
    console.log(`Launching browser and navigating to ${targetUrl}...`);
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    console.log('Evaluating interactive elements on page...');
    const candidates = await page.evaluate(() => {
      const interactiveSelector = 'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="combobox"], [role="menuitem"], [role="tab"]';
      const allInteractive = document.querySelectorAll(interactiveSelector);
      const candidateElements = [];
      const genericWords = ['selector', 'button', 'link', 'click', 'click here', 'more', 'read more', 'go', 'action', 'press', 'menu', 'close', 'open', 'submit'];

      for (const el of allInteractive) {
        // Skip non-visible/zero-size elements
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        // 1. Get visual text
        let visualText = '';
        if (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(el.type)) {
          visualText = el.value || '';
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          // Look for associated label text
          let labelText = '';
          if (el.id) {
            const labels = document.querySelectorAll(`label[for="${el.id}"]`);
            if (labels.length > 0) {
              labelText = Array.from(labels).map(l => l.innerText || '').join(' ');
            }
          }
          if (!labelText) {
            const parentLabel = el.closest('label');
            if (parentLabel) {
              labelText = parentLabel.innerText || '';
            }
          }
          visualText = labelText || el.getAttribute('placeholder') || '';
        } else {
          // Standard button/link/div text content
          visualText = el.innerText || '';
          if (!visualText.trim()) {
            const imgs = el.querySelectorAll('img');
            const imgAlts = Array.from(imgs).map(img => img.alt || '').filter(Boolean);
            if (imgAlts.length > 0) {
              visualText = imgAlts.join(' ');
            }
          }
        }
        visualText = visualText.trim();

        // 2. Get programmatic name
        let progName = el.getAttribute('aria-label') || '';
        const labelledBy = el.getAttribute('aria-labelledby');
        if (!progName && labelledBy) {
          const ids = labelledBy.split(/\s+/);
          const labels = ids.map(id => {
            const labelEl = document.getElementById(id);
            return labelEl ? (labelEl.innerText || '').trim() : '';
          }).filter(Boolean);
          progName = labels.join(' ');
        }
        if (!progName) {
          progName = el.getAttribute('title') || '';
        }
        progName = progName.trim();

        // If it is completely unlabeled, we skip it (per user instructions to focus on overrides and generic names)
        if (!progName) continue;

        // Heuristic A: Mismatch (WCAG 2.5.3)
        // If programmatic name is present and visual text is present, programmatic name must contain visual text
        const clean = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanVisual = clean(visualText);
        const cleanProg = clean(progName);

        let isMismatch = false;
        if (cleanVisual && cleanProg) {
          isMismatch = !cleanProg.includes(cleanVisual);
        }

        // Heuristic B: Generic label (WCAG 2.4.6)
        const isGeneric = genericWords.includes(progName.toLowerCase());

        if (isMismatch || isGeneric) {
          candidateElements.push({
            el,
            visualText,
            progName,
            isMismatch,
            isGeneric
          });
        }
      }

      // Annotate page and generate metadata list
      const list = [];
      let candidateCount = 0;
      for (const item of candidateElements) {
        candidateCount++;
        const el = item.el;
        const originalHtml = el.outerHTML;

        // Apply visual highlights
        el.setAttribute('data-a11y-interactive-candidate', String(candidateCount));
        el.style.outline = '2px solid #f97316';
        el.style.outlineOffset = '2px';
        el.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';

        // Position numbered badge
        const badge = document.createElement('span');
        badge.innerText = `[${candidateCount}]`;
        badge.style.position = 'absolute';
        badge.style.backgroundColor = '#f97316';
        badge.style.color = '#ffffff';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '4px';
        badge.style.zIndex = '999999';
        badge.style.pointerEvents = 'none';

        const rect = el.getBoundingClientRect();
        badge.style.top = `${rect.top + window.scrollY}px`;
        badge.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(badge);

        list.push({
          candidateId: candidateCount,
          tagName: el.tagName.toLowerCase(),
          text: item.visualText.substring(0, 80),
          ariaLabel: item.progName.substring(0, 80),
          isMismatch: item.isMismatch,
          isGeneric: item.isGeneric,
          htmlSnippet: originalHtml.substring(0, 250)
        });
      }
      return list;
    });

    console.log(`Found ${candidates.length} visual interactive name candidates.`);

    const screenshotPath = path.join(ARTIFACT_DIR, 'a11y-interactive-screenshot.png');
    const jsonPath = path.join(ARTIFACT_DIR, 'a11y-interactive-candidates.json');

    await page.screenshot({ path: screenshotPath, fullPage: true });
    fs.writeFileSync(jsonPath, JSON.stringify(candidates, null, 2));

    console.log(`Screenshot saved to: ${screenshotPath}`);
    console.log(`Candidates JSON saved to: ${jsonPath}`);
  } catch (error) {
    console.error(`Error running interactive name check: ${error.message || error}`);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
