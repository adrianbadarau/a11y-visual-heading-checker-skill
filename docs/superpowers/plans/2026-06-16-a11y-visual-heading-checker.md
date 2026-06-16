# WCAG 1.3.1 Visual Heading Checker Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a visual heading checker skill (Playwright script + SKILL.md guide) and a dummy React/Vite travel app with intentional WCAG 1.3.1 violations to test visual remediation capabilities of AI agents.

**Architecture:** A local Playwright automation script finds visual heading candidates via computed CSS styling rules, overlaying numbered badges and saving a screenshot/metadata. The AI agent uses this visual output to remediate the app's files.

**Tech Stack:** React, Vite, Node.js, Playwright, Tailwind/Custom CSS.

## Global Constraints
* Node.js version >= 18.
* Playwright version >= 1.40.
* Do not use external API keys (all model visual evaluation is performed by the calling AI agent's harness).
* Dummy app and skill must remain isolated in `apps/` and `skills/` directories respectively.

---

### Task 1: Scaffold Travel App

**Files:**
* Create: `apps/travel-app/package.json`
* Create: `apps/travel-app/index.html`
* Create: `apps/travel-app/vite.config.js`
* Create: `apps/travel-app/src/main.jsx`
* Create: `apps/travel-app/src/App.css`
* Create: `apps/travel-app/src/App.jsx`

**Interfaces:**
* Produces: A running Vite React application serving a basic page at `http://localhost:5173`.

- [ ] **Step 1: Create apps/travel-app package.json**
  Write to [package.json](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/package.json):
  ```json
  {
    "name": "travel-app",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@vitejs/plugin-react": "^4.3.1",
      "vite": "^5.3.1"
    }
  }
  ```

- [ ] **Step 2: Create apps/travel-app vite.config.js**
  Write to [vite.config.js](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/vite.config.js):
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true
    }
  });
  ```

- [ ] **Step 3: Create apps/travel-app index.html**
  Write to [index.html](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/index.html):
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Wanderlust Destinations</title>
    </head>
    <body style="margin: 0; background-color: #0f172a; color: #f8fafc;">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 4: Create apps/travel-app src/main.jsx**
  Write to [main.jsx](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/main.jsx):
  ```jsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.jsx';
  import './App.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

- [ ] **Step 5: Create apps/travel-app src/App.css**
  Write to [App.css](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/App.css):
  ```css
  body {
    font-family: system-ui, -apple-system, sans-serif;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  ```

- [ ] **Step 6: Create apps/travel-app src/App.jsx**
  Write to [App.jsx](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/App.jsx):
  ```jsx
  import React from 'react';

  export default function App() {
    return (
      <div className="container">
        <h1>Wanderlust Destinations</h1>
        <p>Welcome to our travel portal.</p>
      </div>
    );
  }
  ```

- [ ] **Step 7: Run app dev command to verify it builds and starts**
  Run: `npm install` inside `/Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app` and test that the server can run.
  Expected: Successful start, listening on port 5173.

- [ ] **Step 8: Commit**
  Run:
  ```bash
  git add apps/travel-app
  git commit -m "feat: scaffold travel dummy app"
  ```

---

### Task 2: Implement Travel App Layout & Intentional Violations

**Files:**
* Modify: `apps/travel-app/src/App.jsx`
* Modify: `apps/travel-app/src/App.css`

**Interfaces:**
* Consumes: Apps folder structure from Task 1.
* Produces: Complete mock UI containing three intentional pseudo-heading violations.

- [ ] **Step 1: Add css styles for visual hierarchy and violations**
  Modify [App.css](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/App.css):
  ```css
  .hero {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    padding: 4rem 2rem;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 3rem;
  }
  .hero h1 {
    font-size: 2.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }
  .section-container {
    margin-bottom: 3rem;
  }
  /* Pseudo-heading style for "Popular Getaways" */
  .pseudo-h2 {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 1.5rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  .card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1.5rem;
  }
  /* Pseudo-heading style for card titles */
  .pseudo-h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #10b981;
    margin-bottom: 0.75rem;
  }
  .card p {
    color: #cbd5e1;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  .newsletter-section {
    background: #1e293b;
    border-radius: 8px;
    padding: 2.5rem;
    margin-top: 4rem;
    text-align: center;
  }
  /* Pseudo-heading style for newsletter form */
  .pseudo-form-title {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }
  .newsletter-section input {
    padding: 0.75rem 1rem;
    border-radius: 4px;
    border: 1px solid #475569;
    background: #0f172a;
    color: white;
    margin-right: 0.5rem;
    width: 250px;
  }
  .newsletter-section button {
    padding: 0.75rem 1.5rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
  }
  ```

