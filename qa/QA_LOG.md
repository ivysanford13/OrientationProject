# Career Launchpad QA Matrix

Generated: 2026-09-02 23:47:59 -0600
Target: `file:///Users/danieltsao/Documents/ChatGPT/orientation%20project/index.html`
Result: **20/20 PASS**

## 01. Complete route — Application Developer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-software-apps → spec-code-build-uis
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Application Developer; four starter + three rewards=Creativity, Software, Coder; rejected siblings stay locked
- result: career=APPLICATION DEVELOPER; 4 starter + rewards=Creativity, Software, Coder
- duration: 13888 ms

## 02. Complete route — Software Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-software-apps → spec-architect-software
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Software Engineer; four starter + three rewards=Creativity, Software, Designer; rejected siblings stay locked
- result: career=SOFTWARE ENGINEER; 4 starter + rewards=Creativity, Software, Designer; forced reroute from=spec-code-build-uis
- duration: 16440 ms

## 03. Complete route — Cloud Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-systems-tech → spec-deploy-cloud-platforms
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Cloud Engineer; four starter + three rewards=Creativity, Hardware, Cloud Builder; rejected siblings stay locked
- result: career=CLOUD ENGINEER; 4 starter + rewards=Creativity, Hardware, Cloud Builder; forced reroute from=domain-software-apps
- duration: 12200 ms

## 04. Complete route — Systems Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-systems-tech → spec-support-connected-systems
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Systems Engineer; four starter + three rewards=Creativity, Hardware, Systems Thinker; rejected siblings stay locked
- result: career=SYSTEMS ENGINEER; 4 starter + rewards=Creativity, Hardware, Systems Thinker; forced reroute from=domain-software-apps, spec-deploy-cloud-platforms
- duration: 19475 ms

## 05. Complete route — Data Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-data-insights → spec-explain-trends-data
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Data Analyst; four starter + three rewards=Analyst, Numbers, Trendy; rejected siblings stay locked
- result: career=DATA ANALYST; 4 starter + rewards=Analyst, Numbers, Trendy
- duration: 9210 ms

## 06. Complete route — Data Scientist — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-data-insights → spec-predict-outcomes-models
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Data Scientist; four starter + three rewards=Analyst, Numbers, Fortune Teller; rejected siblings stay locked
- result: career=DATA SCIENTIST; 4 starter + rewards=Analyst, Numbers, Fortune Teller; forced reroute from=spec-explain-trends-data
- duration: 17798 ms

## 07. Complete route — Cybersecurity Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-security-risk → spec-detect-investigate-threats
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Cybersecurity Analyst; four starter + three rewards=Analyst, Hacker, Detective; rejected siblings stay locked
- result: career=CYBERSECURITY ANALYST; 4 starter + rewards=Analyst, Hacker, Detective; forced reroute from=domain-data-insights
- duration: 17760 ms

## 08. Complete route — IT Risk Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-security-risk → spec-evaluate-controls-risk
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=IT Risk Analyst; four starter + three rewards=Analyst, Hacker, Bodyguard; rejected siblings stay locked
- result: career=IT RISK ANALYST; 4 starter + rewards=Analyst, Hacker, Bodyguard; forced reroute from=domain-data-insights, spec-detect-investigate-threats
- duration: 20912 ms

## 09. Complete route — IT Project Manager — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-projects-delivery → spec-plan-timelines-delivery
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=IT Project Manager; four starter + three rewards=People Skills, Speech, Logistical; rejected siblings stay locked
- result: career=IT PROJECT MANAGER; 4 starter + rewards=People Skills, Speech, Logistical
- duration: 12987 ms

## 10. Complete route — Business Analyst — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-projects-delivery → spec-improve-processes-requirements
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Business Analyst; four starter + three rewards=People Skills, Speech, Renovator; rejected siblings stay locked
- result: career=BUSINESS ANALYST; 4 starter + rewards=People Skills, Speech, Renovator; forced reroute from=spec-plan-timelines-delivery
- duration: 17868 ms

## 11. Complete route — UX Designer — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-users-products → spec-research-design-experiences
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=UX Designer; four starter + three rewards=People Skills, Market Reach, Creative; rejected siblings stay locked
- result: career=UX DESIGNER; 4 starter + rewards=People Skills, Market Reach, Creative; forced reroute from=domain-projects-delivery
- duration: 15419 ms

## 12. Complete route — Product Manager — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-users-products → spec-set-strategy-prioritize-value
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Product Manager; four starter + three rewards=People Skills, Market Reach, Strategist; rejected siblings stay locked
- result: career=PRODUCT MANAGER; 4 starter + rewards=People Skills, Market Reach, Strategist; forced reroute from=domain-projects-delivery, spec-research-design-experiences
- duration: 18564 ms

## 13. Desktop landing layout — PASS
- inspect: 1440×1000 landing screen, title, form, and avatar controls
- action: load fresh offline file and inspect bounding boxes
- assert: visible landing hierarchy, four avatars, and no horizontal overflow
- result: 1440px landing; four avatars; exactly 10 skills with a four-choice cap; no overflow
- duration: 4420 ms

## 14. Tablet map layout — PASS
- inspect: 900×900 recommended RPG world, avatar, and skill HUD
- action: start journey at tablet viewport
- assert: focused world and four starter hexes remain readable without overflow
- result: 900px tablet; matched RPG world, avatar, and four-skill HUD visible
- duration: 5722 ms

## 15. Mobile route and layout — PASS
- inspect: 390×844 route screens and viewport dimensions
- action: choose four skills and complete a route through mobile placeholders and enjoyment checks
- assert: challenge fits viewport, terminal career renders, seven hexes remain accessible, no overflow
- result: 390px mobile; lower forks and avatar clear HUD; challenge width=360px
- duration: 16204 ms

## 16. LocalStorage resume — PASS
- inspect: saved v2 loadout, recommendation, and first region reward
- action: close page, open a second page in the same browser context
- assert: map, player name, four starters, completed node, and earned reward survive reload
- result: persisted completed region, player name, and one skill across reload
- duration: 8493 ms

## 17. Restart confirmation and reset — PASS
- inspect: restart action and confirmation dialog after progress
- action: open restart, inspect copy, confirm restart
- assert: landing returns with empty name, empty stack, and cleared persisted progress
- result: confirmation dialog shown; restart cleared UI and localStorage
- duration: 9874 ms

## 18. Keyboard-only primary flow — PASS
- inspect: focusable form, ten-skill loadout, world stops, placeholder, enjoyment, and state transitions
- action: type and activate all primary controls with keyboard focus + Enter only
- assert: complete a full terminal route with seven skills and no pointer clicks
- result: name entry, three map transitions, and rewards completed through focus + Enter
- duration: 4619 ms

## 19. Reduced-motion behavior — PASS
- inspect: prefers-reduced-motion media emulation and reward animation style
- action: complete first placeholder under reduced-motion context
- assert: media query is true and reward animation is effectively instantaneous
- result: prefers-reduced-motion=true; reward animation duration=1e-05s
- duration: 558 ms

## 20. Offline and external-request safety — PASS
- inspect: file URL, request log, and generated HTML dependency markers
- action: complete terminal route with request listener attached
- assert: no non-file requests, no script/link runtime dependencies, and route still functions
- result: terminal route completed from file:// with no external requests or linked runtime assets
- duration: 12240 ms
