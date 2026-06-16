---
name: a11y-heading-check
description: Audits web pages for WCAG 1.3.1 (Info and Relationships) visual heading violations.
---

# WCAG 1.3.1 Visual Heading Checker Skill

Use this skill to audit web pages for WCAG 1.3.1 (Info and Relationships) violations, specifically when text elements are styled visually like headings (pseudo-headings) but lack correct semantic tags or heading roles.

## Prerequisites
* Ensure the target web application dev server is running.
* Install the Playwright browser binaries by running:
  ```bash
  npx playwright install chromium
  ```
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
