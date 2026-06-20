# Interactive Name Checker Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new accessibility skill `a11y-interactive-name-check` that finds and helps remediate WCAG 2.4.6 and WCAG 2.5.3 name violations on interactive elements, tested against a dummy travel app.

**Architecture:** Use a Playwright-based script to inspect interactive DOM elements, apply heuristics for mismatching and generic names, highlight candidate elements visually with orange borders/badges, take a screenshot, save metadata JSON, and define a skill document (`SKILL.md`) instructing multimodal LLM agents on visual audit and remediation.

**Tech Stack:** Node.js, Playwright, ESM, Vitest/Vanilla JS, React (travel-app).

## Global Constraints
- Target workspace path: `/Users/adrianbadarau/code/tests/a11y-skills`
- Output screenshot path: `artifacts/a11y-interactive-screenshot.png`
- Output metadata path: `artifacts/a11y-interactive-candidates.json`
- Colors: Candidate highlights must use orange (`#f97316` / `rgba(249, 115, 22, 0.1)`) with a unique numbered overlay badge `[X]`.

---

### Task 1: Add WCAG Violations to Travel App Testbed

Add WCAG 2.4.6 and 2.5.3 violations to the travel app landing page for verification.

**Files:**
- Modify: `apps/travel-app/src/App.jsx`

**Interfaces:**
- Consumes: Existing travel-app React structure.
- Produces: Mismatching and generic interactive elements on the travel-app landing page.

- [ ] **Step 1: Edit `apps/travel-app/src/App.jsx` to introduce violations**

Modify the file `apps/travel-app/src/App.jsx` to inject a currency selection button, a search button, and a details link with incorrect/generic labels.

```jsx
<<<<
import React from 'react';

export default function App() {
  return (
    <div className="container">
      {/* Correct semantic heading */}
      <header className="hero">
        <h1>Wanderlust Destinations</h1>
        <p>Find your next adventure under the sun</p>
      </header>
====
import React from 'react';

export default function App() {
  return (
    <div className="container">
      {/* Correct semantic heading */}
      <header className="hero">
        <div className="top-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
          {/* VIOLATION: Mismatching label & generic word */}
          <button aria-label="Selector" className="currency-select-btn">USD</button>
          
          {/* VIOLATION: Generic button label */}
          <button aria-label="Button" className="search-btn">🔍</button>
        </div>
        <h1>Wanderlust Destinations</h1>
        <p>Find your next adventure under the sun</p>
      </header>
>>>>
```

Also add a generic link violation under the first card:

```jsx
<<<<
          <div className="card">
            {/* VIOLATION 2a: Card title using div */}
            <div className="_x1y2z">Explore Kyoto</div>
            <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
          </div>
====
          <div className="card">
            {/* VIOLATION 2a: Card title using div */}
            <div className="_x1y2z">Explore Kyoto</div>
            <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
            {/* VIOLATION: Generic link label */}
            <a href="#details" aria-label="Link" className="details-link">Learn More</a>
          </div>
>>>>
```

- [ ] **Step 2: Verify the travel-app builds**

Run: `npm run build` inside `apps/travel-app`
Expected: Successful production build without errors.

- [ ] **Step 3: Commit**

```bash
git add apps/travel-app/src/App.jsx
git commit -m "testbed: add interactive element name violations to travel-app"
```

---

### Task 2: Build the Candidate Finder Script

Implement the Playwright script to locate candidates violating name accessibility guidelines.

**Files:**
- Create: `skills/a11y-interactive-name-check/package.json`
- Create: `skills/a11y-interactive-name-check/a11y-check.js`

**Interfaces:**
- Consumes: Target URL via CLI argument.
- Produces: `artifacts/a11y-interactive-screenshot.png` and `artifacts/a11y-interactive-candidates.json`.

- [ ] **Step 1: Create `skills/a11y-interactive-name-check/package.json`**

Write the following dependencies:

```json
{
  "name": "a11y-interactive-name-check",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node a11y-check.js"
  },
  "dependencies": {
    "playwright": "^1.44.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install` inside `skills/a11y-interactive-name-check`
Expected: Node modules installed successfully.

- [ ] **Step 3: Create candidate finder script `skills/a11y-interactive-name-check/a11y-check.js`**

Write the script:

```javascript
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
```

