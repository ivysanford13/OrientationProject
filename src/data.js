/*
 * Information Systems Career Launchpad data
 *
 * This file is intentionally the single source of truth for the map.  Mini-games
 * are currently placeholders; each placeholder has a stable id and metadata so a
 * future game can replace it without changing the progression state machine.
 */

/**
 * @typedef {Object} EarnedSkill
 * @property {string} id Stable skill id used by the skill-stack renderer.
 * @property {string} label Student-facing skill label.
 * @property {string} category Foundation, domain, or specialization skill.
 */

/**
 * @typedef {Object} MiniGamePlan
 * @property {string} id Stable mini-game id.
 * @property {string} title Planned game title.
 * @property {string} concept One-sentence description of the future interaction.
 * @property {number} durationSeconds Target play time for the future game.
 * @property {string} instructions Placeholder instructions shown before implementation.
 * @property {"planned"|"ready"} status Implementation status.
 * @property {string} visualType Renderer hint for the future game workspace.
 */

/**
 * @typedef {Object} MapNode
 * @property {string} id Stable map-node id.
 * @property {1|2|3} tier 1 = region, 2 = domain, 3 = specialization/career match.
 * @property {string|null} parentId Parent map-node id, or null for a region.
 * @property {string} title Map title.
 * @property {string} subtitle Short map label.
 * @property {string} description Student-facing explanation.
 * @property {string} color Hex color token for the branch.
 * @property {string} theme Theme name used by the visual renderer.
 * @property {EarnedSkill} earnedSkill Skill awarded when the placeholder is skipped/completed.
 * @property {MiniGamePlan} miniGame Planned mini-game metadata.
 * @property {string|null} careerId Career-result id for tier-three nodes.
 */

/**
 * @typedef {Object} CareerProfile
 * @property {string} id Stable career id.
 * @property {string} title Exact career title shown in the result card.
 * @property {string} summary Editable role summary.
 * @property {string[]} dayToDay Typical day-to-day responsibilities.
 * @property {string[]} typicalProjects Example projects to expand with research later.
 * @property {string[]} workSettings Places this role commonly works.
 * @property {string[]} industries Example industries.
 * @property {string[]} companyTypes Example employer types.
 * @property {string[]} technicalSkills Technical preparation areas.
 * @property {string[]} toolsAndTechnologies Tools to verify and expand through research.
 * @property {string[]} entryLevelNeeds Editable preparation checklist.
 * @property {{status:string,range:string|null,source:string|null,note:string}} salary Salary is intentionally unresearched in v1.
 * @property {string[]} careerGrowth Potential next steps.
 * @property {{skills:string[],experience:string[],projects:string[],certifications:string[]}} strongCandidate Candidate profile fields.
 * @property {string[]} sourceRefs Source-ledger ids to add when research is completed.
 * @property {"research-pending"|"researched"} researchStatus Content research status.
 */

/** @param {string} id @param {string} label @param {string} category @param {string} badgeIcon */
function makeSkill(id, label, category, badgeIcon) {
  return { id, label, category, badgeIcon };
}

/**
 * @param {string} id
 * @param {string} title
 * @param {string} concept
 * @param {string} visualType
 * @param {string} instructions
 * @returns {MiniGamePlan}
 */
function makeMiniGame(id, title, concept, visualType, instructions) {
  return {
    id,
    title,
    concept,
    durationSeconds: 60,
    instructions,
    status: "planned",
    visualType,
  };
}

/**
 * @param {Object} input
 * @param {string} input.id
 * @param {1|2|3} input.tier
 * @param {string|null} input.parentId
 * @param {string} input.title
 * @param {string} input.subtitle
 * @param {string} input.description
 * @param {string} input.color
 * @param {string} input.theme
 * @param {Object} [input.scene] Data-driven art direction for top-level worlds.
 * @param {EarnedSkill} input.earnedSkill
 * @param {MiniGamePlan} input.miniGame
 * @param {string|null} [input.careerId]
 * @returns {MapNode}
 */
function makeNode(input) {
  return {
    id: input.id,
    tier: input.tier,
    parentId: input.parentId,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    color: input.color,
    theme: input.theme,
    scene: input.scene || null,
    earnedSkill: input.earnedSkill,
    miniGame: input.miniGame,
    careerId: input.careerId || null,
  };
}

const SKILLS = {
  creativity: makeSkill("creativity", "Creativity", "foundation", "lightbulb"),
  software: makeSkill("software", "Software", "domain", "globe"),
  coder: makeSkill("coder", "Coder", "specialization", "code-monitor"),
  designer: makeSkill("designer", "Designer", "specialization", "pencil"),
  hardware: makeSkill("hardware", "Hardware", "domain", "monitor"),
  cloudBuilder: makeSkill("cloud-builder", "Cloud Builder", "specialization", "rocket"),
  systemsThinker: makeSkill("systems-thinker", "Systems Thinker", "specialization", "network"),
  analyst: makeSkill("analyst", "Analyst", "foundation", "gears"),
  numbers: makeSkill("numbers", "Numbers", "domain", "numbers"),
  trendy: makeSkill("trendy", "Trendy", "specialization", "camera"),
  fortuneTeller: makeSkill("fortune-teller", "Fortune Teller", "specialization", "crystal"),
  hacker: makeSkill("hacker", "Hacker", "domain", "laptop"),
  detective: makeSkill("detective", "Detective", "specialization", "magnifier"),
  bodyguard: makeSkill("bodyguard", "Bodyguard", "specialization", "shield"),
  peopleSkills: makeSkill("people-skills", "People Skills", "foundation", "handshake"),
  speech: makeSkill("speech", "Speech", "domain", "microphone"),
  logistical: makeSkill("logistical", "Logistical", "specialization", "boxes"),
  renovator: makeSkill("renovator", "Renovator", "specialization", "ruler-pencil"),
  marketReach: makeSkill("market-reach", "Market Reach", "domain", "globe"),
  creative: makeSkill("creative", "Creative", "specialization", "lightbulb"),
  strategist: makeSkill("strategist", "Strategist", "specialization", "chess"),
};