- [ ] **Step 2: Update App component structure with pseudo-headings**
  Modify [App.jsx](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/App.jsx):
  ```jsx
  import React from 'react';

  export default function App() {
    return (
      <div className="container">
        {/* Correct semantic heading */}
        <header className="hero">
          <h1>Wanderlust Destinations</h1>
          <p>Find your next adventure under the sun</p>
        </header>

        {/* VIOLATION 1: Section header styled with css but using span */}
        <div className="section-container">
          <span className="pseudo-h2">Popular Getaways</span>
          <div className="grid">
            <div className="card">
              {/* VIOLATION 2a: Card title using div */}
              <div className="pseudo-h3">Explore Kyoto</div>
              <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
            </div>
            <div className="card">
              {/* VIOLATION 2b: Card title using div */}
              <div className="pseudo-h3">Sunny Santorini</div>
              <p>Witness iconic blue-domed churches, volcanic black sand beaches, and the world's most spectacular sunsets.</p>
            </div>
          </div>
        </div>

        {/* VIOLATION 3: Form header using span */}
        <div className="newsletter-section">
          <span className="pseudo-form-title">Join Our Mailing List</span>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" aria-label="Email Address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add apps/travel-app/src/
  git commit -m "feat: implement page sections and deliberate WCAG 1.3.1 violations"
  ```

---

### Task 3: Scaffold Visual Heading Checker Skill

**Files:**
* Create: `skills/a11y-heading-check/package.json`

**Interfaces:**
* Produces: A package.json in the skill folder tracking dependencies needed to execute Playwright.

