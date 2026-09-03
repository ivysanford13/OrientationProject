# IS Career Launchpad research notes

Updated 2026-09-03. This note accompanies `src/research-data.js`, an offline content layer for the career result and four initial interview-practice paths.

## Attribution and method

Salary context uses the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) May 2023 national estimates. The entry-level proxy band is the published 10th-to-25th percentile annual wage range for the closest Standard Occupational Classification (SOC) occupation. BLS explains that OEWS covers wage and salary workers in nonfarm establishments across the United States, excludes self-employed workers, reports straight-time gross pay, and annualizes hourly wages using 2,080 hours when an annual figure is calculated. These are national occupational benchmarks, not individual offers; geography, employer, industry, experience, education, title, and total compensation can change the result.

Several student-facing titles do not have a one-to-one SOC category. The data therefore names the mapped occupation and gives a limitation for every career. Application Developer and Software Engineer share Software Developers; Cloud Engineer uses Computer Network Architects; Systems Engineer uses Network and Computer Systems Administrators; Data Analyst uses Operations Research Analysts; IT Risk Analyst uses Information Security Analysts; IT Project Manager and Product Manager use Project Management Specialists; Business Analyst uses Management Analysts; and UX Designer uses Web and Digital Interface Designers. Product manager is especially broad, so its band should be treated as a rough orientation only. Update the vintage before external publication.

The source ledger links directly to each BLS occupation page and its technical notes, plus official Microsoft Careers, Microsoft Learn, Amazon Jobs, and NIST resources. URLs are disclosures for a learner to inspect later; the offline app should not fetch them. A `verified` source means the page was checked on the access date, not that it publishes a promise about a student.

## Interview content

The four interview sets are deliberately short and deterministic: one experience/behavioral question, one role scenario or technical question, and one growth-plan question. Questions, rubric signals, guidance, and strong-answer examples are authored for incoming BYU Information Systems students. The official interview sources support useful practices such as specific examples, STAR-style structure, explaining assumptions and tradeoffs, testing, stakeholder communication, learning potential, and data-informed decisions. They do **not** claim to publish these exact prompts or answers. The app should label the rubric as transparent practice feedback, never as an AI score or a hiring prediction.

Cybersecurity examples use a legal, isolated-lab frame and avoid operational instructions that would encourage testing systems without permission. Data examples foreground validation, context, limitations, and communication rather than treating a chart as self-explanatory. Students may use coursework, clubs, volunteer work, or personal projects; no professional experience is required.