const COLORS = {
  build: "#2f6fed",
  buildLight: "#8bbcff",
  analyze: "#7c3aed",
  analyzeLight: "#c4b5fd",
  people: "#059669",
  peopleLight: "#6ee7b7",
};

/**
 * Art direction for each world.  This stays content-owned so the renderer can
 * add a new region without growing a second, hard-coded map implementation.
 * Landmark types are intentionally small CSS/SVG-like primitives: the bundle
 * remains offline and future art can replace one landmark independently.
 */
const WORLD_SCENES = {
  "build-create": {
    sky: "#9ed8eb",
    horizon: "#a4d477",
    terrain: "#347c51",
    mountain: "#6d8fa5",
    sun: "#ffb647",
    haze: "#d9f4ef",
    accent: COLORS.build,
    paths: {
      0: "M80 360 C180 408 306 390 398 302 S500 244 580 224",
      1: "M80 360 C170 392 240 350 290 286 M290 286 C430 212 520 182 720 150 M290 286 C415 318 545 382 720 390",
      2: "M80 360 C170 390 236 350 276 298 C350 282 408 286 472 276 M472 276 C570 222 642 181 750 150 M472 276 C580 308 658 358 750 390",
    },
    landmarks: [
      { type: "workshop", x: 28, y: 44, label: "Maker's workshop" },
      { type: "circuit", x: 52, y: 27, label: "Signal ridge" },
      { type: "crane", x: 80, y: 45, label: "Build yard" },
    ],
  },
  "analyze-solve": {
    sky: "#ada9e4",
    horizon: "#c7bd81",
    terrain: "#5c587f",
    mountain: "#595678",
    sun: "#f9cf71",
    haze: "#e5e2ff",
    accent: COLORS.analyze,
    paths: {
      0: "M80 360 C176 318 252 174 390 214 S508 306 580 224",
      1: "M80 360 C150 330 188 246 244 214 M244 214 C354 164 482 194 544 274 M544 274 C602 338 660 292 720 150 M244 214 C360 296 438 374 720 390",
      2: "M80 360 C148 334 188 270 232 232 C300 190 360 204 414 246 M414 246 C500 314 564 342 618 266 M618 266 C674 216 706 176 750 150 M414 246 C520 220 622 300 750 390",
    },
    landmarks: [
      { type: "observatory", x: 26, y: 43, label: "Evidence observatory" },
      { type: "chart", x: 54, y: 28, label: "Pattern archive" },
      { type: "beacon", x: 81, y: 45, label: "Risk beacon" },
    ],
  },
  "people-lead": {
    sky: "#a7dfe2",
    horizon: "#d5bd7d",
    terrain: "#4f9b78",
    mountain: "#618998",
    sun: "#ffd071",
    haze: "#e7f7e7",
    accent: COLORS.people,
    paths: {
      0: "M80 360 C202 432 336 432 448 350 S520 265 580 224",
      1: "M80 360 C192 424 284 410 344 334 M344 334 C442 222 586 214 720 150 M344 334 C470 352 578 418 720 390",
      2: "M80 360 C174 420 266 420 324 362 C380 304 414 288 472 276 M472 276 C562 222 660 196 750 150 M472 276 C574 328 642 410 750 390",
    },
    landmarks: [
      { type: "pavilion", x: 27, y: 44, label: "Team pavilion" },
      { type: "bridge", x: 53, y: 28, label: "Commons bridge" },
      { type: "plaza", x: 81, y: 45, label: "People's plaza" },
    ],
  },
};

/**
 * The ten self-assessment skills shown before the world map. Each choice has
 * a small affinity score for the three top-level regions. The controller adds
 * the scores for the four selected skills and recommends the strongest match.
 * Keeping the weights here makes the recommendation easy to tune without
 * changing application behavior.
 */
