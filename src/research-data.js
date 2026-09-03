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
