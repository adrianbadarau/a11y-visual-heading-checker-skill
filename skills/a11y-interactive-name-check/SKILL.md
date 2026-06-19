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