const STARTER_SKILLS = [
  {
    id: "starter-creative-thinking",
    label: "Creative Thinking",
    shortName: "Creative",
    description: "I enjoy imagining new ways something could work.",
    glyph: "✦",
    badgeIcon: "lightbulb",
    color: "#f6b347",
    category: "starter",
    affinities: { "region-build-create": 3, "region-analyze-solve": 1, "region-people-lead": 1 },
  },
  {
    id: "starter-coding-curiosity",
    label: "Coding Curiosity",
    shortName: "Coding",
    description: "I like learning how instructions become working software.",
    glyph: "</>",
    badgeIcon: "code-monitor",
    color: "#49cfe0",
    category: "starter",
    affinities: { "region-build-create": 3, "region-analyze-solve": 1, "region-people-lead": 0 },
  },
  {
    id: "starter-hands-on-tech",
    label: "Hands-on Tech",
    shortName: "Tech",
    description: "I enjoy setting up, fixing, and understanding devices.",
    glyph: "⚙",
    badgeIcon: "monitor",
    color: "#7da8ff",
    category: "starter",
    affinities: { "region-build-create": 3, "region-analyze-solve": 1, "region-people-lead": 0 },
  },
  {
    id: "starter-visual-design",
    label: "Visual Design",
    shortName: "Design",
    description: "I notice how layout, color, and flow shape an experience.",
    glyph: "◈",
    badgeIcon: "pencil",
    color: "#f49ac2",
    category: "starter",
    affinities: { "region-build-create": 2, "region-analyze-solve": 0, "region-people-lead": 2 },
  },
  {
    id: "starter-numbers-patterns",
    label: "Numbers & Patterns",
    shortName: "Patterns",
    description: "I like spotting trends and making sense of data.",
    glyph: "▥",
    badgeIcon: "numbers",
    color: "#a98df4",
    category: "starter",
    affinities: { "region-build-create": 0, "region-analyze-solve": 3, "region-people-lead": 1 },
  },
  {
    id: "starter-problem-solving",
    label: "Problem Solving",
    shortName: "Solve",
    description: "I enjoy breaking a difficult problem into smaller clues.",
    glyph: "?",
    badgeIcon: "gears",
    color: "#8870e8",
    category: "starter",
    affinities: { "region-build-create": 1, "region-analyze-solve": 3, "region-people-lead": 1 },
  },
  {
    id: "starter-security-mindset",
    label: "Security Mindset",
    shortName: "Security",
    description: "I naturally look for risks, weak points, and safeguards.",
    glyph: "◇",
    badgeIcon: "shield",
    color: "#ef7d78",
    category: "starter",
    affinities: { "region-build-create": 1, "region-analyze-solve": 3, "region-people-lead": 0 },
  },
  {
    id: "starter-communication",
    label: "Communication",
    shortName: "Speak",
    description: "I like making ideas clear for other people.",
    glyph: "“”",
    badgeIcon: "microphone",
    color: "#5ed4a2",
    category: "starter",
    affinities: { "region-build-create": 0, "region-analyze-solve": 1, "region-people-lead": 3 },
  },
  {
    id: "starter-leadership",
    label: "Leadership",
    shortName: "Lead",
    description: "I enjoy organizing a group around a shared goal.",
    glyph: "▲",
    badgeIcon: "chess",
    color: "#31b98d",
    category: "starter",
    affinities: { "region-build-create": 0, "region-analyze-solve": 1, "region-people-lead": 3 },
  },
  {
    id: "starter-empathy",
    label: "Empathy",
    shortName: "Empathy",
    description: "I pay attention to what people need and how they feel.",
    glyph: "♥",
    badgeIcon: "handshake",
    color: "#78d9be",
    category: "starter",
    affinities: { "region-build-create": 1, "region-analyze-solve": 0, "region-people-lead": 3 },
  },
];

const REGIONS = [
  makeNode({
    id: "region-build-create",
    tier: 1,
    parentId: null,
    title: "Build and Create",
    subtitle: "I like making technology work.",
    description: "Imagine, build, and improve the technology people use every day.",
    color: COLORS.build,
    theme: "build-create",
    scene: WORLD_SCENES["build-create"],
    earnedSkill: SKILLS.creativity,
    miniGame: makeMiniGame(
      "minigame-build-create-door",
      "Make a Door",
      "Build a working doorway in a 2D Minecraft-style workspace.",
      "minecraft-2d",
      "Planned placeholder: place blocks to make a door that opens."
    ),
  }),
  makeNode({
    id: "region-analyze-solve",
    tier: 1,
    parentId: null,
    title: "Analyze and Solve",
    subtitle: "I like finding answers in complexity.",
    description: "Look for patterns, investigate problems, and turn evidence into answers.",
    color: COLORS.analyze,
    theme: "analyze-solve",
    scene: WORLD_SCENES["analyze-solve"],
    earnedSkill: SKILLS.analyst,
    miniGame: makeMiniGame(
      "minigame-analyze-solve-jigsaw",
      "Solve the Evidence Puzzle",
      "Assemble a simple jigsaw puzzle to reveal the next clue.",
      "jigsaw",
      "Planned placeholder: arrange the evidence pieces into one clear picture."
    ),
  }),
  makeNode({
    id: "region-people-lead",
    tier: 1,
    parentId: null,
    title: "People and Lead",
    subtitle: "I like helping people move forward.",
    description: "Coordinate people, communicate clearly, and create useful experiences.",
    color: COLORS.people,
    theme: "people-lead",
    scene: WORLD_SCENES["people-lead"],
    earnedSkill: SKILLS.peopleSkills,
    miniGame: makeMiniGame(
      "minigame-people-lead-team",
      "Build a Team",
      "Choose two or three characters whose strengths fit the mission.",
      "team-builder",
      "Planned placeholder: pick a balanced team for the project brief."
    ),
  }),
];