- [ ] **Step 4: Verify the script works**

Start the travel-app:
Run: `npm run dev` inside `apps/travel-app` (run in background)

Run the script:
Run: `node skills/a11y-interactive-name-check/a11y-check.js http://localhost:5173`
Expected: Finds 3 candidates. Saves `artifacts/a11y-interactive-screenshot.png` and `artifacts/a11y-interactive-candidates.json`.

Check JSON:
Run: `cat artifacts/a11y-interactive-candidates.json`
Expected: JSON has 3 candidate objects detailing the mismatching currency button, generic search button, and details link.

- [ ] **Step 5: Commit**

```bash
git add skills/a11y-interactive-name-check/package.json skills/a11y-interactive-name-check/a11y-check.js
git commit -m "feat: build candidate finder script for interactive element names"
```

---

### Task 3: Create the Skill Documentation

Write the `SKILL.md` instructions for the interactive name check.

**Files:**
- Create: `skills/a11y-interactive-name-check/SKILL.md`

**Interfaces:**
- Consumes: Instructions on running and using the script.
- Produces: Fully integrated new skill instruction page.

- [ ] **Step 1: Create `skills/a11y-interactive-name-check/SKILL.md`**

Write the instructions:

```markdown
---
name: a11y-interactive-name-check
description: Audits web pages for WCAG 2.4.6 (Headings and Labels) and WCAG 2.5.3 (Label in Name) interactive element label violations.
---

# WCAG Interactive Name Checker Skill

Use this skill to audit web pages for WCAG 2.4.6 (Headings and Labels) and WCAG 2.5.3 (Label in Name) violations on interactive elements, specifically when programmatic names mismatch the visual text or are overly generic.

## Prerequisites
* Ensure the target web application dev server is running.
* Verify your model configuration supports vision/multimodal input. If not, request the user to change models.

## Audit Workflow

1. **Run the Interactive Candidate Finder**:
   Execute the script:
   ```bash
   node skills/a11y-interactive-name-check/a11y-check.js <url>
   ```
   This generates:
   - `artifacts/a11y-interactive-screenshot.png`: Visual layout screenshot with orange numbered candidates.
   - `artifacts/a11y-interactive-candidates.json`: The candidate metadata list.

2. **Analyze Visual Context**:
   - Read `artifacts/a11y-interactive-candidates.json`.
   - Open and view `artifacts/a11y-interactive-screenshot.png` using your file/image viewing tool.
   - For each candidate:
     - Check its position on the page and surrounding visual labels or context.
     - **Label in Name check (WCAG 2.5.3)**: If the button has visual text (e.g. "USD"), verify that its programmatic name (e.g. `aria-label`) matches or fully includes that text (e.g. `aria-label="Currency: USD"`).
     - **Descriptive Label check (WCAG 2.4.6)**: If the programmatic name is generic (like "Button" or "Selector"), determine a descriptive accessible name based on the visual purpose (e.g. `aria-label="Search destinations"` or `aria-label="Select currency"`).

3. **Remediate Code**:
   - Update the element's label attribute in the source code to be descriptive and match visual text.

4. **Verify**:
   - Re-run `node skills/a11y-interactive-name-check/a11y-check.js <url>`.
   - Verify that the candidate list no longer flags these elements.
```

- [ ] **Step 2: Commit**

```bash
git add skills/a11y-interactive-name-check/SKILL.md
git commit -m "docs: write SKILL.md for a11y-interactive-name-check"
```

---

## Verification Plan

### Automated Verification
1. Run `node skills/a11y-interactive-name-check/a11y-check.js http://localhost:5173` against the running travel-app.
2. Confirm the JSON lists exactly 3 candidates.
3. Apply the skill instructions manually/automatically to fix `App.jsx`:
   - Change `<button aria-label="Selector" ...>USD</button>` to `<button aria-label="Currency: USD" ...>USD</button>`
   - Change `<button aria-label="Button" ...>🔍</button>` to `<button aria-label="Search destinations" ...>🔍</button>`
   - Change `<a ... aria-label="Link">Learn More</a>` to `<a ... aria-label="Learn more about Wanderlust Destinations">Learn More</a>`
4. Re-run `node skills/a11y-interactive-name-check/a11y-check.js http://localhost:5173` and confirm that candidates count drops to `0`.