- [ ] **Step 1: Create package.json**
  Write to [package.json](file:///Users/adrianbadarau/code/tests/a11y-skills/skills/a11y-heading-check/package.json):
  ```json
  {
    "name": "a11y-heading-check",
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

- [ ] **Step 2: Install skill dependencies**
  Run: `npm install` inside `/Users/adrianbadarau/code/tests/a11y-skills/skills/a11y-heading-check`
  Expected: Playwright package successfully downloaded.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add skills/a11y-heading-check/package.json
  git commit -m "chore: scaffold skill dependencies"
  ```

---

### Task 4: Implement Candidate Detection Logic & Visual Annotation

**Files:**
* Create: `skills/a11y-heading-check/a11y-check.js`

**Interfaces:**
* Consumes: A local webpage url (e.g. `http://localhost:5173`).
* Produces: Saves screenshot to `artifacts/a11y-screenshot.png` and candidates json to `artifacts/a11y-candidates.json`.

- [ ] **Step 1: Write a11y-check.js script**
  Write to [a11y-check.js](file:///Users/adrianbadarau/code/tests/a11y-skills/skills/a11y-heading-check/a11y-check.js):
  ```javascript
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
  ```

- [ ] **Step 2: Test script execution on dummy app**
  First, start the dummy app in the background (or in a separate process/tab), then run:
  `node skills/a11y-heading-check/a11y-check.js http://localhost:5173`
  Expected: Outputs finding candidates and saving `artifacts/a11y-screenshot.png` and `artifacts/a11y-candidates.json`.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add skills/a11y-heading-check/a11y-check.js
  git commit -m "feat: implement page candidate visual parsing and annotation in a11y-check.js"
  ```

---

### Task 5: Create SKILL.md Instructions

**Files:**
* Create: `skills/a11y-heading-check/SKILL.md`

**Interfaces:**
* Produces: The markdown instruction spec parsed by the AI Coding Assistant.

- [ ] **Step 1: Write SKILL.md**
  Write to [SKILL.md](file:///Users/adrianbadarau/code/tests/a11y-skills/skills/a11y-heading-check/SKILL.md):
  ```markdown
  # WCAG 1.3.1 Visual Heading Checker Skill

  Use this skill to audit web pages for WCAG 1.3.1 (Info and Relationships) violations, specifically when text elements are styled visually like headings (pseudo-headings) but lack correct semantic tags or heading roles.

  ## Prerequisites
  * Ensure the target web application dev server is running.
  * Verify your model configuration supports vision/multimodal input. If not, request the user to change models.

  ## Audit Workflow

  1. **Run the Candidate Finder**:
     Execute the script:
     ```bash
     node skills/a11y-heading-check/a11y-check.js <url>
     ```
     This generates:
     - `artifacts/a11y-screenshot.png`: Visual layout screenshot with red numbered candidates.
     - `artifacts/a11y-candidates.json`: The candidate metadata list.

  2. **Analyze Visual Hierarchy**:
     - Read the `artifacts/a11y-candidates.json` file.
     - Open and view `artifacts/a11y-screenshot.png` using your file/image viewing tool.
     - For each candidate number:
       - **Assess if it functions visually as a heading**: Does it stand alone, use larger/bolder typography to separate sections of content, or act as a primary title?
       - If yes, identify which source file contains it.

  3. **Remediate Code**:
     - Replace the violating styled tags (e.g. `<span>` or `<div>`) with appropriate native semantic heading tags (`<h2>`, `<h3>`, etc.) keeping the class names/styles intact.
     - *Alternative (Legacy fallback)*: If changing the tag name is impossible, apply `role="heading"` and `aria-level="[X]"` attributes.

  4. **Verify**:
     - Re-run `node skills/a11y-heading-check/a11y-check.js <url>`.
     - Read `artifacts/a11y-candidates.json` and ensure the candidates that acted as headings have been removed or resolved.
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add skills/a11y-heading-check/SKILL.md
  git commit -m "docs: write heading checker SKILL.md instruction specification"
  ```

---

### Task 6: End-to-End Verification (Audit Run)

**Files:**
* Modify: `apps/travel-app/src/App.jsx` (remediated version)

**Interfaces:**
* Consumes: Complete setup from Tasks 1-5.
* Produces: A fully WCAG 1.3.1-compliant travel application verified by re-running the checking script.

- [ ] **Step 1: Run the initial audit**
  Ensure the travel app is running at `http://localhost:5173`. Run the script:
  `node skills/a11y-heading-check/a11y-check.js http://localhost:5173`
  Expected: Script exits successfully, outputting findings.

- [ ] **Step 2: Verify candidate artifacts**
  Verify that `artifacts/a11y-candidates.json` and `artifacts/a11y-screenshot.png` are created and contain the three simulated violations.

- [ ] **Step 3: Remediate the travel app code**
  Modify [App.jsx](file:///Users/adrianbadarau/code/tests/a11y-skills/apps/travel-app/src/App.jsx) to replace pseudo-headings with correct semantic tags:
  ```jsx
  import React from 'react';

  export default function App() {
    return (
      <div className="container">
        <header className="hero">
          <h1>Wanderlust Destinations</h1>
          <p>Find your next adventure under the sun</p>
        </header>

        {/* VIOLATION 1 FIX: Changed span.pseudo-h2 to h2.pseudo-h2 */}
        <div className="section-container">
          <h2 className="pseudo-h2">Popular Getaways</h2>
          <div className="grid">
            <div className="card">
              {/* VIOLATION 2a FIX: Changed div.pseudo-h3 to h3.pseudo-h3 */}
              <h3 className="pseudo-h3">Explore Kyoto</h3>
              <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
            </div>
            <div className="card">
              {/* VIOLATION 2b FIX: Changed div.pseudo-h3 to h3.pseudo-h3 */}
              <h3 className="pseudo-h3">Sunny Santorini</h3>
              <p>Witness iconic blue-domed churches, volcanic black sand beaches, and the world's most spectacular sunsets.</p>
            </div>
          </div>
        </div>

        {/* VIOLATION 3 FIX: Changed span.pseudo-form-title to h2.pseudo-form-title */}
        <div className="newsletter-section">
          <h2 className="pseudo-form-title">Join Our Mailing List</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" aria-label="Email Address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Re-run the visual audit to verify fixes**
  Run: `node skills/a11y-heading-check/a11y-check.js http://localhost:5173`
  Expected: The output candidate JSON should no longer flag these elements as violations (since they are now native `h2` and `h3` tags).

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add apps/travel-app/src/App.jsx
  git commit -m "fix: remediate WCAG 1.3.1 violations in travel-app"
  ```
