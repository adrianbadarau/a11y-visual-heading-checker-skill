# Design Spec: WCAG Interactive Name Checker Skill

This design specification outlines the plan to build an accessibility skill that enables AI coding assistants to identify and remediate WCAG 2.4.6 (Headings and Labels) and WCAG 2.5.3 (Label in Name) violations on interactive elements using visual grounding, browser automation, and LLM visual reasoning.

---

## 1. Goal & Context

Interactive elements (buttons, links, inputs) must have descriptive accessible names (WCAG 2.4.6) that align with any visual text they present (WCAG 2.5.3). If a button displays "USD" visually but has a programmatic name like `aria-label="Selector"`, speech-recognition users and screen reader users will experience failures.

This project will create:
1. **Interactive Name Checker Script**: A Playwright-based script that scans pages, identifies candidates with mismatching or overly generic programmatic names, outlines them, and outputs an annotated screenshot and metadata JSON.
2. **Interactive Name Checker Skill (`SKILL.md`)**: Instructs AI agents on how to execute the script, analyze the visual context of candidates, and apply descriptive name fixes in code.
3. **Testbed Violations**: Added to the existing `travel-app` (React/Vite) to serve as validation cases.

---

## 2. Directory & Repository Structure

We will structure the new skill next to the existing heading check skill:

```
a11y-skills/
├── apps/
│   └── travel-app/                     # Travel app testbed
├── skills/
│   ├── a11y-heading-check/             # Heading checker skill (existing)
│   └── a11y-interactive-name-check/    # New interactive name checker skill
│       ├── a11y-check.js               # Candidate finder script
│       ├── SKILL.md                    # Agent instructions
│       └── package.json                # Dependencies (Playwright)
└── docs/
    └── superpowers/specs/              # Design specifications
```

---

## 3. System Architecture

```mermaid
graph TD
    subgraph apps/travel-app (React/Vite)
        App[Wanderlust Destinations]
        V1[Currency Button: USD with Selector label]
        V2[Search Button: Icon with Button label]
        V3[Details Link: Learn More with Link label]
    end

    subgraph skills/a11y-interactive-name-check
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
    Browser -->|Inspect DOM & Identify Mismatches| Browser
    Browser -->|Save Annotated Screenshot| Artifacts
    Browser -->|Save Metadata JSON| Artifacts
    Agent -->|Inspect visual context| Artifacts
    Agent -->|Edit source code with descriptive name| App
```

---

## 4. Component Details

### 4.1. Travel App Testbed Additions
We will add three interactive elements in `apps/travel-app/src/App.jsx` to test the skill:
1. **Currency Button**: `<button aria-label="Selector" className="currency-select-btn">USD</button>`
   - *Issue*: "Selector" is generic (2.4.6) and doesn't match/contain the visual text "USD" (2.5.3).
2. **Search Button**: `<button aria-label="Button" className="search-btn">🔍</button>`
   - *Issue*: "Button" is generic (2.4.6) for an icon-only search button.
3. **Details Link**: `<a href="#details" aria-label="Link" className="details-link">Learn More</a>`
   - *Issue*: "Link" is generic (2.4.6).

### 4.2. Candidate Finder Script (`skills/a11y-interactive-name-check/a11y-check.js`)
* **Execution**: `node skills/a11y-interactive-name-check/a11y-check.js <url>`
* **Logic**:
  1. Launch Chromium via Playwright.
  2. Navigate to `<url>` and wait for load.
  3. Query interactive elements (`button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="combobox"], [role="menuitem"], [role="tab"]`).
  4. Filter to find candidates:
     - **Visual Text**: Extracted via `element.innerText`/`textContent`, `value` (for inputs), or associated `<label>` text.
     - **Programmatic Name**: Extracted from `aria-label`, resolved `aria-labelledby`, or `title`.
     - **WCAG 2.5.3 Violation**: Visual Text and Programmatic Name are both present, but the Programmatic Name does *not* contain the Visual Text (case-insensitive, ignoring spacing).
     - **WCAG 2.4.6 Violation**: Programmatic Name matches a blacklist of generic words: `['selector', 'button', 'link', 'click', 'click here', 'more', 'read more', 'go', 'action', 'press', 'menu', 'close', 'open']`.
  5. For each candidate:
     - Apply orange border (`2px solid #f97316`) and background tint.
     - Place numbered badge `[X]` at top-left.
     - Add `data-a11y-interactive-candidate="X"`.
  6. Save `artifacts/a11y-interactive-screenshot.png` and `artifacts/a11y-interactive-candidates.json`.

### 4.3. Skill Documentation (`skills/a11y-interactive-name-check/SKILL.md`)
* **Role**: Directs AI agents to audit interactive names.
* **Steps**:
  1. Validate visual/multimodal agent capability.
  2. Run the candidate finder script.
  3. Load the candidate JSON and view the annotated screenshot.
  4. Perform visual reasoning for each candidate:
     - Observe the surrounding layout to understand the purpose of the control.
     - Compare the programmatic name to the visual text.
     - Propose a descriptive, WCAG-compliant name (e.g. `aria-label="Currency: USD"` or `aria-label="Search destinations"`).
  5. Edit the source code to apply the fix.
  6. Re-run and verify the candidate list is clear.

---

## 5. Verification Plan

### Manual Verification
1. Run the `travel-app` dev server.
2. Run `node skills/a11y-interactive-name-check/a11y-check.js http://localhost:5173`.
3. Verify that `artifacts/a11y-interactive-screenshot.png` shows orange highlights on the three test elements.
4. Verify that `artifacts/a11y-interactive-candidates.json` lists all three candidates.
5. Verify that editing the travel app code resolves the candidates in the re-run report.
