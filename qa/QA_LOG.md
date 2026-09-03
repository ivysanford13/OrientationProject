# Career Launchpad QA Matrix

Generated: 2026-09-03 05:14:54 -0600
Target: `file:///Users/danieltsao/Documents/ChatGPT/orientation%20project/index.html`
Result: **32/32 PASS**

## 01. Complete route — Application Developer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-software-apps → spec-code-build-uis
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Application Developer; four starter + three rewards=Creativity, Software, Coder; rejected siblings stay locked
- result: career=APPLICATION DEVELOPER; 4 starter + rewards=Creativity, Software, Coder
- duration: 14798 ms

## 02. Complete route — Software Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-software-apps → spec-architect-software
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Software Engineer; four starter + three rewards=Creativity, Software, Designer; rejected siblings stay locked
- result: career=SOFTWARE ENGINEER; 4 starter + rewards=Creativity, Software, Designer; forced reroute from=spec-code-build-uis
- duration: 18029 ms

## 03. Complete route — Cloud Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-systems-tech → spec-deploy-cloud-platforms
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Cloud Engineer; four starter + three rewards=Creativity, Hardware, Cloud Builder; rejected siblings stay locked
- result: career=CLOUD ENGINEER; 4 starter + rewards=Creativity, Hardware, Cloud Builder; forced reroute from=domain-software-apps
- duration: 16711 ms

## 04. Complete route — Systems Engineer — PASS
- inspect: four-skill loadout recommends region-build-create → domain-systems-tech → spec-support-connected-systems
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Systems Engineer; four starter + three rewards=Creativity, Hardware, Systems Thinker; rejected siblings stay locked
- result: career=SYSTEMS ENGINEER; 4 starter + rewards=Creativity, Hardware, Systems Thinker; forced reroute from=domain-software-apps, spec-deploy-cloud-platforms
- duration: 21181 ms

## 05. Complete route — Data Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-data-insights → spec-explain-trends-data
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Data Analyst; four starter + three rewards=Analyst, Numbers, Trendy; rejected siblings stay locked
- result: career=DATA ANALYST; 4 starter + rewards=Analyst, Numbers, Trendy
- duration: 14869 ms

## 06. Complete route — Data Scientist — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-data-insights → spec-predict-outcomes-models
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Data Scientist; four starter + three rewards=Analyst, Numbers, Fortune Teller; rejected siblings stay locked
- result: career=DATA SCIENTIST; 4 starter + rewards=Analyst, Numbers, Fortune Teller; forced reroute from=spec-explain-trends-data
- duration: 12382 ms

## 07. Complete route — Cybersecurity Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-security-risk → spec-detect-investigate-threats
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Cybersecurity Analyst; four starter + three rewards=Analyst, Hacker, Detective; rejected siblings stay locked
- result: career=CYBERSECURITY ANALYST; 4 starter + rewards=Analyst, Hacker, Detective; forced reroute from=domain-data-insights
- duration: 18034 ms

## 08. Complete route — IT Risk Analyst — PASS
- inspect: four-skill loadout recommends region-analyze-solve → domain-security-risk → spec-evaluate-controls-risk
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=IT Risk Analyst; four starter + three rewards=Analyst, Hacker, Bodyguard; rejected siblings stay locked
- result: career=IT RISK ANALYST; 4 starter + rewards=Analyst, Hacker, Bodyguard; forced reroute from=domain-data-insights, spec-detect-investigate-threats
- duration: 19713 ms

## 09. Complete route — IT Project Manager — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-projects-delivery → spec-plan-timelines-delivery
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=IT Project Manager; four starter + three rewards=People Skills, Speech, Logistical; rejected siblings stay locked
- result: career=IT PROJECT MANAGER; 4 starter + rewards=People Skills, Speech, Logistical
- duration: 14066 ms