const DOMAINS = [
  makeNode({
    id: "domain-software-apps",
    tier: 2,
    parentId: "region-build-create",
    title: "Software and Apps",
    subtitle: "Create digital products.",
    description: "Turn ideas into useful interfaces, applications, and reliable software.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.software,
    miniGame: makeMiniGame(
      "minigame-software-scratch",
      "Block Coding Studio",
      "Arrange Scratch-style blocks to make a character respond to a user.",
      "block-coding",
      "Planned placeholder: snap blocks together to make the interaction work."
    ),
  }),
  makeNode({
    id: "domain-systems-tech",
    tier: 2,
    parentId: "region-build-create",
    title: "Systems and Tech",
    subtitle: "Keep technology running.",
    description: "Understand hardware and connected platforms that keep organizations moving.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.hardware,
    miniGame: makeMiniGame(
      "minigame-systems-cpu",
      "Find the CPU",
      "Identify the CPU in a labeled cross-section of a computer.",
      "computer-cross-section",
      "Planned placeholder: inspect the computer and click the processor."
    ),
  }),
  makeNode({
    id: "domain-data-insights",
    tier: 2,
    parentId: "region-analyze-solve",
    title: "Data Insight",
    subtitle: "Turn data into answers.",
    description: "Use numbers, charts, and models to explain what is happening and what may happen next.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.numbers,
    miniGame: makeMiniGame(
      "minigame-data-chart-match",
      "Match Data to Charts",
      "Match three datasets to the three charts that communicate them best.",
      "data-chart-match",
      "Planned placeholder: connect each dataset to its most useful chart."
    ),
  }),
  makeNode({
    id: "domain-security-risk",
    tier: 2,
    parentId: "region-analyze-solve",
    title: "Security and Risk",
    subtitle: "Protect systems and trust.",
    description: "Spot threats, understand controls, and help people make safer technology decisions.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.hacker,
    miniGame: makeMiniGame(
      "minigame-security-password",
      "Guess the Password",
      "Use Wordle-style clues to uncover a suspicious account password.",
      "wordle-password",
      "Planned placeholder: make guesses and use the clues to narrow the answer."
    ),
  }),
  makeNode({
    id: "domain-projects-delivery",
    tier: 2,
    parentId: "region-people-lead",
    title: "Projects and Delivery",
    subtitle: "Guide work to completion.",
    description: "Coordinate people, priorities, and communication so work can ship successfully.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.speech,
    miniGame: makeMiniGame(
      "minigame-projects-slide",
      "Build the Briefing Slide",
      "Arrange supplied components into a clear presentation slide.",
      "slide-builder",
      "Planned placeholder: place the title, evidence, and recommendation in a useful order."
    ),
  }),
  makeNode({
    id: "domain-users-products",
    tier: 2,
    parentId: "region-people-lead",
    title: "Users and Product",
    subtitle: "Shape useful experiences.",
    description: "Learn what users need and turn that insight into products people can use.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.marketReach,
    miniGame: makeMiniGame(
      "minigame-users-github-deploy",
      "Publish the Project",
      "Drag a file into GitHub, find its host, and publish it.",
      "deploy-drag-drop",
      "Planned placeholder: move the project file to GitHub and select its hosting destination."
    ),
  }),
];

