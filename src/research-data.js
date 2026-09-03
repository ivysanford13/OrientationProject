/*
 * IS Career Launchpad — research and interview content
 *
 * This file is intentionally separate from the route data. It is an offline
 * content layer: the app may read it, but it never fetches these URLs at run
 * time. The questions and example answers are authored practice material; the
 * cited sources support the role framing and interview skills, not the exact
 * wording of any prompt.
 */

var CAREER_RESEARCH_DATA = {
  version: "1.0.0",
  accessed: "2026-09-03",
  sourceLedger: [
    {
      id: "src-bls-oews-methods",
      title: "Technical Notes for May 2023 OEWS Estimates",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes_tec.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: [
        "OEWS scope, cross-industry national coverage, and semiannual panel design",
        "Annual wage conversion convention of 2,080 hours where applicable",
        "Straight-time gross wage definition and exclusions",
        "Survey exclusions, including self-employed workers"
      ]
    },
    {
      id: "src-bls-software-developers",
      title: "Occupational Employment and Wages, May 2023: Software Developers (15-1252)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151252.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Software developer occupational definition", "National 10th, 25th, median, 75th, and 90th percentile wages"]
    },
    {
      id: "src-bls-network-architects",
      title: "Occupational Employment and Wages, May 2023: Computer Network Architects (15-1241)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151241.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Computer network architect occupational definition", "National percentile wages used as a cloud-engineering proxy"]
    },
    {
      id: "src-bls-systems-administrators",
      title: "Occupational Employment and Wages, May 2023: Network and Computer Systems Administrators (15-1244)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151244.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Systems administration occupational definition", "National percentile wages used as a systems-engineering entry proxy"]
    },
    {
      id: "src-bls-systems-analysts",
      title: "Occupational Employment and Wages, May 2023: Computer Systems Analysts (15-1211)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151211.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Computer systems analyst occupational definition", "National percentile wages used as a systems-engineering proxy"]
    },
    {
      id: "src-bls-operations-research",
      title: "Occupational Employment and Wages, May 2023: Operations Research Analysts (15-2031)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes152031.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Operations research analyst occupational definition", "National percentile wages used as a data-analyst proxy"]
    },
    {
      id: "src-bls-data-scientists",
      title: "Occupational Employment and Wages, May 2023: Data Scientists (15-2051)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes152051.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Data scientist occupational definition", "National percentile wages"]
    },
    {
      id: "src-bls-info-security",
      title: "Occupational Employment and Wages, May 2023: Information Security Analysts (15-1212)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151212.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Information security analyst occupational definition", "National percentile wages"]
    },
    {
      id: "src-bls-project-management",
      title: "Occupational Employment and Wages, May 2023: Project Management Specialists (13-1082)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes131082.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Project management specialist occupational definition", "National percentile wages used for IT project management and product management proxies"]
    },
    {
      id: "src-bls-management-analysts",
      title: "Occupational Employment and Wages, May 2023: Management Analysts (13-1111)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes131111.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Management analyst occupational definition", "National percentile wages used as a business-analyst proxy"]
    },
    {
      id: "src-bls-interface-designers",
      title: "Occupational Employment and Wages, May 2023: Web and Digital Interface Designers (15-1255)",
      publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/oes/2023/may/oes151255.htm",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Web and digital interface designer occupational definition", "National percentile wages used as a UX-designer proxy"]
    },
    {
      id: "src-microsoft-interview-tips",
      title: "Interview tips",
      publisher: "Microsoft Careers",
      url: "https://careers.microsoft.com/v2/global/en/hiring-tips/interview-tips.html",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Employer guidance to use specific examples", "Behavioral and competency-based interview framing", "STAR(R) structure, clear thinking, judgment, collaboration, and growth mindset"]
    },
    {
      id: "src-microsoft-technical-interview",
      title: "Technical interviews",
      publisher: "Microsoft Careers",
      url: "https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Technical interview emphasis on problem solving, assumptions, rationale, coding, and testing", "Considering security, edge cases, and error conditions"]
    },
    {
      id: "src-amazon-product-manager",
      title: "Product Manager Interview Prep",
      publisher: "Amazon Jobs",
      url: "https://amazon.jobs/content/en/how-we-hire/product-manager-interview-prep",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Product manager work across customers, requirements, delivery, and success metrics", "Behavioral, product-management, technical-depth, stakeholder-management, and writing competencies", "Using specific details, data, and STAR framing"]
    },
    {
      id: "src-microsoft-data-analyst",
      title: "Microsoft Certified: Power BI Data Analyst Associate",
      publisher: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Data analyst work prepares, models, visualizes, analyzes, and secures data", "Data analysts collaborate with business stakeholders and communicate actionable insights"]
    },
    {
      id: "src-nist-nice",
      title: "NICE Framework Work Role Videos",
      publisher: "National Institute of Standards and Technology",
      url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-work-role-videos",
      accessed: "2026-09-03",
      status: "verified",
      claimsSupported: ["Defensive cybersecurity analyzes data from defense tools to mitigate risks", "Incident response investigates, analyzes, and responds to network cybersecurity incidents"]
    }
  ],

  salaryContext: {
    title: "National salary context",
    dataset: "BLS Occupational Employment and Wage Statistics (OEWS), May 2023 national estimates",
    sourceRefs: ["src-bls-oews-methods"],
    geography: "United States, all covered industries",
    unit: "Annual gross straight-time wage in USD",
    entryProxy: "The displayed entry-level proxy is the BLS 10th-to-25th percentile annual wage band for the closest SOC occupation. It is a directional starting point, not a forecast, offer, or guaranteed minimum.",
    method: [
      "Use the 10th percentile as a lower national benchmark and the 25th percentile as an early-career benchmark.",
      "Use BLS annual figures directly; where BLS annualizes hourly pay, the convention is 2,080 hours.",
      "Map titles to a SOC occupation when the student-facing title has no single federal occupation code.",
      "Keep the national vintage visible because pay varies by location, employer, industry, experience, education, and title.",
      "Treat all figures as gross base wage context; OEWS excludes self-employed workers and does not describe total compensation."
    ],
    limitation: "A percentile band describes workers in an occupation, not newly graduated BYU IS students. Some mapped titles—especially cloud engineer, systems engineer, product manager, and application developer—span multiple occupations. Update the vintage before public release."
  },

  salaryByCareerId: {
    "application-developer": {
      title: "Application Developer",
      occupation: "Software Developers",
      soc: "15-1252",
      entryRange: { low: 77020, high: 101200, label: "$77,020–$101,200" },
      median: 132270,
      sourceRefs: ["src-bls-software-developers"],
      mapping: "Application developer is mapped to Software Developers because the profile emphasizes building, enhancing, and testing software applications.",
      proxyLimitations: "Application developer titles may include web developers, programmers, QA-focused roles, or lower-scope associate jobs; this proxy can overstate or understate a specific posting."
    },
    "software-engineer": {
      title: "Software Engineer",
      occupation: "Software Developers",
      soc: "15-1252",
      entryRange: { low: 77020, high: 101200, label: "$77,020–$101,200" },
      median: 132270,
      sourceRefs: ["src-bls-software-developers"],
      mapping: "Software engineer is mapped to Software Developers, the closest BLS category for designing, implementing, and maintaining software.",
      proxyLimitations: "Engineering level, specialty, location, and company size can move pay well outside this national band."
    },
    "cloud-engineer": {
      title: "Cloud Engineer",
      occupation: "Computer Network Architects",
      soc: "15-1241",
      entryRange: { low: 77960, high: 100120, label: "$77,960–$100,120" },
      median: 129840,
      sourceRefs: ["src-bls-network-architects"],
      mapping: "Cloud engineer is mapped to Computer Network Architects for its infrastructure, network design, capacity, and security overlap.",
      proxyLimitations: "Cloud engineering also overlaps systems administration, DevOps, software engineering, and site reliability engineering; network-architect wages often reflect experienced work."
    },
    "systems-engineer": {
      title: "Systems Engineer",
      occupation: "Network and Computer Systems Administrators",
      soc: "15-1244",
      entryRange: { low: 58680, high: 74400, label: "$58,680–$74,400" },
      median: 95360,
      sourceRefs: ["src-bls-systems-administrators"],
      mapping: "Systems engineer is mapped to Network and Computer Systems Administrators for its troubleshooting, configuration, monitoring, and availability overlap.",
      proxyLimitations: "Some systems-engineer jobs align more closely with Computer Systems Analysts or Network Architects, so the band is intentionally a conservative entry proxy."
    },
    "data-analyst": {
      title: "Data Analyst",
      occupation: "Operations Research Analysts",
      soc: "15-2031",
      entryRange: { low: 52930, high: 66250, label: "$52,930–$66,250" },
      median: 83640,
      sourceRefs: ["src-bls-operations-research"],
      mapping: "Data analyst is mapped to Operations Research Analysts because the BLS profile covers analyzing data and developing decision support for management.",
      proxyLimitations: "Business intelligence, market research, reporting, and financial analyst titles may map to different SOC categories and pay bands."
    },
    "data-scientist": {
      title: "Data Scientist",
      occupation: "Data Scientists",
      soc: "15-2051",
      entryRange: { low: 61070, high: 79810, label: "$61,070–$79,810" },
      median: 108020,
      sourceRefs: ["src-bls-data-scientists"],
      mapping: "Data scientist maps directly to the BLS Data Scientists occupation.",
      proxyLimitations: "Data scientist entry expectations vary widely; research-heavy roles may require graduate study while product analytics roles may resemble analyst work."
    },
    "cybersecurity-analyst": {
      title: "Cybersecurity Analyst",
      occupation: "Information Security Analysts",
      soc: "15-1212",
      entryRange: { low: 69210, high: 90050, label: "$69,210–$90,050" },
      median: 120360,
      sourceRefs: ["src-bls-info-security"],
      mapping: "Cybersecurity analyst maps directly to Information Security Analysts, whose BLS description includes monitoring protections, vulnerabilities, and breaches.",
      proxyLimitations: "SOC, GRC, IAM, incident-response, and security-engineering specialties can have different entry requirements and compensation."
    },
    "it-risk-analyst": {
      title: "IT Risk Analyst",
      occupation: "Information Security Analysts",
      soc: "15-1212",
      entryRange: { low: 69210, high: 90050, label: "$69,210–$90,050" },
      median: 120360,
      sourceRefs: ["src-bls-info-security"],
      mapping: "IT risk analyst uses Information Security Analysts as a security-controls and risk-advisory proxy.",
      proxyLimitations: "IT risk work can instead map to auditors, compliance analysts, management analysts, or financial examiners; this is not a direct title match."
    },
    "it-project-manager": {
      title: "IT Project Manager",
      occupation: "Project Management Specialists",
      soc: "13-1082",
      entryRange: { low: 57500, high: 74100, label: "$57,500–$74,100" },
      median: 98580,
      sourceRefs: ["src-bls-project-management"],
      mapping: "IT project manager maps to Project Management Specialists, covering schedules, staffing, budgets, technical teams, and client contact.",
      proxyLimitations: "Manager titles may reflect prior experience; entry roles may be project coordinator, PMO analyst, or implementation analyst and can pay differently."
    },
    "business-analyst": {
      title: "Business Analyst",
      occupation: "Management Analysts",
      soc: "13-1111",
      entryRange: { low: 57840, high: 74540, label: "$57,840–$74,540" },
      median: 99410,
      sourceRefs: ["src-bls-management-analysts"],
      mapping: "Business analyst maps to Management Analysts because the BLS profile covers organizational studies, systems, procedures, and efficiency work.",
      proxyLimitations: "Technology-focused business analysts may align with Computer Systems Analysts, while operations, finance, and consulting roles vary by industry."
    },
    "ux-designer": {
      title: "UX Designer",
      occupation: "Web and Digital Interface Designers",
      soc: "15-1255",
      entryRange: { low: 48210, high: 66020, label: "$48,210–$66,020" },
      median: 98540,
      sourceRefs: ["src-bls-interface-designers"],
      mapping: "UX designer maps to Web and Digital Interface Designers because the BLS profile includes interface usability, testing, navigation, and accessibility standards.",
      proxyLimitations: "UX research, service design, visual design, and product design may sit in different labor markets; portfolio quality and location matter greatly."
    },
    "product-manager": {
      title: "Product Manager",
      occupation: "Project Management Specialists",
      soc: "13-1082",
      entryRange: { low: 57500, high: 74100, label: "$57,500–$74,100" },
      median: 98580,
      sourceRefs: ["src-bls-project-management", "src-amazon-product-manager"],
      mapping: "Product manager has no single BLS occupation here; Project Management Specialists is used for delivery, coordination, and stakeholder overlap.",
      proxyLimitations: "Product management is a distinct, broad market with product strategy, discovery, analytics, and influence responsibilities; this proxy can materially understate or overstate pay."
    }
  },

  interviews: [
    {
      id: "interview-application-developer",
      careerId: "application-developer",
      title: "Application Developer interview practice",
      intro: "Practice explaining a small build, your debugging decisions, and the next technical skill you want to grow.",
      estimatedMinutes: 4,
      questionIds: ["appdev-q1-story", "appdev-q2-debug", "appdev-q3-next"],
      sourceRefs: ["src-bls-software-developers", "src-microsoft-interview-tips", "src-microsoft-technical-interview"],
      attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
      questions: [
        {
          id: "appdev-q1-story", step: 1, type: "experience",
          prompt: "Tell us about a small application, class project, or prototype you would be proud to explain.",
          helper: "Coursework and personal projects count. Give the context, your contribution, and what changed.", minWords: 20,
          criteria: [
            { id: "context", label: "Sets the context", signals: ["project", "app", "user", "problem"] },
            { id: "contribution", label: "Names their contribution", signals: ["built", "designed", "wrote", "implemented", "created"] },
            { id: "result", label: "Explains an outcome", signals: ["tested", "improved", "learned", "result", "working"] }
          ],
          guidance: "A strong answer gives the situation, your contribution, and what changed because of the work. A specific result or lesson is more useful than a list of technologies.",
          strongAnswer: "I built a small scheduling app for a class project. I translated the requirements into a simple form, wrote the validation, and tested it with classmates. Their feedback showed that the first flow was confusing, so I simplified it and documented the design decision.",
          sourceRefs: ["src-bls-software-developers", "src-microsoft-interview-tips"]
        },
        {
          id: "appdev-q2-debug", step: 2, type: "scenario",
          prompt: "A user reports that a form sometimes loses their work. What would you do first?",
          helper: "Describe your investigation before proposing a fix.", minWords: 18,
          criteria: [
            { id: "reproduce", label: "Reproduces or narrows the issue", signals: ["reproduce", "steps", "when", "browser", "input"] },
            { id: "evidence", label: "Uses evidence", signals: ["log", "error", "console", "test", "observe"] },
            { id: "communicate", label: "Communicates the next step", signals: ["user", "document", "team", "explain", "update"] }
          ],
          guidance: "Lead with a reproducible question, collect evidence, consider edge cases, and keep the user or team informed before changing production behavior.",
          strongAnswer: "I would ask for the steps, browser, and type of input that caused the loss, then try to reproduce it. I would inspect errors and add a focused test before changing the form. I would document what I found and explain the next step to the user and team.",
          sourceRefs: ["src-microsoft-technical-interview"]
        },
        {
          id: "appdev-q3-next", step: 3, type: "growth",
          prompt: "What is one technical skill you would practice next for this kind of role?",
          helper: "Connect one skill to a concrete project or practice loop.", minWords: 12,
          criteria: [
            { id: "skill", label: "Names a relevant skill", signals: ["javascript", "python", "sql", "testing", "git", "api", "programming"] },
            { id: "plan", label: "Names a practice plan", signals: ["build", "practice", "course", "project", "weekly", "read"] }
          ],
          guidance: "Name one skill and one small way you will practice it. A learning plan shows growth mindset without pretending you already know everything.",
          strongAnswer: "I would practice testing by adding unit tests to my next Python project. I would write one test for the expected behavior and one for an edge case, then use Git to track what I learned.",
          sourceRefs: ["src-microsoft-interview-tips", "src-microsoft-technical-interview"]
        }
      ]
    },
    {
      id: "interview-data-analyst",
      careerId: "data-analyst",
      title: "Data Analyst interview practice",
      intro: "Practice turning messy information into a trustworthy recommendation and explaining what you would learn next.",
      estimatedMinutes: 4,
      questionIds: ["data-q1-story", "data-q2-recommendation", "data-q3-next"],
      sourceRefs: ["src-bls-operations-research", "src-microsoft-data-analyst", "src-microsoft-interview-tips"],
      attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
      questions: [
        {
          id: "data-q1-story", step: 1, type: "experience",
          prompt: "Tell us about a time you used data to answer a question or make a recommendation.",
          helper: "A class analysis, club project, work task, or personal dataset is enough.", minWords: 20,
          criteria: [
            { id: "question", label: "Names the decision question", signals: ["question", "goal", "decide", "problem", "needed"] },
            { id: "method", label: "Explains the analysis", signals: ["clean", "filter", "query", "compare", "chart", "analy"] },
            { id: "insight", label: "Connects insight to action", signals: ["recommend", "found", "insight", "decision", "result", "next"] }
          ],
          guidance: "Make the chain visible: question, method, finding, and recommendation. Mention a data-quality check or limitation when you can.",
          strongAnswer: "For a class project, I analyzed survey responses to understand why students missed tutoring sessions. I cleaned duplicate rows, grouped responses by time of day, and charted attendance. Evening conflicts were the clearest pattern, so I recommended adding one late session and suggested testing that change for a month.",
          sourceRefs: ["src-microsoft-data-analyst", "src-microsoft-interview-tips"]
        },
        {
          id: "data-q2-recommendation", step: 2, type: "scenario",
          prompt: "A dashboard shows that a key metric fell sharply this week. How would you turn that signal into a useful recommendation?",
          helper: "Start with validation and context before explaining what a stakeholder should do.", minWords: 20,
          criteria: [
            { id: "validate", label: "Checks data quality and definition", signals: ["check", "validate", "definition", "refresh", "duplicate", "quality"] },
            { id: "segment", label: "Explores context or segments", signals: ["segment", "filter", "time", "group", "compare", "source"] },
            { id: "communicate", label: "Communicates an actionable next step", signals: ["recommend", "stakeholder", "explain", "action", "decision", "follow"] }
          ],
          guidance: "Separate a real change from a data issue, investigate meaningful slices, then communicate uncertainty and a small next action in plain language.",
          strongAnswer: "I would first confirm the metric definition, refresh status, and source data so I do not recommend action from a broken report. Then I would compare the drop by date, customer segment, and channel and look for a related operational change. I would share the likely explanation, the confidence and limitation, and a focused follow-up test with the stakeholder.",
          sourceRefs: ["src-microsoft-data-analyst", "src-microsoft-interview-tips"]
        },
        {
          id: "data-q3-next", step: 3, type: "growth",
          prompt: "What is one data skill you would practice next, and what would you build to show it?",
          helper: "Choose a small, finishable practice loop rather than a vague goal.", minWords: 12,
          criteria: [
            { id: "skill", label: "Names a relevant data skill", signals: ["sql", "excel", "power bi", "tableau", "python", "statistics", "visual"] },
            { id: "artifact", label: "Names a concrete artifact or practice", signals: ["dashboard", "project", "dataset", "query", "report", "notebook", "practice"] }
          ],
          guidance: "Pair one skill with an artifact someone else could inspect, such as an annotated dashboard, reproducible query, or short analysis memo.",
          strongAnswer: "I would practice SQL joins and validation by building a small analysis from two public datasets. I would publish the query, an annotated chart, and a short note explaining one limitation and one recommendation.",
          sourceRefs: ["src-microsoft-data-analyst", "src-microsoft-interview-tips"]
        }
      ]
    },
    {
      id: "interview-cybersecurity-analyst",
      careerId: "cybersecurity-analyst",
      title: "Cybersecurity Analyst interview practice",
      intro: "Practice investigating a signal carefully, communicating risk, and choosing a safe next step while you keep learning.",
      estimatedMinutes: 4,
      questionIds: ["cyber-q1-story", "cyber-q2-alert", "cyber-q3-next"],
      sourceRefs: ["src-bls-info-security", "src-nist-nice", "src-microsoft-interview-tips"],
      attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
      questions: [
        {
          id: "cyber-q1-story", step: 1, type: "experience",
          prompt: "Tell us about a time you noticed a security, privacy, or reliability concern and helped investigate it.",
          helper: "It can be a lab, class exercise, workplace task, or responsible personal project.", minWords: 20,
          criteria: [
            { id: "signal", label: "Describes the signal or risk", signals: ["alert", "risk", "suspicious", "security", "privacy", "issue"] },
            { id: "investigation", label: "Explains an evidence-based investigation", signals: ["log", "evidence", "check", "investigat", "compare", "trace"] },
            { id: "response", label: "Explains a safe response or lesson", signals: ["report", "document", "contain", "fix", "learned", "recommend"] }
          ],
          guidance: "Focus on curiosity, evidence, scope, and a responsible response. Do not include secrets or sensitive identifying details.",
          strongAnswer: "In a security lab, I noticed repeated failed logins from one address. I checked the timestamps and compared them with the normal activity in the sample logs instead of assuming compromise. I documented the pattern, recommended rate limiting and a password reset for the test account, and wrote down what evidence I would collect next.",
          sourceRefs: ["src-nist-nice", "src-microsoft-interview-tips"]
        },
        {
          id: "cyber-q2-alert", step: 2, type: "scenario",
          prompt: "A security tool flags a suspicious login from a new country. Walk through your first response.",
          helper: "Show how you balance urgency, evidence, user impact, and escalation.", minWords: 20,
          criteria: [
            { id: "triage", label: "Triages the alert with context", signals: ["verify", "context", "time", "device", "location", "log"] },
            { id: "protect", label: "Chooses a safe containment step", signals: ["contain", "disable", "reset", "revoke", "protect", "escalate"] },
            { id: "document", label: "Documents and communicates", signals: ["document", "ticket", "user", "team", "notify", "evidence"] }
          ],
          guidance: "A careful answer verifies context, follows the organization’s incident process, limits harm, and records what happened. Avoid claiming that location alone proves an attack.",
          strongAnswer: "I would verify the account, timestamp, device, authentication method, and related logs, then check whether the user is traveling or using an approved service. I would follow the incident playbook, escalate according to severity, and use a safe containment step such as revoking active sessions if policy allows. I would document the evidence and communicate clearly with the user and response team.",
          sourceRefs: ["src-nist-nice", "src-bls-info-security", "src-microsoft-technical-interview"]
        },
        {
          id: "cyber-q3-next", step: 3, type: "growth",
          prompt: "What is one cybersecurity skill you would practice next, and how would you practice it safely?",
          helper: "Choose a legal, isolated lab or project and name what you would record.", minWords: 12,
          criteria: [
            { id: "skill", label: "Names a relevant skill", signals: ["network", "linux", "log", "siem", "python", "identity", "incident", "security"] },
            { id: "safePlan", label: "Names a safe practice plan", signals: ["lab", "sandbox", "capture", "document", "practice", "course", "isolated"] }
          ],
          guidance: "Name a narrow skill and a permitted environment. Good growth plans include notes, evidence, and a reflection on limitations.",
          strongAnswer: "I would practice log analysis in an isolated lab using sample authentication events. I would write a small query or script to group failures by account and time, document the evidence that changed my hypothesis, and avoid using real credentials or scanning systems without permission.",
          sourceRefs: ["src-nist-nice", "src-microsoft-interview-tips"]
        }
      ]
    },
    {
      id: "interview-product-manager",
      careerId: "product-manager",
      title: "Product Manager interview practice",
      intro: "Practice connecting customer needs, evidence, tradeoffs, and delivery into a clear product decision.",
      estimatedMinutes: 4,
      questionIds: ["pm-q1-story", "pm-q2-prioritize", "pm-q3-next"],
      sourceRefs: ["src-amazon-product-manager", "src-microsoft-interview-tips"],
      attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
      questions: [
        {
          id: "pm-q1-story", step: 1, type: "experience",
          prompt: "Tell us about a time you helped a team choose what to do next when people wanted different things.",
          helper: "Use a class, club, volunteer, work, or personal project. Make your tradeoff visible.", minWords: 20,
          criteria: [
            { id: "context", label: "Sets the customer or team context", signals: ["user", "customer", "team", "project", "goal"] },
            { id: "tradeoff", label: "Explains a prioritization tradeoff", signals: ["priority", "tradeoff", "scope", "impact", "effort", "choose"] },
            { id: "outcome", label: "Shows an outcome or learning", signals: ["result", "launched", "learned", "feedback", "measure", "improved"] }
          ],
          guidance: "Show how you listened, made the decision legible, and learned from the outcome. You do not need formal product authority to demonstrate product thinking.",
          strongAnswer: "On a student event project, our team had requests for a new registration flow and more promotional features. I interviewed two organizers, compared expected attendee impact with the effort available, and prioritized the registration flow first. We launched on time, saw fewer incomplete forms, and kept the promotion ideas in a documented next-sprint list.",
          sourceRefs: ["src-amazon-product-manager", "src-microsoft-interview-tips"]
        },
        {
          id: "pm-q2-prioritize", step: 2, type: "scenario",
          prompt: "Engineering can deliver one of two requests this sprint: a frequently requested convenience feature or a reliability fix affecting fewer users. How would you decide?",
          helper: "Name the evidence, stakeholders, constraints, and follow-up measure you would use.", minWords: 22,
          criteria: [
            { id: "customer", label: "Clarifies customer and problem impact", signals: ["user", "customer", "problem", "severity", "impact"] },
            { id: "evidence", label: "Uses evidence and constraints", signals: ["data", "metric", "feedback", "effort", "risk", "capacity"] },
            { id: "decision", label: "Makes a decision and measurement plan", signals: ["choose", "prioritize", "decision", "measure", "success", "follow"] }
          ],
          guidance: "There is no universal feature-versus-reliability answer. Make your assumptions explicit, compare user and business impact with effort and risk, align with engineering, and define what you will measure.",
          strongAnswer: "I would clarify the reliability issue’s severity, affected workflows, and risk of leaving it unresolved, then compare that with the convenience feature’s reach and evidence of demand. I would ask engineering for effort and mitigation options and include support or customer feedback. If the reliability issue can cause data loss or blocks a key workflow, I would prioritize it, communicate the tradeoff, and measure incident rate and task completion before reconsidering the feature.",
          sourceRefs: ["src-amazon-product-manager", "src-microsoft-interview-tips"]
        },
        {
          id: "pm-q3-next", step: 3, type: "growth",
          prompt: "What is one product skill you would practice next, and what evidence would you collect?",
          helper: "Connect the skill to a small product artifact or conversation.", minWords: 12,
          criteria: [
            { id: "skill", label: "Names a relevant product skill", signals: ["research", "priorit", "analytics", "roadmap", "writing", "communication", "sql"] },
            { id: "evidence", label: "Names a practice artifact or evidence", signals: ["interview", "prototype", "case", "metric", "brief", "roadmap", "test"] }
          ],
          guidance: "Pick a skill that can become visible in a small artifact: an interview guide, opportunity brief, prioritization table, or measured prototype.",
          strongAnswer: "I would practice customer discovery by interviewing five students about one campus workflow, with permission and no sensitive information. I would synthesize repeated needs, write the assumptions and alternatives, and propose one small test with a success metric rather than jumping straight to a full feature.",
          sourceRefs: ["src-amazon-product-manager", "src-microsoft-interview-tips"]
        }
      ]
    }
  ]
};