## 10. Complete route — Business Analyst — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-projects-delivery → spec-improve-processes-requirements
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Business Analyst; four starter + three rewards=People Skills, Speech, Renovator; rejected siblings stay locked
- result: career=BUSINESS ANALYST; 4 starter + rewards=People Skills, Speech, Renovator; forced reroute from=spec-plan-timelines-delivery
- duration: 18053 ms

## 11. Complete route — UX Designer — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-users-products → spec-research-design-experiences
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=UX Designer; four starter + three rewards=People Skills, Market Reach, Creative; rejected siblings stay locked
- result: career=UX DESIGNER; 4 starter + rewards=People Skills, Market Reach, Creative; forced reroute from=domain-projects-delivery
- duration: 18040 ms

## 12. Complete route — Product Manager — PASS
- inspect: four-skill loadout recommends region-people-lead → domain-users-products → spec-set-strategy-prioritize-value
- action: select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings
- assert: career title=Product Manager; four starter + three rewards=People Skills, Market Reach, Strategist; rejected siblings stay locked
- result: career=PRODUCT MANAGER; 4 starter + rewards=People Skills, Market Reach, Strategist; forced reroute from=domain-projects-delivery, spec-research-design-experiences
- duration: 15550 ms

## 13. Desktop landing layout — PASS
- inspect: 1440×1000 landing screen, title, form, and single cougar explorer
- action: load fresh offline file and inspect bounding boxes
- assert: visible landing hierarchy, one embedded cougar avatar, and no horizontal overflow
- result: 1440px landing; one embedded cougar explorer; exactly 10 skills with a four-choice cap; no overflow
- duration: 1235 ms

## 14. Tablet map layout — PASS
- inspect: 900×900 recommended RPG world, avatar, and skill HUD
- action: start journey at tablet viewport
- assert: focused world and four starter hexes remain readable without overflow
- result: 900px tablet; matched RPG world, avatar, and four-skill HUD visible
- duration: 5758 ms

## 15. Mobile route and layout — PASS
- inspect: 390×844 route screens and viewport dimensions
- action: choose four skills and complete a route through mobile placeholders and enjoyment checks
- assert: challenge fits viewport, terminal career renders, seven hexes remain accessible, no overflow
- result: 390px mobile; lower forks and avatar clear HUD; challenge width=360px
- duration: 15027 ms

## 16. LocalStorage resume — PASS
- inspect: saved v2 loadout, recommendation, and first region reward
- action: close page, open a second page in the same browser context
- assert: map, player name, four starters, completed node, and earned reward survive reload
- result: persisted completed region, player name, and one skill across reload
- duration: 8460 ms

## 17. Restart confirmation and reset — PASS
- inspect: restart action and confirmation dialog after progress
- action: open restart, inspect copy, confirm restart
- assert: landing returns with empty name, empty stack, and cleared persisted progress
- result: confirmation dialog shown; restart cleared UI and localStorage
- duration: 8442 ms

## 18. Keyboard-only primary flow — PASS
- inspect: focusable form, ten-skill loadout, world stops, placeholder, enjoyment, and state transitions
- action: type and activate all primary controls with keyboard focus + Enter only
- assert: complete a full terminal route with seven skills and no pointer clicks
- result: name entry, three map transitions, and rewards completed through focus + Enter
- duration: 4704 ms

## 19. Reduced-motion behavior — PASS
- inspect: prefers-reduced-motion media emulation and reward animation style
- action: complete first placeholder under reduced-motion context
- assert: media query is true and reward animation is effectively instantaneous
- result: prefers-reduced-motion=true; reward animation duration=1e-05s
- duration: 753 ms

## 20. Offline and external-request safety — PASS
- inspect: file URL, request log, and generated HTML dependency markers
- action: complete terminal route with request listener attached
- assert: no non-file requests, no script/link runtime dependencies, and route still functions
- result: terminal route completed from file:// with no external requests or linked runtime assets
- duration: 8903 ms

