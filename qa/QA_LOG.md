# Career Launchpad QA Matrix

Generated: 2026-09-02 19:16:26 -0600
Target: `file:///Users/danieltsao/Documents/ChatGPT/orientation%20project/index.html`
Result: **20/20 PASS**

## 01. Complete route — Application Developer — PASS
- inspect: fresh state exposes region-build-create → domain-software-apps → spec-code-build-uis
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Application Developer; exactly three rewards=Creativity, Software, Coder; no browser errors
- result: career=APPLICATION DEVELOPER; rewards=Creativity, Software, Coder
- duration: 6084 ms

## 02. Complete route — Software Engineer — PASS
- inspect: fresh state exposes region-build-create → domain-software-apps → spec-architect-software
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Software Engineer; exactly three rewards=Creativity, Software, Designer; no browser errors
- result: career=SOFTWARE ENGINEER; rewards=Creativity, Software, Designer
- duration: 6140 ms

## 03. Complete route — Cloud Engineer — PASS
- inspect: fresh state exposes region-build-create → domain-systems-tech → spec-deploy-cloud-platforms
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Cloud Engineer; exactly three rewards=Creativity, Hardware, Cloud Builder; no browser errors
- result: career=CLOUD ENGINEER; rewards=Creativity, Hardware, Cloud Builder
- duration: 6144 ms

## 04. Complete route — Systems Engineer — PASS
- inspect: fresh state exposes region-build-create → domain-systems-tech → spec-support-connected-systems
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Systems Engineer; exactly three rewards=Creativity, Hardware, Systems Thinker; no browser errors
- result: career=SYSTEMS ENGINEER; rewards=Creativity, Hardware, Systems Thinker
- duration: 5610 ms

## 05. Complete route — Data Analyst — PASS
- inspect: fresh state exposes region-analyze-solve → domain-data-insights → spec-explain-trends-data
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Data Analyst; exactly three rewards=Analyst, Numbers, Trendy; no browser errors
- result: career=DATA ANALYST; rewards=Analyst, Numbers, Trendy
- duration: 6135 ms

## 06. Complete route — Data Scientist — PASS
- inspect: fresh state exposes region-analyze-solve → domain-data-insights → spec-predict-outcomes-models
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Data Scientist; exactly three rewards=Analyst, Numbers, Fortune Teller; no browser errors
- result: career=DATA SCIENTIST; rewards=Analyst, Numbers, Fortune Teller
- duration: 3700 ms

## 07. Complete route — Cybersecurity Analyst — PASS
- inspect: fresh state exposes region-analyze-solve → domain-security-risk → spec-detect-investigate-threats
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Cybersecurity Analyst; exactly three rewards=Analyst, Hacker, Detective; no browser errors
- result: career=CYBERSECURITY ANALYST; rewards=Analyst, Hacker, Detective
- duration: 6158 ms

## 08. Complete route — IT Risk Analyst — PASS
- inspect: fresh state exposes region-analyze-solve → domain-security-risk → spec-evaluate-controls-risk
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=IT Risk Analyst; exactly three rewards=Analyst, Hacker, Bodyguard; no browser errors
- result: career=IT RISK ANALYST; rewards=Analyst, Hacker, Bodyguard
- duration: 6110 ms

## 09. Complete route — IT Project Manager — PASS
- inspect: fresh state exposes region-people-lead → domain-projects-delivery → spec-plan-timelines-delivery
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=IT Project Manager; exactly three rewards=People Skills, Speech, Logistical; no browser errors
- result: career=IT PROJECT MANAGER; rewards=People Skills, Speech, Logistical
- duration: 5601 ms

## 10. Complete route — Business Analyst — PASS
- inspect: fresh state exposes region-people-lead → domain-projects-delivery → spec-improve-processes-requirements
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Business Analyst; exactly three rewards=People Skills, Speech, Renovator; no browser errors
- result: career=BUSINESS ANALYST; rewards=People Skills, Speech, Renovator
- duration: 6111 ms

## 11. Complete route — UX Designer — PASS
- inspect: fresh state exposes region-people-lead → domain-users-products → spec-research-design-experiences
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=UX Designer; exactly three rewards=People Skills, Market Reach, Creative; no browser errors
- result: career=UX DESIGNER; rewards=People Skills, Market Reach, Creative
- duration: 6136 ms

## 12. Complete route — Product Manager — PASS
- inspect: fresh state exposes region-people-lead → domain-users-products → spec-set-strategy-prioritize-value
- action: start journey; skip each planned mini-game placeholder in order
- assert: career title=Product Manager; exactly three rewards=People Skills, Market Reach, Strategist; no browser errors
- result: career=PRODUCT MANAGER; rewards=People Skills, Market Reach, Strategist
- duration: 3828 ms

## 13. Desktop landing layout — PASS
- inspect: 1440×1000 landing screen, title, form, and avatar controls
- action: load fresh offline file and inspect bounding boxes
- assert: visible landing hierarchy, four avatars, and no horizontal overflow
- result: 1440px landing; four avatars; no horizontal overflow
- duration: 172 ms

## 14. Tablet map layout — PASS
- inspect: 900×900 map and computed responsive grid
- action: start journey at tablet viewport
- assert: three regions remain visible and stack into one column without overflow
- result: 900px tablet; map columns='235.656px 235.672px 235.672px'; three region columns remain readable
- duration: 1057 ms

## 15. Mobile route and layout — PASS
- inspect: 390×844 route screens and viewport dimensions
- action: complete a route through the mobile placeholders
- assert: challenge fits viewport, terminal career renders, three hexes remain visible, no overflow
- result: 390px mobile; challenge width=360px; terminal route works
- duration: 6062 ms

## 16. LocalStorage resume — PASS
- inspect: saved v1 state after first region reward
- action: close page, open a second page in the same browser context
- assert: map, player name, completed node, and reward survive reload
- result: persisted completed region, player name, and one skill across reload
- duration: 2844 ms

## 17. Restart confirmation and reset — PASS
- inspect: restart action and confirmation dialog after progress
- action: open restart, inspect copy, confirm restart
- assert: landing returns with empty name, empty stack, and cleared persisted progress
- result: confirmation dialog shown; restart cleared UI and localStorage
- duration: 4421 ms

## 18. Keyboard-only primary flow — PASS
- inspect: focusable form, map nodes, skip button, and state transitions
- action: type and activate controls with keyboard focus + Enter only
- assert: complete a full terminal route and earn three skills without pointer clicks
- result: name entry, three map transitions, and rewards completed through focus + Enter
- duration: 572 ms

## 19. Reduced-motion behavior — PASS
- inspect: prefers-reduced-motion media emulation and reward animation style
- action: complete first placeholder under reduced-motion context
- assert: media query is true and reward animation is effectively instantaneous
- result: prefers-reduced-motion=true; reward animation duration=1e-05s
- duration: 321 ms

## 20. Offline and external-request safety — PASS
- inspect: file URL, request log, and generated HTML dependency markers
- action: complete terminal route with request listener attached
- assert: no non-file requests, no script/link runtime dependencies, and route still functions
- result: terminal route completed from file:// with no external requests or linked runtime assets
- duration: 6059 ms