/* These eight sets complete interview coverage for every career outcome. They
 * follow the same experience → scenario → growth pattern as the original four
 * sets so students can compare roles without facing a harder interview format. */
CAREER_RESEARCH_DATA.interviews.push(
  {
    id: "interview-software-engineer",
    careerId: "software-engineer",
    title: "Software Engineer interview practice",
    intro: "Practice explaining a team build, reasoning through a software problem, and choosing a skill to develop next.",
    estimatedMinutes: 4,
    questionIds: ["swe-q1-story", "swe-q2-bug", "swe-q3-next"],
    sourceRefs: ["src-bls-software-developers", "src-microsoft-interview-tips", "src-microsoft-technical-interview"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "swe-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a software project where you helped make the code more reliable or easier to use.",
        helper: "A class or personal project is enough. Explain the goal, your part, and what improved.", minWords: 20,
        criteria: [
          { id: "context", label: "Explains the project goal", signals: ["project", "goal", "user", "problem", "team"] },
          { id: "contribution", label: "Names a specific contribution", signals: ["built", "wrote", "implemented", "refactor", "tested", "designed"] },
          { id: "result", label: "Shows reliability or user impact", signals: ["reliable", "bug", "faster", "improved", "working", "feedback", "result"] }
        ],
        guidance: "Keep the story concrete: what the software needed to do, what you personally changed, and how you checked that the change helped.",
        strongAnswer: "In a team class project, our scheduling tool sometimes saved incomplete records. I traced the problem to missing validation, added checks and tests, and asked a teammate to review the change. The fix stopped the bad records in our test cases and made the error message clearer for users.",
        sourceRefs: ["src-bls-software-developers", "src-microsoft-interview-tips"]
      },
      {
        id: "swe-q2-bug", step: 2, type: "scenario",
        prompt: "A teammate's code works on their computer but fails in the shared project. What would you do?",
        helper: "Show how you investigate the difference and collaborate without blaming the teammate.", minWords: 18,
        criteria: [
          { id: "compare", label: "Compares environments and steps", signals: ["reproduce", "version", "environment", "dependency", "steps", "config"] },
          { id: "evidence", label: "Uses tests or error evidence", signals: ["error", "log", "test", "console", "output", "debug"] },
          { id: "collaborate", label: "Works with the teammate", signals: ["teammate", "pair", "review", "explain", "share", "document"] }
        ],
        guidance: "Compare inputs, versions, dependencies, and configuration; use the actual error to narrow the cause; then solve and document it together.",
        strongAnswer: "I would reproduce the same steps and compare our language version, dependencies, and configuration. I would read the failing test or error output before changing code. Then I would pair with my teammate on the smallest fix and document any setup change for the rest of the team.",
        sourceRefs: ["src-microsoft-technical-interview", "src-microsoft-interview-tips"]
      },
      {
        id: "swe-q3-next", step: 3, type: "growth",
        prompt: "What software engineering skill would you practice next, and how would you show your progress?",
        helper: "Pick one skill and one small, finishable project or practice routine.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names a relevant skill", signals: ["testing", "algorithm", "database", "api", "git", "design", "python", "java", "javascript"] },
          { id: "plan", label: "Names a concrete practice plan", signals: ["build", "project", "practice", "weekly", "test", "document", "course"] }
        ],
        guidance: "Choose a skill you can demonstrate through working code, tests, documentation, or a short explanation of your tradeoffs.",
        strongAnswer: "I would practice automated testing by adding unit and integration tests to a small API project. Each week I would cover one normal case and one failure case, track the work in Git, and write a short note about what each test protects.",
        sourceRefs: ["src-microsoft-interview-tips", "src-microsoft-technical-interview"]
      }
    ]
  },
  {
    id: "interview-cloud-engineer",
    careerId: "cloud-engineer",
    title: "Cloud Engineer interview practice",
    intro: "Practice explaining a deployment, responding calmly to an outage, and planning safe cloud practice.",
    estimatedMinutes: 4,
    questionIds: ["cloud-q1-story", "cloud-q2-outage", "cloud-q3-next"],
    sourceRefs: ["src-bls-network-architects", "src-microsoft-interview-tips", "src-microsoft-technical-interview"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "cloud-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a time you hosted, deployed, or configured a technical project.",
        helper: "A guided lab, class website, or personal project counts.", minWords: 18,
        criteria: [
          { id: "goal", label: "Explains what needed to run", signals: ["project", "website", "app", "service", "goal", "lab"] },
          { id: "setup", label: "Describes the setup work", signals: ["deploy", "host", "config", "server", "cloud", "network", "container"] },
          { id: "verify", label: "Explains how it was checked", signals: ["test", "monitor", "check", "working", "log", "verify"] }
        ],
        guidance: "Describe the service, the configuration you handled, and one check that showed the deployment was working.",
        strongAnswer: "For a class project, I hosted a small web app on a cloud service. I configured the environment variables, connected the database, and documented the deployment steps. I tested the main workflow from a new browser and checked the logs to confirm requests completed without errors.",
        sourceRefs: ["src-bls-network-architects", "src-microsoft-interview-tips"]
      },
      {
        id: "cloud-q2-outage", step: 2, type: "scenario",
        prompt: "A small website becomes unavailable right after a deployment. What would you do first?",
        helper: "Focus on evidence, a safe recovery step, and communication.", minWords: 20,
        criteria: [
          { id: "observe", label: "Checks scope and evidence", signals: ["status", "log", "error", "monitor", "health", "scope", "check"] },
          { id: "stabilize", label: "Chooses a safe recovery step", signals: ["rollback", "restore", "disable", "revert", "backup", "contain"] },
          { id: "communicate", label: "Communicates and documents", signals: ["user", "team", "update", "document", "incident", "notify"] }
        ],
        guidance: "Confirm impact, inspect recent changes and monitoring, restore service with the lowest-risk option, and keep the team informed.",
        strongAnswer: "I would confirm the outage from monitoring and check the deployment logs and health status to understand the scope. If the new release is the likely cause, I would follow the team's process to roll back to the last working version. I would update the team, document the timeline, and investigate the root cause after service is stable.",
        sourceRefs: ["src-microsoft-technical-interview", "src-microsoft-interview-tips"]
      },
      {
        id: "cloud-q3-next", step: 3, type: "growth",
        prompt: "What cloud skill would you practice next, and how would you keep the practice safe and affordable?",
        helper: "Name a lab-sized skill and how you would control access or cost.", minWords: 14,
        criteria: [
          { id: "skill", label: "Names a cloud or infrastructure skill", signals: ["aws", "azure", "cloud", "linux", "network", "docker", "terraform", "monitor"] },
          { id: "guardrail", label: "Names a safe practice guardrail", signals: ["budget", "alert", "sandbox", "free tier", "delete", "access", "limit", "lab"] }
        ],
        guidance: "A good plan combines hands-on practice with a cost limit, isolated account or lab, least-privilege access, and cleanup.",
        strongAnswer: "I would practice Docker and basic cloud deployment in a sandbox account. I would set a small budget alert, use only sample data, give the service minimal access, and delete the resources after each lab. I would keep the setup steps in a Git repository.",
        sourceRefs: ["src-microsoft-technical-interview", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-systems-engineer",
    careerId: "systems-engineer",
    title: "Systems Engineer interview practice",
    intro: "Practice telling a troubleshooting story, responding to a shared systems issue, and building hands-on technical range.",
    estimatedMinutes: 4,
    questionIds: ["systems-q1-story", "systems-q2-access", "systems-q3-next"],
    sourceRefs: ["src-bls-systems-administrators", "src-bls-systems-analysts", "src-microsoft-interview-tips", "src-microsoft-technical-interview"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "systems-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a time you troubleshot a device, network, or system that was not working.",
        helper: "Home, campus, work, and lab examples all count if you explain your reasoning.", minWords: 18,
        criteria: [
          { id: "symptom", label: "Describes the symptom and impact", signals: ["failed", "slow", "offline", "error", "issue", "could not", "problem"] },
          { id: "steps", label: "Explains ordered troubleshooting", signals: ["first", "then", "check", "test", "compare", "isolate", "restart"] },
          { id: "result", label: "Shares the result or lesson", signals: ["fixed", "restored", "working", "learned", "document", "result"] }
        ],
        guidance: "Show a calm sequence: observe the symptom, isolate one cause at a time, verify the result, and record what you learned.",
        strongAnswer: "A lab computer could reach local devices but not the internet. I first checked the cable and IP settings, then compared its gateway and DNS values with a working machine. Correcting the DNS setting restored access, and I documented the check so my group could repeat it.",
        sourceRefs: ["src-bls-systems-administrators", "src-microsoft-interview-tips"]
      },
      {
        id: "systems-q2-access", step: 2, type: "scenario",
        prompt: "Several people suddenly cannot sign in to a shared system. How would you start investigating?",
        helper: "Explain how you learn the scope, collect evidence, and keep people updated.", minWords: 20,
        criteria: [
          { id: "scope", label: "Checks who and what is affected", signals: ["user", "scope", "account", "device", "location", "all", "some"] },
          { id: "evidence", label: "Checks logs and recent changes", signals: ["log", "error", "change", "status", "test", "monitor", "time"] },
          { id: "response", label: "Escalates or communicates safely", signals: ["escalate", "team", "update", "ticket", "document", "notify", "workaround"] }
        ],
        guidance: "Determine whether the failure is individual or shared, check recent changes and service evidence, avoid risky guesses, and communicate status.",
        strongAnswer: "I would ask whether all users or only certain accounts and devices are affected and note when the failures began. I would check the identity service status, logs, and recent configuration changes, then test with an approved account. I would open or update the incident ticket and escalate with the evidence if the shared service is failing.",
        sourceRefs: ["src-bls-systems-administrators", "src-microsoft-technical-interview"]
      },
      {
        id: "systems-q3-next", step: 3, type: "growth",
        prompt: "What systems skill would you practice next, and what would you document?",
        helper: "Choose a safe lab and a specific artifact such as a setup guide or troubleshooting log.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names a systems skill", signals: ["linux", "windows", "network", "powershell", "python", "monitor", "identity", "hardware"] },
          { id: "artifact", label: "Names a practice artifact", signals: ["lab", "guide", "document", "diagram", "script", "checklist", "log", "project"] }
        ],
        guidance: "Make the learning visible with a repeatable setup guide, script, diagram, or troubleshooting journal.",
        strongAnswer: "I would practice Linux user and permission management in a local virtual-machine lab. I would create a checklist for adding and removing access, write a small verification script, and document one permission mistake and how I diagnosed it.",
        sourceRefs: ["src-bls-systems-administrators", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-data-scientist",
    careerId: "data-scientist",
    title: "Data Scientist interview practice",
    intro: "Practice explaining a model simply, questioning a promising result, and choosing a reproducible learning project.",
    estimatedMinutes: 4,
    questionIds: ["ds-q1-story", "ds-q2-model", "ds-q3-next"],
    sourceRefs: ["src-bls-data-scientists", "src-microsoft-data-analyst", "src-microsoft-interview-tips"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "ds-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a class or personal project where you used data to estimate or predict something.",
        helper: "A simple regression, classification, forecast, or even a careful baseline counts.", minWords: 20,
        criteria: [
          { id: "question", label: "Defines the prediction question", signals: ["predict", "estimate", "forecast", "question", "goal", "outcome"] },
          { id: "method", label: "Explains data and method", signals: ["data", "feature", "model", "regression", "classification", "train", "baseline"] },
          { id: "evaluate", label: "Evaluates or limits the result", signals: ["test", "accuracy", "error", "compare", "limit", "uncertain", "result"] }
        ],
        guidance: "Explain the question, the data and baseline or model, then how you evaluated it and what the result could not prove.",
        strongAnswer: "In a statistics class, I estimated apartment prices from size and location. I cleaned the sample, compared a simple average baseline with a regression model, and tested both on held-out rows. The model reduced average error, but I explained that our small local dataset would not generalize to every city.",
        sourceRefs: ["src-bls-data-scientists", "src-microsoft-interview-tips"]
      },
      {
        id: "ds-q2-model", step: 2, type: "scenario",
        prompt: "A model has high overall accuracy but performs poorly for one group. What would you do next?",
        helper: "Show how you verify the issue, investigate causes, and explain the risk.", minWords: 20,
        criteria: [
          { id: "verify", label: "Checks metrics by group", signals: ["group", "segment", "metric", "error", "compare", "validate", "check"] },
          { id: "investigate", label: "Investigates data or model causes", signals: ["sample", "bias", "feature", "data", "label", "distribution", "train"] },
          { id: "communicate", label: "Communicates risk and next step", signals: ["risk", "stakeholder", "explain", "limit", "recommend", "decision", "pause"] }
        ],
        guidance: "Do not hide behind one aggregate score. Compare appropriate metrics, inspect representation and labels, and make the limitation visible before use.",
        strongAnswer: "I would reproduce the group-level result and compare error types and sample sizes, not just overall accuracy. Then I would inspect whether the training data, labels, or features underrepresent that group. I would explain the risk to stakeholders and recommend pausing that use case or testing a safer alternative until performance is acceptable.",
        sourceRefs: ["src-bls-data-scientists", "src-microsoft-interview-tips"]
      },
      {
        id: "ds-q3-next", step: 3, type: "growth",
        prompt: "What data science skill would you practice next, and how would you make the work reproducible?",
        helper: "Pick one skill and a small project another student could rerun.", minWords: 14,
        criteria: [
          { id: "skill", label: "Names a data science skill", signals: ["statistics", "python", "machine learning", "model", "sql", "experiment", "visual"] },
          { id: "reproduce", label: "Plans a reproducible artifact", signals: ["notebook", "git", "readme", "dataset", "environment", "document", "rerun", "project"] }
        ],
        guidance: "A strong learning artifact includes the data source, repeatable steps, evaluation, and a short discussion of limitations.",
        strongAnswer: "I would practice model evaluation with a public dataset in a Python notebook. I would keep the code in Git, include the data source and environment instructions in a README, compare against a baseline, and write down the model's main limitation.",
        sourceRefs: ["src-bls-data-scientists", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-it-risk-analyst",
    careerId: "it-risk-analyst",
    title: "IT Risk Analyst interview practice",
    intro: "Practice explaining a control concern, turning evidence into a practical recommendation, and improving your risk toolkit.",
    estimatedMinutes: 4,
    questionIds: ["risk-q1-story", "risk-q2-access", "risk-q3-next"],
    sourceRefs: ["src-bls-info-security", "src-nist-nice", "src-microsoft-interview-tips"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "risk-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a time you noticed a process, privacy, or technology risk and suggested an improvement.",
        helper: "A class process, club workflow, work task, or lab example is enough.", minWords: 20,
        criteria: [
          { id: "risk", label: "Explains the risk and impact", signals: ["risk", "privacy", "access", "error", "miss", "impact", "problem"] },
          { id: "evidence", label: "Uses observations or evidence", signals: ["check", "evidence", "review", "compare", "record", "test", "observed"] },
          { id: "improve", label: "Suggests a practical improvement", signals: ["recommend", "change", "control", "checklist", "approve", "document", "improve"] }
        ],
        guidance: "Explain what could go wrong, what evidence you reviewed, and a proportional improvement rather than claiming zero risk.",
        strongAnswer: "Our club stored membership files in a folder that every volunteer could edit. I reviewed who actually needed access and found that most people only needed a summary. I recommended limiting edit access to two officers, sharing a separate view-only report, and checking access at the start of each semester.",
        sourceRefs: ["src-nist-nice", "src-microsoft-interview-tips"]
      },
      {
        id: "risk-q2-access", step: 2, type: "scenario",
        prompt: "A team cannot show that former employees lost access on time. How would you assess the risk?",
        helper: "Describe the evidence you need, how you explain impact, and how the team could improve.", minWords: 20,
        criteria: [
          { id: "evidence", label: "Requests relevant evidence", signals: ["list", "record", "ticket", "log", "sample", "date", "evidence", "access"] },
          { id: "risk", label: "Connects the gap to impact", signals: ["unauthorized", "data", "system", "risk", "impact", "account", "exposure"] },
          { id: "remediate", label: "Proposes ownership and follow-up", signals: ["owner", "deadline", "remove", "review", "control", "automate", "follow", "recommend"] }
        ],
        guidance: "Ask for a defined population and dated evidence, describe the plausible impact, and agree on a fix with an owner and verification step.",
        strongAnswer: "I would compare a dated list of departures with account and access records, then sample exceptions and review tickets or logs. I would explain that delayed removal could allow unauthorized access to company systems or data. I would recommend an owner, deadline, and automated removal or recurring review, then verify the control with a new sample.",
        sourceRefs: ["src-bls-info-security", "src-nist-nice"]
      },
      {
        id: "risk-q3-next", step: 3, type: "growth",
        prompt: "What IT risk skill would you practice next, and what artifact would you create?",
        helper: "Choose one control, framework, or evidence-review skill and make the output inspectable.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names a relevant risk skill", signals: ["control", "audit", "risk", "identity", "access", "framework", "evidence", "security"] },
          { id: "artifact", label: "Names a concrete artifact", signals: ["matrix", "checklist", "memo", "sample", "report", "map", "project", "document"] }
        ],
        guidance: "A small control matrix, evidence checklist, or one-page finding is better practice than a vague plan to learn compliance.",
        strongAnswer: "I would practice access-control testing by mapping one sample process to its risk, control, owner, and evidence. I would create a small control matrix, test a few fictional records, and write a one-page finding with the condition, impact, and recommendation.",
        sourceRefs: ["src-nist-nice", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-it-project-manager",
    careerId: "it-project-manager",
    title: "IT Project Manager interview practice",
    intro: "Practice organizing a student-sized project story, handling a scope change, and choosing a visible planning skill to build.",
    estimatedMinutes: 4,
    questionIds: ["itpm-q1-story", "itpm-q2-scope", "itpm-q3-next"],
    sourceRefs: ["src-bls-project-management", "src-microsoft-interview-tips"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "itpm-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a team project you helped keep organized and moving forward.",
        helper: "A class, club, volunteer, internship, or work project counts.", minWords: 20,
        criteria: [
          { id: "goal", label: "Sets the project goal", signals: ["project", "goal", "deadline", "deliver", "team"] },
          { id: "coordinate", label: "Explains how work was coordinated", signals: ["plan", "task", "schedule", "owner", "meeting", "track", "organize"] },
          { id: "result", label: "Shares an outcome or adjustment", signals: ["finished", "delivered", "result", "changed", "risk", "learned", "on time"] }
        ],
        guidance: "Show how you made the goal, owners, timing, or risks clearer—not just that you attended meetings.",
        strongAnswer: "For a class website project, our four-person team had three weeks to deliver a working prototype. I broke the work into weekly milestones, confirmed owners, and used a short status check to surface blockers. When one feature slipped, we reduced its scope and still delivered the core flow on time.",
        sourceRefs: ["src-bls-project-management", "src-microsoft-interview-tips"]
      },
      {
        id: "itpm-q2-scope", step: 2, type: "scenario",
        prompt: "A stakeholder asks for a major new feature one week before launch. How would you respond?",
        helper: "Make the goal, impact, options, and decision process clear.", minWords: 20,
        criteria: [
          { id: "clarify", label: "Clarifies the need and urgency", signals: ["ask", "goal", "need", "user", "why", "urgent", "value"] },
          { id: "impact", label: "Assesses scope and risk", signals: ["scope", "effort", "timeline", "risk", "capacity", "dependency", "estimate"] },
          { id: "decision", label: "Offers options and communicates", signals: ["option", "tradeoff", "defer", "choose", "decision", "document", "stakeholder"] }
        ],
        guidance: "Do not say yes or no immediately. Clarify value, ask the team for impact, present options, and record the agreed decision.",
        strongAnswer: "I would ask what user or business problem makes the feature urgent and what minimum outcome is needed. Then I would work with the team to estimate effort, dependencies, test time, and launch risk. I would present options such as a smaller version, moving the launch, or deferring the request, then document the stakeholder's decision and updated plan.",
        sourceRefs: ["src-bls-project-management", "src-microsoft-interview-tips"]
      },
      {
        id: "itpm-q3-next", step: 3, type: "growth",
        prompt: "What project-management skill would you practice next, and how would you demonstrate it?",
        helper: "Choose one planning or communication skill and one small artifact.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names a project skill", signals: ["scope", "risk", "schedule", "facilitat", "stakeholder", "agile", "planning", "communication"] },
          { id: "artifact", label: "Names evidence of practice", signals: ["plan", "timeline", "register", "brief", "retrospective", "project", "report", "meeting"] }
        ],
        guidance: "Create evidence a hiring manager can inspect: a timeline, risk register, decision log, or concise status update.",
        strongAnswer: "I would practice project risk management on my next team assignment. I would create a simple risk register with probability, impact, owner, and response, review it weekly with the team, and include the final lessons in a short retrospective.",
        sourceRefs: ["src-bls-project-management", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-business-analyst",
    careerId: "business-analyst",
    title: "Business Analyst interview practice",
    intro: "Practice clarifying an unclear process, handling conflicting requirements, and building an evidence-based analysis portfolio.",
    estimatedMinutes: 4,
    questionIds: ["ba-q1-story", "ba-q2-requirements", "ba-q3-next"],
    sourceRefs: ["src-bls-management-analysts", "src-bls-systems-analysts", "src-microsoft-interview-tips"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "ba-q1-story", step: 1, type: "experience",
        prompt: "Tell us about a process you helped make clearer, faster, or less confusing.",
        helper: "Think about a class team, club, work shift, application, or recurring task.", minWords: 20,
        criteria: [
          { id: "problem", label: "Explains the process problem", signals: ["process", "confusing", "delay", "duplicate", "error", "problem", "manual"] },
          { id: "learn", label: "Explains how needs were understood", signals: ["ask", "interview", "observe", "map", "feedback", "stakeholder", "review"] },
          { id: "result", label: "Shows the change and result", signals: ["changed", "improved", "reduced", "faster", "clear", "result", "measure"] }
        ],
        guidance: "Describe the current process, how you learned what people needed, and the improvement or next measurement.",
        strongAnswer: "Our club reimbursed expenses through email, and requests were often missing receipts. I asked the treasurer and two members where they got stuck and mapped the current steps. I created one form with required fields and a status column, which reduced follow-up messages and made ownership clearer.",
        sourceRefs: ["src-bls-management-analysts", "src-microsoft-interview-tips"]
      },
      {
        id: "ba-q2-requirements", step: 2, type: "scenario",
        prompt: "Two stakeholders give you conflicting requirements for the same workflow. What would you do?",
        helper: "Show how you uncover the underlying need and validate a shared requirement.", minWords: 20,
        criteria: [
          { id: "listen", label: "Clarifies both needs", signals: ["ask", "listen", "need", "goal", "why", "stakeholder", "workflow"] },
          { id: "compare", label: "Makes the conflict visible", signals: ["compare", "constraint", "tradeoff", "process", "priority", "impact", "rule"] },
          { id: "validate", label: "Documents and validates agreement", signals: ["document", "requirement", "confirm", "review", "approve", "prototype", "acceptance"] }
        ],
        guidance: "Translate positions into underlying goals, surface constraints and tradeoffs, then document a testable decision both stakeholders can review.",
        strongAnswer: "I would meet with each stakeholder to understand the goal behind the requested workflow and the constraint they are protecting. I would map where the requirements conflict and compare user impact, policy, and effort. Then I would draft a shared requirement with acceptance criteria or a simple prototype and ask both stakeholders to confirm it.",
        sourceRefs: ["src-bls-management-analysts", "src-bls-systems-analysts", "src-microsoft-interview-tips"]
      },
      {
        id: "ba-q3-next", step: 3, type: "growth",
        prompt: "What business-analysis skill would you practice next, and what would you add to a portfolio?",
        helper: "Choose a small artifact that shows how you think, not just a tool badge.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names an analysis skill", signals: ["requirements", "process", "sql", "facilitat", "diagram", "analysis", "stakeholder", "data"] },
          { id: "artifact", label: "Names a portfolio artifact", signals: ["map", "document", "case", "query", "prototype", "portfolio", "project", "before"] }
        ],
        guidance: "Good artifacts show the original problem, your questions, the decision, and the improved process or requirement.",
        strongAnswer: "I would practice process mapping by studying a campus appointment workflow. I would create a before-and-after diagram, list the stakeholder questions and assumptions, and write three testable requirements with acceptance criteria for my portfolio.",
        sourceRefs: ["src-bls-management-analysts", "src-microsoft-interview-tips"]
      }
    ]
  },
  {
    id: "interview-ux-designer",
    careerId: "ux-designer",
    title: "UX Designer interview practice",
    intro: "Practice connecting user evidence to a design change, responding to a usability problem, and planning a portfolio-ready study.",
    estimatedMinutes: 4,
    questionIds: ["ux-q1-story", "ux-q2-form", "ux-q3-next"],
    sourceRefs: ["src-bls-interface-designers", "src-microsoft-interview-tips"],
    attribution: "Questions and example answers are authored practice content. Sources support role and interview-skill framing; they do not publish these exact questions.",
    questions: [
      {
        id: "ux-q1-story", step: 1, type: "experience",
        prompt: "Tell us about something you designed or improved after getting feedback from users.",
        helper: "A slide, form, website, app, event, or service experience can work.", minWords: 20,
        criteria: [
          { id: "user", label: "Explains the user and need", signals: ["user", "student", "customer", "audience", "need", "problem"] },
          { id: "feedback", label: "Uses feedback or observation", signals: ["feedback", "test", "observe", "interview", "confusing", "research"] },
          { id: "iterate", label: "Explains the design change", signals: ["changed", "redesign", "iterate", "simplif", "prototype", "improved", "result"] }
        ],
        guidance: "Connect the user need to what you observed, what you changed, and what you learned after the change.",
        strongAnswer: "I designed a registration form for a student event. In a quick test, two students missed the deadline field because it looked like helper text. I increased its hierarchy, grouped related fields, and added a clear confirmation step. A second test showed that all participants could complete the form without help.",
        sourceRefs: ["src-bls-interface-designers", "src-microsoft-interview-tips"]
      },
      {
        id: "ux-q2-form", step: 2, type: "scenario",
        prompt: "Analytics show that many users leave halfway through an important form. How would you investigate?",
        helper: "Describe the evidence, the people you would learn from, and a small design test.", minWords: 20,
        criteria: [
          { id: "evidence", label: "Reviews behavior and context", signals: ["analytics", "step", "device", "error", "segment", "data", "funnel"] },
          { id: "research", label: "Learns from users", signals: ["user", "interview", "usability", "observe", "feedback", "test"] },
          { id: "iterate", label: "Tests an accessible improvement", signals: ["prototype", "change", "accessib", "label", "simplif", "measure", "compare"] }
        ],
        guidance: "Use analytics to locate the problem, observe representative users, check accessibility and error states, then test a focused change.",
        strongAnswer: "I would identify the exact step, devices, and error patterns where people leave. Then I would run a few usability sessions with representative users and check labels, keyboard access, validation, and screen-reader instructions. I would prototype the smallest likely improvement and compare completion and error rates before a full rollout.",
        sourceRefs: ["src-bls-interface-designers", "src-microsoft-interview-tips"]
      },
      {
        id: "ux-q3-next", step: 3, type: "growth",
        prompt: "What UX skill would you practice next, and what case-study evidence would you collect?",
        helper: "Choose a small research or design loop that can fit in a student portfolio.", minWords: 12,
        criteria: [
          { id: "skill", label: "Names a UX skill", signals: ["research", "usability", "prototype", "accessib", "interaction", "figma", "design", "information"] },
          { id: "evidence", label: "Names case-study evidence", signals: ["interview", "test", "finding", "iteration", "metric", "case study", "portfolio", "artifact"] }
        ],
        guidance: "Collect evidence across the loop: question, participant or context, observation, design decision, iteration, and limitation.",
        strongAnswer: "I would practice usability testing with a small campus website prototype. I would write a task, test it with five students, capture anonymized observations, revise one interaction, and show the before-and-after design plus the study limitation in a short case study.",
        sourceRefs: ["src-bls-interface-designers", "src-microsoft-interview-tips"]
      }
    ]
  }
);

/* Keep the flat authored fields convenient for content editing while also
 * exposing the rubric shape defined by the interaction spec. */
CAREER_RESEARCH_DATA.interviews.forEach(function (interview) {
  interview.questions.forEach(function (question) {
    question.rubric = {
      criteria: question.criteria,
      guidance: question.guidance,
      strongAnswer: question.strongAnswer
    };
  });
});