## 21. Resume unconfirmed four-skill loadout — PASS
- inspect: landing resume state after choosing four skills but leaving before world reveal
- action: choose four skills; go Back; select Resume
- assert: Resume initializes an active region and exactly one playable first stop
- result: Resume initialized region-build-create with one enabled first stop
- duration: 835 ms

## 22. Completed-node revisit integrity — PASS
- inspect: completed domain, earned reward, and rejected-route state
- action: complete a domain; revisit it; attempt the no-response path
- assert: completed and rejected remain mutually exclusive; earned/completed arrays do not mutate
- result: completed/rejected remained mutually exclusive and reward list was unchanged
- duration: 7171 ms

## 23. Exhausted sibling reroute — PASS
- inspect: Build and Create after both domain choices receive confirmed no-responses
- action: earn the region skill; reject Software and Apps; reject forced Systems and Tech
- assert: both domains remain closed, the earned skill remains saved, and the compass opens one viable first stop in another world
- result: both rejected domains stayed closed; earned skill stayed saved; compass opened region-analyze-solve with one forward route
- duration: 7372 ms

## 24. Reflection CTA dock clearance — PASS
- inspect: fixed HUD and both reflection choices at 320×568 and 390×844
- action: open the first reflection at each viewport and compare settled bounding boxes
- assert: skill dock has zero pixel overlap with both reflection choices
- result: reflection CTAs clear of dock at 320×568, 390×844
- duration: 8874 ms

## 25. Career CTA dock clearance — PASS
- inspect: fixed HUD and Start another path at 1440×900
- action: complete Application Developer route and compare settled bounding boxes
- assert: skill dock has zero pixel overlap with the career CTA
- result: 1440×900 career CTA has zero overlap with the skill dock
- duration: 8823 ms

## 26. Short-landscape map dock clearance — PASS
- inspect: fixed HUD and active map at 844×390 and 667×375
- action: advance to the domain fork and compare settled bounding boxes
- assert: skill dock has zero pixel overlap with the active RPG map
- result: active map clear of fixed dock at 844×390, 667×375
- duration: 8300 ms

## 27. Reflection narrow-screen reflow — PASS
- inspect: document and body widths on reflection at 320px and 390px
- action: open the first reflection and inspect horizontal scroll dimensions
- assert: document and body widths never exceed the viewport
- result: reflection reflows at 320px, 390px
- duration: 9932 ms

## 28. Starter-skill edit data-loss confirmation — PASS
- inspect: earned progress before entering the destructive loadout-edit flow
- action: select Edit starter skills; inspect warning; cancel
- assert: warning explains data loss and cancel preserves progress
- result: edit warning explained data loss and cancel preserved all journey progress
- duration: 3743 ms

## 29. Skill-card keyboard focus retention — PASS
- inspect: active element before and after keyboard selection of a starter skill
- action: focus one skill card and activate it with Enter
- assert: the acted skill remains selected and retains focus after rerender
- result: keyboard focus remained on starter-creative-thinking after selection
- duration: 850 ms

## 30. Skill dock accessible name — PASS
- inspect: rendered dock aria-labelledby references
- action: start a journey and resolve every referenced id in the DOM
- assert: each reference exists and contains accessible naming text
- result: skill dock accessible name resolves through skill-dock-title
- duration: 1013 ms

## 31. Malformed v2 storage recovery — PASS
- inspect: invalid selected career node and malformed earned entry
- action: inject each payload into localStorage and reload
- assert: app recovers to one rendered screen with no page or console errors
- result: invalid career node and malformed earned entry both recovered to a clean screen
- duration: 703 ms

## 32. Deterministic accessibility metrics — PASS
- inspect: edit and HUD touch targets, HUD text sizes, and coral career CTA contrast
- action: measure computed boxes, font sizes, and foreground/background luminance
- assert: targets >=44px; HUD labels >=10/8px; normal CTA text contrast >=4.5:1
- result: touch targets >=44px, HUD text >=10/8px, career CTA contrast=6.54:1
- duration: 6332 ms