const SPECIALIZATIONS = [
  makeNode({
    id: "spec-code-build-uis",
    tier: 3,
    parentId: "domain-software-apps",
    title: "Code and Build UIs",
    subtitle: "Make ideas interactive.",
    description: "Build interfaces and application features that turn a user need into a working experience.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.coder,
    careerId: "application-developer",
    miniGame: makeMiniGame(
      "minigame-code-build-uis",
      "UI Builder Challenge",
      "A future Scratch-style activity will connect interface blocks into a working interaction.",
      "block-coding",
      "Planned placeholder: the detailed UI-building challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-architect-software",
    tier: 3,
    parentId: "domain-software-apps",
    title: "Architect Reliable Software",
    subtitle: "Design systems that last.",
    description: "Think about how software pieces fit together so products stay dependable as they grow.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.designer,
    careerId: "software-engineer",
    miniGame: makeMiniGame(
      "minigame-architect-software",
      "System Blueprint",
      "A future planning activity will arrange software components into a reliable architecture.",
      "architecture-blueprint",
      "Planned placeholder: the detailed architecture challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-deploy-cloud-platforms",
    tier: 3,
    parentId: "domain-systems-tech",
    title: "Deploy Cloud Platforms",
    subtitle: "Connect the right infrastructure.",
    description: "Plan and support cloud resources that let teams deliver technology reliably.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.cloudBuilder,
    careerId: "cloud-engineer",
    miniGame: makeMiniGame(
      "minigame-deploy-cloud-platforms",
      "Cloud Route Planner",
      "A future infrastructure activity will connect services to a working cloud deployment.",
      "cloud-topology",
      "Planned placeholder: the detailed cloud deployment challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-support-connected-systems",
    tier: 3,
    parentId: "domain-systems-tech",
    title: "Support Connected Systems",
    subtitle: "Keep the network healthy.",
    description: "Trace a technology issue across connected systems and restore a dependable service.",
    color: COLORS.buildLight,
    theme: "build-create",
    earnedSkill: SKILLS.systemsThinker,
    careerId: "systems-engineer",
    miniGame: makeMiniGame(
      "minigame-support-connected-systems",
      "Systems Troubleshooter",
      "A future diagnostic activity will trace a failure through connected technology.",
      "systems-diagnostic",
      "Planned placeholder: the detailed systems troubleshooting challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-explain-trends-data",
    tier: 3,
    parentId: "domain-data-insights",
    title: "Explain Trends with Data",
    subtitle: "Tell the story in the numbers.",
    description: "Turn a dataset into a clear explanation that helps someone make a decision.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.trendy,
    careerId: "data-analyst",
    miniGame: makeMiniGame(
      "minigame-explain-trends-data",
      "Data Story",
      "A future analysis activity will turn a small dataset into one useful insight.",
      "data-story",
      "Planned placeholder: the detailed data-story challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-predict-outcomes-models",
    tier: 3,
    parentId: "domain-data-insights",
    title: "Predict Outcomes with Models",
    subtitle: "Explore what could happen next.",
    description: "Use patterns in data to estimate outcomes and communicate uncertainty responsibly.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.fortuneTeller,
    careerId: "data-scientist",
    miniGame: makeMiniGame(
      "minigame-predict-outcomes-models",
      "Forecast the Next Move",
      "A future modeling activity will use patterns to make a careful prediction.",
      "model-forecast",
      "Planned placeholder: the detailed forecasting challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-detect-investigate-threats",
    tier: 3,
    parentId: "domain-security-risk",
    title: "Detect and Investigate Threats",
    subtitle: "Follow the evidence.",
    description: "Investigate suspicious activity and decide what evidence deserves attention first.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.detective,
    careerId: "cybersecurity-analyst",
    miniGame: makeMiniGame(
      "minigame-detect-investigate-threats",
      "Threat Investigation",
      "A future investigation activity will connect clues to the most likely security incident.",
      "threat-investigation",
      "Planned placeholder: the detailed threat-investigation challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-evaluate-controls-risk",
    tier: 3,
    parentId: "domain-security-risk",
    title: "Evaluate Controls and Risk",
    subtitle: "Guard what matters.",
    description: "Evaluate safeguards and explain how a team can reduce technology risk.",
    color: COLORS.analyzeLight,
    theme: "analyze-solve",
    earnedSkill: SKILLS.bodyguard,
    careerId: "it-risk-analyst",
    miniGame: makeMiniGame(
      "minigame-evaluate-controls-risk",
      "Risk Watch",
      "A future risk activity will compare safeguards and choose the strongest control.",
      "risk-controls",
      "Planned placeholder: the detailed controls-and-risk challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-plan-timelines-delivery",
    tier: 3,
    parentId: "domain-projects-delivery",
    title: "Plan Timelines and Delivery",
    subtitle: "Make the work happen.",
    description: "Coordinate scope, people, and timing so a project can move from idea to delivery.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.logistical,
    careerId: "it-project-manager",
    miniGame: makeMiniGame(
      "minigame-plan-timelines-delivery",
      "Timeline Tactics",
      "A future delivery activity will place project work in a realistic sequence.",
      "timeline-planner",
      "Planned placeholder: the detailed timeline-and-delivery challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-improve-processes-requirements",
    tier: 3,
    parentId: "domain-projects-delivery",
    title: "Improve Processes and Requirements",
    subtitle: "Make the system clearer.",
    description: "Listen to stakeholders, clarify requirements, and improve how work gets done.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.renovator,
    careerId: "business-analyst",
    miniGame: makeMiniGame(
      "minigame-improve-processes-requirements",
      "Process Renovation",
      "A future requirements activity will turn a messy request into a clearer process.",
      "process-mapping",
      "Planned placeholder: the detailed process-improvement challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-research-design-experiences",
    tier: 3,
    parentId: "domain-users-products",
    title: "Research and Design Experiences",
    subtitle: "Start with the user.",
    description: "Explore user needs and shape an experience that feels useful, clear, and welcoming.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.creative,
    careerId: "ux-designer",
    miniGame: makeMiniGame(
      "minigame-research-design-experiences",
      "Experience Sketch",
      "A future design activity will organize user clues into a first experience concept.",
      "experience-design",
      "Planned placeholder: the detailed user-experience challenge will be added later."
    ),
  }),
  makeNode({
    id: "spec-set-strategy-prioritize-value",
    tier: 3,
    parentId: "domain-users-products",
    title: "Set Strategy and Prioritize Value",
    subtitle: "Choose what matters most.",
    description: "Balance user value, business goals, and constraints to decide what a product should do next.",
    color: COLORS.peopleLight,
    theme: "people-lead",
    earnedSkill: SKILLS.strategist,
    careerId: "product-manager",
    miniGame: makeMiniGame(
      "minigame-set-strategy-prioritize-value",
      "Product Priorities",
      "A future product activity will rank opportunities by user value and effort.",
      "priority-board",
      "Planned placeholder: the detailed product-prioritization challenge will be added later."
    ),
  }),
];

/**
 * Salary is deliberately a research-pending object.  Do not fill in a number
 * until the source ledger has verified geography, year, and entry-level method.
 * @param {string} id
 * @param {string} title
 * @param {string} summary
 * @param {string[]} dayToDay
 * @param {string[]} projects
 * @param {string[]} settings
 * @param {string[]} industries
 * @param {string[]} companyTypes
 * @param {string[]} technicalSkills
 * @param {string[]} tools
 * @param {string[]} entryLevelNeeds
 * @param {string[]} growth
 * @param {CareerProfile["strongCandidate"]} candidate
 * @returns {CareerProfile}
 */
function makeCareer(id, title, summary, dayToDay, projects, settings, industries, companyTypes, technicalSkills, tools, entryLevelNeeds, growth, candidate) {
  return {
    id,
    title,
    summary,
    dayToDay,
    typicalProjects: projects,
    workSettings: settings,
    industries,
    companyTypes,
    technicalSkills,
    toolsAndTechnologies: tools,
    entryLevelNeeds,
    salary: {
      status: "research-pending",
      range: null,
      source: null,
      note: "Add a sourced U.S. entry-level range with geography, year, and methodology before publishing salary data.",
    },
    careerGrowth: growth,
    strongCandidate: candidate,
    sourceRefs: [],
    researchStatus: "research-pending",
  };
}

const CAREERS = [
  makeCareer(
    "application-developer",
    "Application Developer",
    "Build and improve software applications that solve a real user or business need.",
    ["Translate requirements into features", "Write and test application code", "Fix bugs and improve usability"],
    ["Student or internal web app", "Mobile or workflow prototype", "Feature enhancement"],
    ["Product team", "Engineering team", "Consulting project"],
    ["Technology", "Health care", "Finance", "Education"],
    ["Software company", "Enterprise IT team", "Digital consultancy"],
    ["Programming fundamentals", "Web or application development", "Testing and debugging", "Data structures"],
    ["HTML/CSS/JavaScript", "Python or Java", "Git", "An IDE", "APIs"],
    ["One small working application", "Basic version control", "Ability to explain design choices"],
    ["Software Engineer", "Full-stack Developer", "Technical Lead"],
    { skills: ["Programming", "Problem solving", "Communication"], experience: ["Coursework or internship"], projects: ["Deployed class project"], certifications: ["Optional; verify relevance by employer"] }
  ),
  makeCareer(
    "software-engineer",
    "Software Engineer",
    "Design, implement, and maintain reliable software systems as part of a technical team.",
    ["Design components and interfaces", "Review code and test changes", "Monitor and improve reliability"],
    ["Service or platform feature", "Automation tool", "System integration"],
    ["Engineering team", "Platform team", "Remote product squad"],
    ["Technology", "Retail", "Manufacturing", "Public sector"],
    ["Software company", "Large enterprise", "Engineering consultancy"],
    ["Programming", "Algorithms and data structures", "System design basics", "Testing"],
    ["Python, Java, or JavaScript", "GitHub", "SQL", "Cloud platform basics", "Testing tools"],
    ["A readable code portfolio", "Git workflow", "Fundamental debugging skills"],
    ["Senior Software Engineer", "Staff Engineer", "Engineering Manager"],
    { skills: ["Programming", "Systems thinking", "Collaboration"], experience: ["Team software project"], projects: ["Well-documented application"], certifications: ["Usually optional at entry level"] }
  ),
  makeCareer(
    "cloud-engineer",
    "Cloud Engineer",
    "Configure and support cloud infrastructure so applications and teams can operate reliably.",
    ["Provision cloud resources", "Monitor availability and cost", "Automate repeatable infrastructure work"],
    ["Cloud migration", "Deployment pipeline", "Infrastructure monitoring"],
    ["Cloud operations team", "Platform engineering team", "Managed services provider"],
    ["Technology", "Finance", "Health care", "Government"],
    ["Cloud services company", "Enterprise infrastructure team", "Consultancy"],
    ["Networking basics", "Operating systems", "Cloud architecture", "Infrastructure as code", "Security fundamentals"],
    ["AWS, Azure, or Google Cloud", "Linux", "Docker", "Terraform", "GitHub Actions"],
    ["Cloud lab or class project", "Basic networking knowledge", "Ability to document a deployment"],
    ["Cloud Architect", "Site Reliability Engineer", "Platform Lead"],
    { skills: ["Systems thinking", "Troubleshooting", "Automation"], experience: ["Hands-on cloud lab"], projects: ["Documented hosted service"], certifications: ["Entry cloud certification can be relevant; verify employer requirements"] }
  ),
  makeCareer(
    "systems-engineer",
    "Systems Engineer",
    "Keep connected technology systems dependable by understanding how hardware, software, and networks work together.",
    ["Diagnose incidents", "Configure connected systems", "Document fixes and improve reliability"],
    ["Systems integration", "Network or endpoint rollout", "Reliability improvement"],
    ["IT operations team", "Systems integration project", "Internal support team"],
    ["Technology", "Manufacturing", "Health care", "Education"],
    ["Enterprise IT department", "Systems integrator", "Managed service provider"],
    ["Operating systems", "Networking", "Hardware fundamentals", "Scripting", "Incident response"],
    ["Linux or Windows", "Networking tools", "PowerShell or Python", "Monitoring platforms", "Ticketing systems"],
    ["Troubleshooting practice", "Clear technical documentation", "Basic network and hardware literacy"],
    ["Systems Administrator", "Infrastructure Engineer", "Solutions Architect"],
    { skills: ["Hardware literacy", "Troubleshooting", "Communication"], experience: ["IT lab or support role"], projects: ["Documented system setup"], certifications: ["Relevant certification may help; verify requirements"] }
  ),
  makeCareer(
    "data-analyst",
    "Data Analyst",
    "Turn raw data into clear findings that help a team understand performance and make decisions.",
    ["Clean and query datasets", "Build reports or visualizations", "Explain findings to stakeholders"],
    ["Performance dashboard", "Survey or customer analysis", "Operations report"],
    ["Analytics team", "Business unit", "Consulting engagement"],
    ["Retail", "Finance", "Health care", "Marketing", "Education"],
    ["Enterprise analytics team", "Consultancy", "Research group"],
    ["SQL", "Statistics", "Data cleaning", "Visualization", "Business communication"],
    ["Excel or Google Sheets", "SQL", "Tableau or Power BI", "Python or R", "Jupyter"],
    ["A clear analysis project", "Ability to explain chart choices", "Basic statistics and SQL"],
    ["Senior Analyst", "Analytics Engineer", "Analytics Manager"],
    { skills: ["Curiosity", "Numerical reasoning", "Storytelling"], experience: ["Coursework or internship analysis"], projects: ["Annotated dashboard"], certifications: ["Usually optional at entry level"] }
  ),
  makeCareer(
    "data-scientist",
    "Data Scientist",
    "Use statistical and computational models to explore patterns and estimate possible outcomes.",
    ["Frame analytical questions", "Prepare data and evaluate models", "Communicate uncertainty and recommendations"],
    ["Forecasting model", "Experiment analysis", "Classification or prediction study"],
    ["Data science team", "Research group", "Product analytics team"],
    ["Technology", "Finance", "Health care", "Marketing", "Public policy"],
    ["Technology company", "Research organization", "Enterprise data team"],
    ["Statistics", "Python", "Machine learning foundations", "Data preparation", "Model evaluation"],
    ["Python", "Jupyter", "pandas", "scikit-learn", "SQL", "Cloud notebooks"],
    ["A reproducible analysis", "Clear model evaluation", "Ability to explain limitations"],
    ["Senior Data Scientist", "Machine Learning Engineer", "Data Science Lead"],
    { skills: ["Quantitative reasoning", "Experimentation", "Communication"], experience: ["Research or class project"], projects: ["Reproducible model notebook"], certifications: ["Usually optional; verify role requirements"] }
  ),
  makeCareer(
    "cybersecurity-analyst",
    "Cybersecurity Analyst",
    "Monitor systems, investigate suspicious activity, and help an organization reduce security risk.",
    ["Review alerts and logs", "Investigate potential incidents", "Document and recommend response steps"],
    ["Security monitoring", "Phishing investigation", "Access review"],
    ["Security operations center", "Internal security team", "Managed security provider"],
    ["Technology", "Finance", "Health care", "Government"],
    ["Enterprise security team", "Security consultancy", "Managed security provider"],
    ["Networking", "Identity and access", "Log analysis", "Threat concepts", "Risk communication"],
    ["SIEM platform", "Wireshark", "Linux", "Python", "Ticketing systems", "Cloud security tools"],
    ["Security lab practice", "Basic networking", "Careful incident documentation"],
    ["Incident Responder", "Security Engineer", "Security Operations Lead"],
    { skills: ["Curiosity", "Attention to detail", "Calm communication"], experience: ["Security lab or capture-the-flag practice"], projects: ["Documented investigation"], certifications: ["Entry certification may help; verify employer requirements"] }
  ),
  makeCareer(
    "it-risk-analyst",
    "IT Risk Analyst",
    "Evaluate technology controls and communicate practical ways to reduce operational and security risk.",
    ["Review controls and evidence", "Document risk findings", "Partner with teams on remediation"],
    ["Access-control review", "Compliance evidence collection", "Risk assessment"],
    ["Risk and compliance team", "Internal audit group", "Consulting engagement"],
    ["Finance", "Health care", "Technology", "Government"],
    ["Enterprise risk team", "Audit and advisory firm", "Regulated company"],
    ["Risk frameworks", "Controls testing", "Access management", "Audit evidence", "Business writing"],
    ["Spreadsheets", "GRC platform", "SQL basics", "Identity platforms", "Documentation tools"],
    ["Careful evidence review", "Clear written findings", "Basic security and business-process knowledge"],
    ["Senior Risk Analyst", "IT Auditor", "Risk Manager"],
    { skills: ["Judgment", "Attention to detail", "Professional writing"], experience: ["Audit, controls, or process coursework"], projects: ["Control-mapping exercise"], certifications: ["Relevant certification may help; verify requirements"] }
  ),
  makeCareer(
    "it-project-manager",
    "IT Project Manager",
    "Help teams plan, communicate, and deliver technology work against a shared goal.",
    ["Track scope and milestones", "Facilitate project communication", "Surface risks and unblock decisions"],
    ["System implementation", "Product launch", "Process or platform migration"],
    ["Project team", "PMO", "Client delivery team"],
    ["Technology", "Health care", "Finance", "Government"],
    ["Enterprise PMO", "Technology consultancy", "Software company"],
    ["Planning", "Risk management", "Stakeholder communication", "Agile basics", "Requirements tracking"],
    ["Jira", "Confluence", "Microsoft Project", "Asana", "Spreadsheets", "Presentation tools"],
    ["A project plan", "Evidence of coordination", "Clear status communication"],
    ["Program Manager", "Product Operations Lead", "Portfolio Manager"],
    { skills: ["Organization", "Communication", "Facilitation"], experience: ["Team project leadership"], projects: ["Timeline and risk register"], certifications: ["Project certification may help; verify entry-level value"] }
  ),
  makeCareer(
    "business-analyst",
    "Business Analyst",
    "Understand a business problem, clarify requirements, and help teams improve a process or system.",
    ["Interview stakeholders", "Map current and future processes", "Write and validate requirements"],
    ["Workflow improvement", "System requirements", "Data or process redesign"],
    ["Business unit", "IT delivery team", "Consulting engagement"],
    ["Technology", "Health care", "Finance", "Retail"],
    ["Enterprise IT team", "Consultancy", "Operations group"],
    ["Requirements analysis", "Process mapping", "SQL basics", "Facilitation", "Documentation"],
    ["BPMN or diagramming tools", "Jira", "Confluence", "Excel", "SQL", "Presentation tools"],
    ["A process map", "Requirements-writing practice", "Ability to listen and clarify"],
    ["Senior Business Analyst", "Systems Analyst", "Product Manager"],
    { skills: ["Listening", "Structured thinking", "Communication"], experience: ["Stakeholder or process project"], projects: ["Before-and-after process map"], certifications: ["Usually optional at entry level"] }
  ),
  makeCareer(
    "ux-designer",
    "UX Designer",
    "Research user needs and shape interfaces that are useful, understandable, and inclusive.",
    ["Conduct lightweight user research", "Sketch and prototype flows", "Test designs and iterate"],
    ["Mobile or web redesign", "Onboarding flow", "Usability study"],
    ["Product design team", "Research team", "Agency or consultancy"],
    ["Technology", "Education", "Health care", "Consumer products"],
    ["Product company", "Design consultancy", "Internal innovation team"],
    ["User research", "Interaction design", "Prototyping", "Accessibility", "Information architecture"],
    ["Figma", "FigJam", "Prototyping tools", "Analytics tools", "Design systems"],
    ["A concise portfolio", "Research-to-design rationale", "Accessible interaction basics"],
    ["Senior UX Designer", "Product Designer", "Design Lead"],
    { skills: ["Empathy", "Visual communication", "Iteration"], experience: ["User research or design project"], projects: ["Tested clickable prototype"], certifications: ["Portfolio is usually more important than certification"] }
  ),
  makeCareer(
    "product-manager",
    "Product Manager",
    "Connect user needs, business goals, and delivery constraints to decide what a product should do next.",
    ["Set priorities and clarify outcomes", "Work with design and engineering", "Learn from product performance and users"],
    ["Feature roadmap", "New product discovery", "Experiment or launch plan"],
    ["Product team", "Startup", "Enterprise product organization"],
    ["Technology", "Finance", "Health care", "Consumer products"],
    ["Software company", "Startup", "Digital transformation group"],
    ["Product discovery", "Prioritization", "Market and user research", "Analytics literacy", "Communication"],
    ["Jira", "Product analytics", "Figma", "Roadmapping tools", "SQL basics", "Presentation tools"],
    ["A product case study", "Evidence of prioritization", "Ability to explain tradeoffs"],
    ["Senior Product Manager", "Group Product Manager", "Product Director"],
    { skills: ["Curiosity", "Judgment", "Influence without authority"], experience: ["Product, club, or team leadership"], projects: ["User-informed product proposal"], certifications: ["Usually optional at entry level"] }
  ),
];

const ALL_NODES = [...REGIONS, ...DOMAINS, ...SPECIALIZATIONS];

/** @type {Record<string, MapNode>} */
const NODE_BY_ID = Object.fromEntries(ALL_NODES.map((node) => [node.id, node]));

/** @type {Record<string, CareerProfile>} */
const CAREER_BY_ID = Object.fromEntries(CAREERS.map((career) => [career.id, career]));

/**
 * Public application data contract.  Keep this object JSON-like: content agents
 * can edit the arrays above without touching app behavior or mini-game code.
 */
const CAREER_LAUNCHPAD_DATA = {
  version: "1.0.0",
  title: "IS Career Launchpad",
  targetJourneyMinutes: 10,
  starterSkills: STARTER_SKILLS,
  skills: Object.values(SKILLS),
  regions: REGIONS,
  domains: DOMAINS,
  specializations: SPECIALIZATIONS,
  nodes: ALL_NODES,
  careers: CAREERS,
  nodeById: NODE_BY_ID,
  careerById: CAREER_BY_ID,
  map: {
    tiers: {
      1: REGIONS.map((node) => node.id),
      2: DOMAINS.map((node) => node.id),
      3: SPECIALIZATIONS.map((node) => node.id),
    },
    childIdsByParentId: ALL_NODES.reduce((groups, node) => {
      const parent = node.parentId || "root";
      groups[parent] = groups[parent] || [];
      groups[parent].push(node.id);
      return groups;
    }, {}),
  },
};

// The browser build loads this file as a classic script, so expose one stable global.
// globalThis fallback makes the data easy to validate in a non-browser test runner.
const DATA_ROOT = typeof window !== "undefined" ? window : globalThis;
DATA_ROOT.CAREER_LAUNCHPAD_DATA = CAREER_LAUNCHPAD_DATA;
