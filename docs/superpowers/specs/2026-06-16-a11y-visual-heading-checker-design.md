# Design Spec: WCAG 1.3.1 Visual Heading Checker Skill

This design specification outlines the plan to build an accessibility skill that enables AI coding assistants to find and remediate WCAG 1.3.1 (Info and Relationships) pseudo-heading violations using visual grounding and browser automation.

---

## 1. Goal & Context

Assistive technologies (like screen readers) rely on semantic HTML structure to build page outlines and allow user navigation. Visually styled text elements (`<span>`, `<div>`) that act as headings without semantic tags break this structure.

This project will create:
1. **A Visual Heading Checker Script**: A local Node.js script using Playwright to inspect the DOM, identify visual heading candidates, inject numbered labels/borders, and save an annotated screenshot and metadata file.
2. **The Accessibility Skill (`SKILL.md`)**: Instructions instructing an AI agent on how to run the script, view the annotated screenshot using its own vision capabilities, evaluate candidates, and modify the code.
3. **A Dummy Travel App**: A lightweight React/Vite app containing intentional WCAG 1.3.1 violations, serving as a testbed to verify the skill before and after fixes.

---

## 2. Directory & Repository Structure

To support scaling this repository with more skills and app testbeds in the future, the codebase is structured to isolate skills from target applications:

```
a11y-skills/
├── apps/
│   └── travel-app/                 # React/Vite dummy travel app
│       ├── src/
│       ├── package.json
│       └── ...
├── skills/
│   └── a11y-heading-check/         # Folder for the visual heading checker skill
│       ├── a11y-check.js           # Candidate marking script
│       ├── SKILL.md                # AI agent instruction document
│       └── package.json            # Node.js dependencies (Playwright, etc.)
└── docs/
    └── superpowers/specs/          # Design specifications
```

---

## 3. System Architecture

```mermaid
graph TD
    subgraph apps/travel-app (React/Vite)
        App[Wanderlust Destinations]
        V1[Pseudo-heading: span]
        V2[Pseudo-heading: div]
        V3[Pseudo-heading: span]
    end

    subgraph skills/a11y-heading-check
        Script[a11y-check.js]
        Browser[Playwright Chromium]
        Artifacts[artifacts/ directory]
    end

    subgraph AI Coding Agent
        Agent[Multimodal LLM Agent]
        Skill[SKILL.md]
    end

    %% Flow
    Agent -->|Read instructions| Skill
    Agent -->|Run script| Script
    Script -->|Launch & Nav| Browser
    Browser -->|Inspect DOM Styles & Annotate| Browser
    Browser -->|Save Screenshot| Artifacts
    Browser -->|Save Metadata JSON| Artifacts
    Agent -->|Inspect visual layout| Artifacts
    Agent -->|Edit source code| App
```

---

## 4. Component Details

### 4.1. Dummy Travel App ("Wanderlust Destinations")
* **Location**: `apps/travel-app/`
* **Stack**: React, Vite, CSS.
* **Layout**: A premium landing page containing:
  - Hero banner.
  - "Popular Getaways" grid.
  - "Travel Insights" articles.
  - "Newsletter Signup" form.
* **Violations**:
  - `Popular Getaways` header: `<span class="section-title">Popular Getaways</span>` (large, bold).
  - Destination card titles: `<div class="card-title">Explore Kyoto</div>` (bold, styled).
  - Newsletter title: `<span class="form-title">Join Our Mailing List</span>` (bold, styled).

### 4.2. Visual Checker Script (`skills/a11y-heading-check/a11y-check.js`)
* **Location**: `skills/a11y-heading-check/a11y-check.js`
* **Execution**: `node skills/a11y-heading-check/a11y-check.js <url>`
* **Logic**:
  1. Launches Chromium headless browser.
  2. Navigates to the page and waits for load.
  3. Injects code to find candidate pseudo-headings:
     - Excludes tags `H1-H6`, `HEADER`, `NAV`, `FOOTER`, `BUTTON`, `A`.
     - Excludes elements with `role="heading"` or `aria-level`.
     - Selects elements with visible text, where computed style: `fontSize >= 18px` OR `fontWeight >= 600` OR `textTransform === "uppercase"` (length > 5).
  4. Renders absolute overlays on candidates:
     - Red thin border (`1px solid #ef4444`).
     - Bounding background tint.
     - Numbered badge `[X]` near top-left.
     - Inject `data-a11y-candidate="X"` attribute.
  5. Saves a screenshot of the viewport to `artifacts/a11y-screenshot.png`.
  6. Saves metadata JSON to `artifacts/a11y-candidates.json` containing:
     - `candidateId`
     - `selector`
     - `text`
     - `htmlSnippet`
  7. Outputs result paths.

### 4.3. Skill Documentation (`skills/a11y-heading-check/SKILL.md`)
* **Role**: Teaches coding agents to perform the audit.
* **Steps**:
  1. Validate that the current model has vision/multimodal capabilities (raise warning to user if not).
  2. Start the dev server of the app and run the script.
  3. Inspect `artifacts/a11y-screenshot.png` and read `artifacts/a11y-candidates.json`.
  4. Perform visual reasoning for each candidate:
     - Does it visually separate and introduce content?
     - If yes, is it lacking a semantic heading element?
  5. Modify the source code:
     - Convert tag to native `h1-h6` matching the visual hierarchy.
     - Keep CSS classes.
     - Use ARIA roles only as fallback.
  6. Re-run the script to verify.

---

## 5. Verification Plan

### Manual Verification
1. Run the React app.
2. Run `node skills/a11y-heading-check/a11y-check.js http://localhost:5173`.
3. Check generated `artifacts/a11y-screenshot.png` to confirm candidate borders are correctly overlaid.
4. Verify the agent successfully parses the screenshot, edits the files, and re-runs the tool.
5. Confirm the final check has `0` violations.
