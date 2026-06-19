---
name: zai-ui-ux
description: The ultimate master skill for UI/UX. Covers UX heuristics, 10/10 award-winning top design, web typography, motion UI, and micro-interactions.
---

# UI/UX Master Design Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. UX Core Heuristics (Foundation)
* **Visibility of System Status**: Users should always know what is happening (loading spinners, success toasts, progress bars).
* **Match Between System and Real World**: Use familiar language, iconography, and logical flows.
* **Consistency and Standards**: Keep navigation and layout patterns predictable. Do not reinvent the wheel for basic inputs.
* **Error Prevention & Recovery**: Prevent mistakes before they happen (disable buttons until valid) and offer easy, non-destructive recovery paths.

## 2. Refactoring UI & "Making Interfaces Feel Better"
* **Visual Hierarchy**: Use size, color, and contrast to guide the user's eye to the primary Call to Action (CTA) instantly.
* **Spacing & Whitespace**: Generous whitespace is the hallmark of premium design. Give elements room to breathe to reduce cognitive load.
* **Micro-interactions**: Design every state—hover, focus, active, loading, empty, and error. Interfaces should feel "alive" and responsive to touch.
* **Color Psychology**: Use intentional color palettes. Ensure high-contrast accessibility (WCAG 4.5:1). Avoid pure black (`#000000`) or pure white (`#ffffff`); use warm/cool off-variants (`#0a0a0a`, `#fafaf9`) to reduce eye strain.

## 3. Web Typography
* **Scale & Rhythm**: Use a minimum 10:1 display-to-body text ratio for a premium, editorial feel. 
* **Font Choice**: Avoid generic system fonts for primary headings. Pair highly legible body fonts (Inter, Roboto) with distinctive display fonts for headers (Space Grotesk, Instrument Serif, Outfit).
* **Line Height**: Use 1.5 - 1.6 for body text readability, and tighter spacing (1.1 - 1.2) for large headings to keep lines cohesive.

## 4. Top Design & 10/10 Aesthetics
* **The Signature Moment**: Design the "screenshot-worthy" moment first (e.g., a massive typography layout, a WebGL hero section, or a unique scroll animation).
* **Motion UI**: Motion is fundamental, not an afterthought. Never use default `linear` or `ease-in`. Always use custom easing curves (e.g., `cubic-bezier(0.16, 1, 0.3, 1)` for expo-out) and sequence animations with 80ms staggers.
* **Asymmetric Tension**: Center-aligning everything is safe but boring. Offset grids, bleed images off the screen, and create visual tension for high-end energy.
* **Liquid Glass / Glassmorphism**: When appropriate, use `backdrop-filter: blur()`, subtle 1px translucent borders, and soft gradient background meshes to create premium depth.

## 5. Execution & Workflows
* **Desktop vs Mobile**: Conceptualize desktop-first for ambition and visual impact, but strictly build mobile-first in code for performance and responsiveness.
* **Tools**: Figma, Framer, Lenis/Locomotive Scroll (for smooth scrolling), Tailwind CSS (for tokens).
