/*
 * IS Career Launchpad — progression controller
 *
 * This module intentionally owns behavior only. The visual system lives in
 * styles.css and content is supplied by data.js as window.CAREER_LAUNCHPAD_DATA.
 * The normalizer below accepts the current tree contract as well as a few
 * obvious aliases, which keeps the app easy to evolve while the content team
 * is still iterating.
 */
(function careerLaunchpadApp() {
  'use strict';

  var STORAGE_KEY = 'is-career-launchpad:v1';
  var root = document.getElementById('app');
  var dock = document.getElementById('skill-dock');
  var toastRegion = document.getElementById('toast-region') || document.getElementById('toast');
  var modalRoot = document.getElementById('modal-root');

  if (!root) return;

  var rawData = window.CAREER_LAUNCHPAD_DATA || {};
  var model = normalizeData(rawData);
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = loadState();
  var lastFocusedSelector = null;
  var modalReturnFocus = null;

  // ---------- Data normalization ------------------------------------------------

  function fallbackData() {
    var skills = [
      { id: 'creativity', name: 'Creativity', shortName: 'Create', color: '#ffb347' },
      { id: 'software', name: 'Software', shortName: 'Code', color: '#79d6ff' },
      { id: 'hardware', name: 'Hardware', shortName: 'Build', color: '#b8a1ff' },
      { id: 'coder', name: 'Coder', shortName: 'Code', color: '#7ee7b8' },
      { id: 'designer', name: 'Designer', shortName: 'Design', color: '#f9a3d1' },
      { id: 'analyst', name: 'Analyst', shortName: 'Analyze', color: '#b8a1ff' },
      { id: 'numbers', name: 'Numbers', shortName: 'Data', color: '#84d8cf' },
      { id: 'trendy', name: 'Trendy', shortName: 'Trends', color: '#ffd36b' },
      { id: 'fortune-teller', name: 'Fortune Teller', shortName: 'Predict', color: '#f7a8ff' },
      { id: 'hacker', name: 'Hacker', shortName: 'Secure', color: '#ef8d8d' },
      { id: 'detective', name: 'Detective', shortName: 'Investigate', color: '#f7bd7a' },
      { id: 'bodyguard', name: 'Bodyguard', shortName: 'Protect', color: '#94b9ff' },
      { id: 'people-skills', name: 'People Skills', shortName: 'People', color: '#84dfae' },
      { id: 'speech', name: 'Speech', shortName: 'Present', color: '#ffd36b' },
      { id: 'logistical', name: 'Logistical', shortName: 'Plan', color: '#9bd8ff' },
      { id: 'renovator', name: 'Renovator', shortName: 'Improve', color: '#79e0cc' },
      { id: 'market-reach', name: 'Market Reach', shortName: 'Reach', color: '#f6a5cf' },
      { id: 'creative', name: 'Creative', shortName: 'Imagine', color: '#e6a2ff' },
      { id: 'strategist', name: 'Strategist', shortName: 'Strategy', color: '#ffd47e' }
    ];

    function node(id, title, subtitle, skill, children, career, miniTitle, miniDescription) {
      return {
        id: id,
        title: title,
        name: title,
        subtitle: subtitle,
        description: subtitle,
        skill: skill,
        earnedSkill: skill,
        children: children || [],
        career: career || null,
        miniGame: {
          id: id + '-placeholder',
          title: miniTitle || 'A short challenge is waiting here',
          description: miniDescription || 'This sixty-second activity is planned for a future version.',
          status: 'planned',
          rewardSkill: skill
        }
      };
    }

    var developer = node('1.1.1', 'Code & build UIs', 'Turn ideas into useful interfaces.', 'coder', [], {
      id: 'application-developer', title: 'Application Developer', whatTheyDo: 'Build and improve software products for real users.',
      responsibilities: ['Translate ideas into working features', 'Test and debug code', 'Collaborate with designers and stakeholders'],
      projects: ['A student portal feature', 'A mobile workflow', 'An internal automation'], workplace: 'Product teams, agencies, and technology groups',
      industries: ['Technology', 'Healthcare', 'Finance'], companies: ['Startups', 'Enterprise IT teams', 'Software vendors'],
      technicalSkills: ['Programming fundamentals', 'Version control', 'Web or application development'], tools: ['JavaScript', 'Python', 'GitHub'],
      entryLevel: 'Be able to explain a small project, read unfamiliar code, and show a habit of testing.', salary: '$60,000–$85,000 (illustrative entry-level range)',
      growth: 'Developer → Senior Developer → Technical Lead or Engineering Manager', candidate: ['Curiosity', 'Clear communication', 'A small portfolio project'], sources: []
    }, 'Scratch studio', 'A block-coding space will let students connect logic blocks to make a tiny interface.');
    var software = node('1.1', 'Software & Apps', 'Create digital products that people can use.', 'software', [developer, node('1.1.2', 'Architect reliable software', 'Design the systems behind dependable products.', 'designer', [], { id: 'software-engineer', title: 'Software Engineer', whatTheyDo: 'Design, build, and maintain software systems.', responsibilities: ['Break work into technical tasks', 'Review changes with teammates'], projects: ['API service', 'Data-backed feature'], workplace: 'Engineering organizations', industries: ['Technology', 'Retail', 'Financial services'], companies: ['Software companies', 'Digital teams'], technicalSkills: ['Programming', 'Data structures', 'Testing'], tools: ['GitHub', 'Cloud platforms', 'SQL'], entryLevel: 'Practice explaining trade-offs and debugging methodically.', salary: '$70,000–$95,000 (illustrative entry-level range)', growth: 'Engineer → Senior Engineer → Staff Engineer', candidate: ['Reliable execution', 'Teamwork', 'Projects that show learning'], sources: [] }, 'Block architecture', 'A future block-coding challenge will ask students to assemble a reliable feature.')], null, 'Scratch lab', 'Connect visual code blocks to make a small working feature.');
    var hardware = node('1.2', 'Systems & Tech', 'Keep technology running and connected.', 'hardware', [node('1.2.1', 'Deploy cloud platforms', 'Set up dependable technical foundations.', 'designer', [], { id: 'cloud-engineer', title: 'Cloud Engineer', whatTheyDo: 'Help organizations run services on scalable infrastructure.', responsibilities: ['Configure environments', 'Monitor service health'], projects: ['Cloud deployment', 'Infrastructure automation'], workplace: 'Cloud operations and platform teams', industries: ['Technology', 'Education', 'Healthcare'], companies: ['Cloud consultancies', 'Enterprise technology teams'], technicalSkills: ['Networking', 'Linux', 'Cloud concepts'], tools: ['AWS or Azure', 'Terraform', 'Git'], entryLevel: 'Understand basic networking and explain how you would troubleshoot a service.', salary: '$65,000–$90,000 (illustrative entry-level range)', growth: 'Cloud Engineer → Platform Engineer → Cloud Architect', candidate: ['Calm troubleshooting', 'Documentation', 'Hands-on labs'], sources: [] }, 'CPU cross-section', 'Inspect a computer cross-section and identify the CPU.'), node('1.2.2', 'Support connected systems', 'Troubleshoot technology people depend on.', 'coder', [], { id: 'systems-engineer', title: 'Systems Engineer', whatTheyDo: 'Connect hardware, software, and people into reliable systems.', responsibilities: ['Monitor systems', 'Resolve incidents', 'Document fixes'], projects: ['Device rollout', 'Systems migration'], workplace: 'IT operations and infrastructure teams', industries: ['Government', 'Business services', 'Manufacturing'], companies: ['Managed service providers', 'Enterprise IT'], technicalSkills: ['Systems administration', 'Networking', 'Security basics'], tools: ['PowerShell', 'Linux', 'Monitoring platforms'], entryLevel: 'Show a repeatable troubleshooting process and comfort asking clarifying questions.', salary: '$58,000–$82,000 (illustrative entry-level range)', growth: 'Systems Engineer → Senior Engineer → Infrastructure Lead', candidate: ['Patience', 'Systems thinking', 'Clear notes'], sources: [] }, 'Computer anatomy', 'Identify the hardware component that keeps the computer thinking.')], null, 'Hardware lab', 'A future cross-section activity will ask learners to identify core computer components.');
    var dataAnalyst = node('2.1.1', 'Explain trends with data', 'Turn numbers into a clear story.', 'trendy', [], { id: 'data-analyst', title: 'Data Analyst', whatTheyDo: 'Use data to explain what is happening and support decisions.', responsibilities: ['Clean and query data', 'Build clear reports', 'Explain findings to partners'], projects: ['Enrollment dashboard', 'Customer behavior report'], workplace: 'Analytics, operations, and strategy teams', industries: ['Retail', 'Healthcare', 'Education'], companies: ['Consultancies', 'Product teams', 'Large organizations'], technicalSkills: ['SQL', 'Spreadsheets', 'Descriptive statistics'], tools: ['Excel', 'SQL', 'Tableau or Power BI'], entryLevel: 'Practice asking a useful question before choosing a chart.', salary: '$55,000–$78,000 (illustrative entry-level range)', growth: 'Analyst → Senior Analyst → Analytics Manager', candidate: ['Data curiosity', 'Storytelling', 'A portfolio dashboard'], sources: [] }, 'Chart match', 'Match three small datasets to the charts that reveal their shape.');
    var data = node('2.1', 'Data & Insights', 'Turn data into answers people can act on.', 'numbers', [dataAnalyst, node('2.1.2', 'Predict outcomes with models', 'Use evidence to make a thoughtful forecast.', 'fortune-teller', [], { id: 'data-scientist', title: 'Data Scientist', whatTheyDo: 'Use statistics and models to find patterns and forecast outcomes.', responsibilities: ['Explore datasets', 'Evaluate model performance'], projects: ['Forecasting demand', 'Experiment analysis'], workplace: 'Data science and research teams', industries: ['Technology', 'Finance', 'Healthcare'], companies: ['Research groups', 'Product organizations'], technicalSkills: ['Python', 'Statistics', 'Model evaluation'], tools: ['Python', 'Jupyter', 'SQL'], entryLevel: 'Explain a model in plain language and name its limitations.', salary: '$70,000–$100,000 (illustrative entry-level range)', growth: 'Data Scientist → Senior Data Scientist → ML Lead', candidate: ['Quantitative reasoning', 'Humility about uncertainty', 'Reproducible work'], sources: [] }, 'Forecast card sort', 'A future challenge will ask students to choose evidence before making a forecast.')], null, 'Data detective', 'Pair a dataset with the chart that makes its story easiest to see.');
    var security = node('2.2', 'Security & Risk', 'Protect systems, people, and trust.', 'hacker', [node('2.2.1', 'Detect & investigate threats', 'Follow clues when something looks suspicious.', 'detective', [], { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', whatTheyDo: 'Monitor systems and investigate events that may threaten them.', responsibilities: ['Triage alerts', 'Collect evidence', 'Recommend mitigations'], projects: ['Phishing investigation', 'Access review'], workplace: 'Security operations and risk teams', industries: ['Technology', 'Government', 'Financial services'], companies: ['Security providers', 'Enterprise security teams'], technicalSkills: ['Networking', 'Threat concepts', 'Log analysis'], tools: ['SIEM platforms', 'Wireshark', 'Ticketing tools'], entryLevel: 'Describe how you would preserve evidence and escalate an uncertain alert.', salary: '$60,000–$88,000 (illustrative entry-level range)', growth: 'Analyst → Incident Responder → Security Engineer', candidate: ['Attention to detail', 'Ethics', 'Calm investigation'], sources: [] }, 'Threat Wordle', 'A future Wordle-style challenge will use clues to guess a safe password.'), node('2.2.2', 'Evaluate controls & risk', 'Help teams make safer decisions.', 'bodyguard', [], { id: 'it-risk-analyst', title: 'IT Risk Analyst', whatTheyDo: 'Evaluate technology risks and help teams improve controls.', responsibilities: ['Document risks', 'Test controls', 'Communicate recommendations'], projects: ['Vendor review', 'Access-control audit'], workplace: 'Risk, compliance, and internal audit teams', industries: ['Finance', 'Healthcare', 'Government'], companies: ['Banks', 'Consultancies', 'Enterprise teams'], technicalSkills: ['Risk frameworks', 'Controls', 'Clear writing'], tools: ['GRC platforms', 'Spreadsheets', 'Documentation tools'], entryLevel: 'Connect a risk to a practical control and explain residual uncertainty.', salary: '$58,000–$82,000 (illustrative entry-level range)', growth: 'Risk Analyst → Senior Analyst → Risk Manager', candidate: ['Judgment', 'Writing', 'Constructive challenge'], sources: [] }, 'Control checkpoint', 'A future challenge will ask students to choose controls that protect a system.')], null, 'Security lab', 'Use clues to identify which account behavior needs attention.');
    var projects = node('3.1', 'Projects & Delivery', 'Guide work from idea to outcome.', 'speech', [node('3.1.1', 'Plan timelines & delivery', 'Make a team plan people can follow.', 'logistical', [], { id: 'it-project-manager', title: 'IT Project Manager', whatTheyDo: 'Coordinate people, plans, and risks to deliver technology work.', responsibilities: ['Clarify scope', 'Track dependencies', 'Communicate status'], projects: ['System rollout', 'Student team launch'], workplace: 'Project and program teams', industries: ['Technology', 'Consulting', 'Education'], companies: ['Enterprise teams', 'Agencies'], technicalSkills: ['Planning', 'Risk management', 'Agile concepts'], tools: ['Jira', 'Roadmapping tools', 'Docs'], entryLevel: 'Show how you would break ambiguity into a next step and communicate trade-offs.', salary: '$58,000–$85,000 (illustrative entry-level range)', growth: 'Project Manager → Program Manager → Portfolio Lead', candidate: ['Organization', 'Facilitation', 'Follow-through'], sources: [] }, 'Timeline builder', 'Arrange project pieces into a clear presentation-ready plan.'), node('3.1.2', 'Improve processes & requirements', 'Turn messy needs into workable change.', 'renovator', [], { id: 'business-analyst', title: 'Business Analyst', whatTheyDo: 'Translate business needs into requirements and process improvements.', responsibilities: ['Interview stakeholders', 'Map current processes', 'Define acceptance criteria'], projects: ['Workflow redesign', 'Requirements brief'], workplace: 'Product, operations, and technology teams', industries: ['Business services', 'Healthcare', 'Retail'], companies: ['Consultancies', 'Internal technology teams'], technicalSkills: ['Requirements', 'Process mapping', 'Data literacy'], tools: ['Diagramming tools', 'SQL basics', 'Jira'], entryLevel: 'Ask precise questions and show how requirements connect to outcomes.', salary: '$55,000–$80,000 (illustrative entry-level range)', growth: 'Business Analyst → Senior Analyst → Product or Program Lead', candidate: ['Listening', 'Structured thinking', 'Process project'], sources: [] }, 'Slide renovator', 'A future activity will turn loose components into a concise project slide.')], null, 'Delivery studio', 'Assemble the pieces of a clear project plan.');
    var users = node('3.2', 'Users & Products', 'Shape experiences people choose to use.', 'market-reach', [node('3.2.1', 'Research & design experiences', 'Learn what users need and prototype a response.', 'creative', [], { id: 'ux-designer', title: 'UX Designer', whatTheyDo: 'Research, design, and test experiences that solve user problems.', responsibilities: ['Interview users', 'Prototype flows', 'Test and iterate'], projects: ['Onboarding flow', 'Service blueprint'], workplace: 'Design and product teams', industries: ['Technology', 'Consumer services', 'Education'], companies: ['Product companies', 'Design agencies'], technicalSkills: ['Interaction design', 'Research', 'Prototyping'], tools: ['Figma', 'Whiteboarding tools', 'Analytics'], entryLevel: 'Show a case study with the problem, decisions, and evidence behind the design.', salary: '$55,000–$82,000 (illustrative entry-level range)', growth: 'UX Designer → Product Designer → Design Lead', candidate: ['Empathy', 'Iteration', 'A clear case study'], sources: [] }, 'Publish the flow', 'A future drag-and-drop activity will connect a design file to its host.'), node('3.2.2', 'Set strategy & prioritize value', 'Choose what to build next and why.', 'strategist', [], { id: 'product-manager', title: 'Product Manager', whatTheyDo: 'Set direction and align teams around valuable product outcomes.', responsibilities: ['Understand users', 'Prioritize opportunities', 'Define success'], projects: ['Product roadmap', 'Feature launch'], workplace: 'Product organizations and startups', industries: ['Technology', 'Finance', 'Consumer products'], companies: ['Startups', 'Platform companies', 'Digital teams'], technicalSkills: ['Product discovery', 'Metrics', 'Technical fluency'], tools: ['Roadmapping tools', 'Analytics', 'Docs'], entryLevel: 'Explain a prioritization decision with evidence and a clear trade-off.', salary: '$65,000–$95,000 (illustrative entry-level range)', growth: 'Product Manager → Senior PM → Group Product Manager', candidate: ['Customer focus', 'Decisiveness', 'A shipped project'], sources: [] }, 'Strategy sort', 'A future activity will ask students to prioritize a product opportunity.')], null, 'Product studio', 'Move a project toward its users, then identify where it should be hosted.');

    return { skills: skills, regions: [
      { id: 'build-create', number: '1', title: 'Build + Create', subtitle: 'I like making technology work.', color: '#3b82f6', skill: 'creativity', children: [software, hardware] },
      { id: 'analyze-solve', number: '2', title: 'Analyze + Solve', subtitle: 'I like finding answers in complexity.', color: '#8b5cf6', skill: 'analyst', children: [data, security] },
      { id: 'people-lead', number: '3', title: 'People + Lead', subtitle: 'I like helping people move forward.', color: '#10a879', skill: 'people-skills', children: [projects, users] }
    ] };
  }

  function normalizeData(source) {
    var fallback = fallbackData();
    var data = source && typeof source === 'object' ? source : {};
    var sourceSkills = data.skills || data.skillPool || data.skillOptions;
    var skillMap = {};
    (Array.isArray(sourceSkills) ? sourceSkills : fallback.skills).forEach(function (skill) {
      if (!skill) return;
      var id = String(skill.id || skill.key || slug(skill.name || skill.title));
      skillMap[id] = Object.assign({ id: id, name: skill.name || skill.label || skill.title || id, shortName: skill.shortName || skill.name || skill.label || id }, skill);
    });
    var regions = data.regions || (data.map && data.map.regions) || data.map || data.tree;
    // The source-of-truth file is intentionally flat. Stitch its parent IDs
    // into a nested tree for rendering while retaining the original IDs.
    if (Array.isArray(data.regions) && (Array.isArray(data.domains) || Array.isArray(data.specializations))) {
      var domains = Array.isArray(data.domains) ? data.domains : [];
      var specs = Array.isArray(data.specializations) ? data.specializations : [];
      var careers = data.careerById || indexById(data.careers || []);
      regions = data.regions.map(function (region, regionIndex) {
        var regionCopy = Object.assign({ number: String(regionIndex + 1) }, region);
        regionCopy.children = domains.filter(function (domain) { return domain.parentId === region.id; }).map(function (domain) {
          var domainCopy = Object.assign({}, domain);
          domainCopy.children = specs.filter(function (spec) { return spec.parentId === domain.id; }).map(function (spec) {
            return Object.assign({}, spec, { career: spec.career || careers[spec.careerId] || null });
          });
          return domainCopy;
        });
        return regionCopy;
      });
    }
    if (!Array.isArray(regions)) regions = fallback.regions;
    regions = regions.map(function (region, index) { return normalizeNode(region, index, null, skillMap, fallback.regions[index]); });
    if (!regions.length) regions = fallback.regions;
    return { skills: Object.keys(skillMap).length ? skillMap : indexSkills(fallback.skills), regions: regions };
  }

  function indexSkills(list) {
    var map = {};
    list.forEach(function (skill) { map[skill.id] = skill; });
    return map;
  }

  function indexById(list) {
    var map = {};
    (Array.isArray(list) ? list : []).forEach(function (item) { if (item && item.id) map[item.id] = item; });
    return map;
  }

  function normalizeNode(item, index, parentId, skillMap, fallback) {
    item = item || {};
    fallback = fallback || {};
    var id = String(item.id || item.key || item.pathId || fallback.id || ('node-' + index));
    var children = item.children || item.nodes || item.options || item.specializations || [];
    if (!Array.isArray(children)) children = [];
    if (!children.length && fallback.children) children = fallback.children;
    var skillValue = item.skill || item.earnedSkill || item.rewardSkill || (item.miniGame && (item.miniGame.rewardSkill || item.miniGame.skill)) || fallback.skill || id;
    var skillId = typeof skillValue === 'object' ? String(skillValue.id || skillValue.key || slug(skillValue.name || skillValue.title)) : String(skillValue);
    if (!skillMap[skillId]) skillMap[skillId] = typeof skillValue === 'object' ? Object.assign({ id: skillId, name: skillValue.name || skillValue.label || skillValue.title || skillId, shortName: skillValue.shortName || skillValue.name || skillValue.label || skillId }, skillValue) : { id: skillId, name: titleCase(skillId), shortName: titleCase(skillId) };
    var career = item.career || item.careerMatch || item.outcome || fallback.career || null;
    if (typeof career === 'string') career = { title: career };
    var mini = item.miniGame || item.minigame || item.challenge || fallback.miniGame || {};
    var node = Object.assign({}, item, {
      id: id, parentId: parentId, title: item.title || item.name || fallback.title || titleCase(id), name: item.name || item.title || fallback.name || titleCase(id),
      subtitle: item.subtitle || item.description || fallback.subtitle || '', description: item.description || item.subtitle || fallback.description || '',
      skill: skillId, earnedSkill: skillId, career: career, miniGame: Object.assign({ status: 'planned', rewardSkill: skillId }, mini, { rewardSkill: mini.rewardSkill || skillId }),
      children: children.map(function (child, childIndex) { return normalizeNode(child, childIndex, id, skillMap, (fallback.children || [])[childIndex]); })
    });
    return node;
  }

  function slug(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function titleCase(value) { return String(value || '').replace(/[-_]/g, ' ').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); }); }

  // ---------- State --------------------------------------------------------------

  function defaultState() {
    return { version: 1, screen: 'landing', name: '', avatar: 'comet', completed: [], earned: [], selectedNodeId: null, lastCareerId: null };
  }

  function loadState() {
    var initial = defaultState();
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || saved.version !== 1) return initial;
      return Object.assign(initial, saved, { completed: Array.isArray(saved.completed) ? saved.completed : [], earned: Array.isArray(saved.earned) ? saved.earned : [] });
    } catch (error) { return initial; }
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* private browsing can disable storage */ }
  }

  function resetState() { state = defaultState(); saveState(); closeModal(); render(); announce('Journey restarted. Choose your explorer.'); }

  function findNode(id, nodes) {
    nodes = nodes || model.regions;
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].id === id) return nodes[i];
      var found = findNode(id, nodes[i].children || []);
      if (found) return found;
    }
    return null;
  }

  function getDepth(node) { var depth = 0; while (node && node.parentId) { depth += 1; node = findNode(node.parentId); } return depth; }
  function isCompleted(id) { return state.completed.indexOf(id) !== -1; }

  function isVisible(node) {
    if (!node.parentId) return true;
    var parent = findNode(node.parentId);
    // A child opens only after its parent challenge has been acknowledged.
    // This makes the map read as a journey rather than a flat career picker.
    return !!parent && isCompleted(parent.id);
  }

  function skillFor(node) {
    var id = node && (node.earnedSkill || node.skill);
    return model.skills[id] || { id: id || 'new-skill', name: titleCase(id || 'New Skill'), shortName: titleCase(id || 'Skill'), color: '#f6c453' };
  }

  // ---------- Rendering -----------------------------------------------------------

  function render() {
    root.innerHTML = renderScreen();
    renderDock();
    wireEvents();
    window.scrollTo(0, 0);
    focusAfterRender();
  }

  function renderScreen() {
    if (state.screen === 'landing') return renderLanding();
    if (state.screen === 'map') return renderMap();
    if (state.screen === 'mini') return renderMiniGame(findNode(state.selectedNodeId));
    if (state.screen === 'career') return renderCareer(findNode(state.selectedNodeId));
    return renderMap();
  }

  function renderLanding() {
    var avatars = [
      { id: 'comet', label: 'Comet', glyph: '✦' }, { id: 'pixel', label: 'Pixel', glyph: '▦' },
      { id: 'sprout', label: 'Sprout', glyph: '✿' }, { id: 'orbit', label: 'Orbit', glyph: '◉' }
    ];
    return '<section class="screen hero-screen screen--landing" aria-labelledby="welcome-title">' +
      '<div class="landing-sky" aria-hidden="true"><span class="star star--one"></span><span class="star star--two"></span><span class="star star--three"></span><span class="planet"></span></div>' +
      '<div class="hero-copy landing-copy"><p class="screen-kicker">INFORMATION SYSTEMS / FIELD GUIDE 01</p><h1 id="welcome-title" class="screen-title" tabindex="-1">Find the work<br><em>that feels like you.</em></h1><p class="screen-subtitle">Build a little world of skills, follow your curiosity, and meet the IS career paths waiting on the other side.</p>' +
      '<form id="start-form" class="launch-card start-card"><p class="card-label">Start your field guide</p><label for="player-name">What should we call you?</label><input id="player-name" name="playerName" autocomplete="name" maxlength="32" placeholder="Your first name" value="' + escapeHtml(state.name) + '" required><fieldset><legend>Choose your explorer</legend><div class="avatar-grid">' + avatars.map(function (avatar) { return '<button class="avatar-choice' + (state.avatar === avatar.id ? ' is-selected' : '') + '" type="button" data-action="choose-avatar" data-avatar="' + avatar.id + '" aria-pressed="' + (state.avatar === avatar.id) + '"><span class="avatar-portrait" aria-hidden="true">' + avatar.glyph + '</span><span class="avatar-name">' + avatar.label + '</span><small class="avatar-tag">ready to explore</small></button>'; }).join('') + '</div></fieldset><button class="button button--primary button--wide" type="submit">Enter the field guide <span aria-hidden="true">↗</span></button></form>' +
      (state.name ? '<button class="text-button" data-action="resume">Resume ' + escapeHtml(state.name) + '’s journey</button>' : '') + '</div>' +
      '<p class="landing-note">A short, self-guided exploration · no wrong turns</p></section>';
  }

  function renderMap() {
    var allComplete = state.completed.length;
    return '<section class="screen map-screen screen--map" aria-labelledby="map-title"><div class="map-intro"><div><p class="screen-kicker">FIELD GUIDE / MAP</p><h1 id="map-title" class="screen-title" tabindex="-1">Which kind of work<br><em>gives you energy?</em></h1><p class="screen-subtitle">Choose a point that feels natural. Every stop is a planned sixty-second challenge.</p></div><div class="map-side"><div class="map-progress"><strong>' + allComplete + ' discoveries</strong><span>Every skip grows your stack.</span></div><button class="button button--quiet map-restart" data-action="restart">Restart journey</button></div></div><div class="map-legend"><span class="legend-open"><i></i> Open route</span><span class="legend-done"><i></i> Explored</span><span class="legend-lock"><i></i> Ahead</span></div><section class="map-board" aria-labelledby="map-title"><div class="map-start"><small>START / ' + escapeHtml(state.name || 'EXPLORER') + '</small><strong>What gives you energy?</strong></div><div class="map-regions">' + model.regions.map(renderRegion).join('') + '</div><div class="map-footer">SKIP A CHALLENGE · ADD A SKILL · FIND YOUR NEXT PATH</div></section></section>';
  }

  function renderRegion(region) {
    var open = isVisible(region);
    return '<div class="map-region map-region--' + escapeAttr(slug(region.id)) + (open ? '' : ' is-future') + '"><button class="region-card region-ribbon" type="button" data-action="open-node" data-node-id="' + escapeAttr(region.id) + '" ' + (open ? '' : 'disabled') + ' style="--region-color:' + escapeAttr(region.color || '#5b8def') + '" aria-label="' + escapeAttr(region.title + ', earns ' + skillFor(region).name) + '"><span class="region-index">' + escapeHtml(region.number || '') + '</span><span><span class="region-heading">' + escapeHtml(region.title) + '</span><span class="region-description">' + escapeHtml(region.subtitle || region.description || '') + '</span></span><span class="region-skill">+' + escapeHtml(skillFor(region).name) + '</span><span class="node-status" aria-hidden="true">' + (isCompleted(region.id) ? '✓' : '↗') + '</span></button><div class="map-domain-group">' + region.children.map(function (child) { return renderDomain(child, region); }).join('') + '</div></div>';
  }

  function renderDomain(node, region) {
    var open = isVisible(node);
    var done = isCompleted(node.id);
    return '<div class="map-domain ' + (open ? 'is-open' : 'is-locked') + ' ' + (done ? 'is-complete' : '') + '"><button class="map-node map-node--domain" type="button" data-action="open-node" data-node-id="' + escapeAttr(node.id) + '" ' + (open ? '' : 'disabled') + ' aria-label="' + escapeAttr(node.title + (done ? ', explored' : '')) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml(node.subtitle || '') + '</small><span class="node-state" aria-hidden="true">' + (done ? '✓' : open ? '↗' : '·') + '</span></button><div class="specialization-row">' + node.children.map(renderSpecialization).join('') + '</div></div>';
  }

  function renderSpecialization(node) {
    var open = isVisible(node), done = isCompleted(node.id);
    return '<button class="map-node map-node--specialization ' + (open ? 'is-open' : 'is-locked') + ' ' + (done ? 'is-complete' : '') + '" type="button" data-action="open-node" data-node-id="' + escapeAttr(node.id) + '" ' + (open ? '' : 'disabled') + ' aria-label="' + escapeAttr(node.title + ', ' + (node.career && (node.career.title || node.career.name) || 'career match')) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml(node.career && (node.career.title || node.career.name) || 'Career match') + '</small><span class="node-state" aria-hidden="true">' + (done ? '✓' : open ? '↗' : '·') + '</span></button>';
  }

  function renderMiniGame(node) {
    if (!node) return renderMap();
    var skill = skillFor(node), mini = node.miniGame || {};
    var done = isCompleted(node.id);
    return '<section class="screen screen--challenge" aria-labelledby="challenge-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to map</button><span class="progress-chip">' + (done ? 'EXPLORED' : 'NEXT STOP') + '</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="challenge-layout"><div class="challenge-copy"><p class="eyebrow">' + escapeHtml(node.id) + ' / PLANNED MINI-GAME</p><h1 id="challenge-title" tabindex="-1">' + escapeHtml(mini.title || node.title) + '</h1><p class="lede">' + escapeHtml(mini.description || mini.concept || 'A focused, sixty-second activity is planned for this point on the map.') + '</p><div class="reward-callout"><span class="hex hex--small" style="--skill-color:' + escapeAttr(skill.color || '#f6c453') + '" aria-hidden="true">✦</span><div><span class="eyebrow">YOU WILL ADD</span><strong>' + escapeHtml(skill.name) + '</strong><p>One more tile in your growing skill stack.</p></div></div><div class="challenge-actions"><button class="button button--primary" data-action="skip-node">' + (done ? 'Keep this skill' : 'Skip for now') + ' <span aria-hidden="true">→</span></button><button class="text-button" data-action="back-map">Return to map</button></div></div><div class="placeholder-stage" role="region" aria-label="Planned mini-game workspace"><div class="stage-grid" aria-hidden="true"></div><div class="placeholder-card"><span class="placeholder-icon" aria-hidden="true">⌁</span><span class="eyebrow">GAME SPACE</span><h2>' + escapeHtml(mini.title || 'Mini-game') + '</h2><p>Placeholder ready for a future interactive build.</p><div class="placeholder-meta"><span>~ ' + escapeHtml(mini.durationSeconds || 60) + ' sec</span><span>skill reward</span></div></div></div></div></section>';
  }

  function renderCareer(node) {
    var career = node && node.career || { title: 'Career match', whatTheyDo: 'A career path is ready to explore.' };
    var title = career.title || career.name || 'Career match';
    var candidate = career.candidate || career.strongCandidate;
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) candidate = (candidate.skills || []).concat(candidate.experience || [], candidate.projects || [], candidate.certifications || []);
    var lists = [
      ['Day to day', career.responsibilities || career.dayToDay], ['Typical projects', career.projects || career.typicalProjects],
      ['Where they work', career.workplace || career.workSettings], ['Industries', career.industries], ['Company types', career.companies || career.companyTypes],
      ['Technical skills', career.technicalSkills || career.skills], ['Tools & technology', career.tools || career.toolsAndTechnologies || career.technologies],
      ['Entry-level needs', career.entryLevel || career.entryLevelNeeds], ['Strong candidate', candidate]
    ];
    return '<section class="screen screen--career" aria-labelledby="career-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to map</button><button class="button button--quiet" data-action="restart">Restart</button></header><div class="career-hero"><p class="eyebrow">' + escapeHtml(node && node.id || '') + ' / CAREER MATCH</p><h1 id="career-title" tabindex="-1">' + escapeHtml(title) + '</h1><p class="lede">' + escapeHtml(career.whatTheyDo || career.summary || 'Explore the kind of work this path opens up.') + '</p><div class="career-hero-meta"><span>Skill unlocked: <strong>' + escapeHtml(skillFor(node).name) + '</strong></span><span>Path complete ✓</span></div></div><div class="career-grid"><div class="career-facts">' + lists.map(function (pair) { return '<section class="fact"><h2>' + escapeHtml(pair[0]) + '</h2>' + renderFactList(pair[1]) + '</section>'; }).join('') + '</div><aside class="career-sidebar"><div class="career-stat"><span class="eyebrow">ENTRY RANGE</span><strong>' + escapeHtml(formatSalary(career.salary)) + '</strong><small>Research-backed salary data will be added in the content phase.</small></div><div class="career-stat"><span class="eyebrow">GROWTH</span><p>' + escapeHtml(formatList(career.growth || career.careerGrowth || 'Build experience, then choose your next direction.')) + '</p></div><button class="button button-coral button--wide" data-action="explore-another">Explore another path ↗</button><button class="text-button" data-action="back-map">View the full map</button></aside></div></section>';
  }

  function renderFact(label, value) {
    var values = Array.isArray(value) ? value : (value ? [value] : ['Add this detail in the content file.']);
    return '<section class="fact"><h2>' + escapeHtml(label) + '</h2><ul>' + values.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></section>';
  }

  function renderFactList(value) {
    var values = Array.isArray(value) ? value : (value ? [value] : ['Add this detail in the content file.']);
    return '<ul>' + values.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
  }

  function formatList(value) { return Array.isArray(value) ? value.join(' · ') : String(value || ''); }

  function formatSalary(salary) {
    if (!salary) return 'Research pending';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'object') {
      var range = salary.range || salary.entryRange || salary.amount;
      if (range) return String(range) + (salary.note ? ' · ' + String(salary.note) : '');
      if (salary.status === 'research-pending') return 'Research pending';
    }
    return 'Research pending';
  }

  function renderDock() {
    if (!dock) return;
    var earned = state.earned.map(function (entry) { return typeof entry === 'string' ? { skillId: entry, nodeId: '' } : entry; });
    var items = earned.map(function (entry, index) {
      var skill = model.skills[entry.skillId] || { id: entry.skillId, name: titleCase(entry.skillId), color: '#f6c453' };
      var node = findNode(entry.nodeId);
      return '<button class="hex-item' + (index === earned.length - 1 && state.lastAward ? ' skill-hex--new' : '') + '" type="button" data-action="inspect-skill" data-skill-id="' + escapeAttr(skill.id) + '" aria-label="' + escapeAttr(skill.name + ' skill, earned from ' + (node ? node.title : 'your journey')) + '" style="--skill-color:' + escapeAttr(skill.color || '#f6c453') + '"><span aria-hidden="true">✦</span><strong>' + escapeHtml(skill.shortName || skill.name) + '</strong><small>' + escapeHtml(skill.category || 'discovery') + '</small></button>';
    });
    dock.className = 'skill-dock' + (items.length ? ' has-skills' : '');
    dock.innerHTML = '<div class="dock-inner"><div class="dock-label"><span class="dock-pip" aria-hidden="true"></span><div><h2>SKILL STACK</h2><p>' + (items.length ? items.length + ' discovered' : 'Your launch kit is empty') + '</p></div></div><div class="hex-track" id="skill-dock-list" role="list" aria-label="Skills earned during this journey">' + (items.length ? items.join('') : '<div class="hex-empty" role="listitem"><span aria-hidden="true">+</span><span>Earn skills<br>as you explore</span></div>') + '</div><div class="dock-tip"><span aria-hidden="true">⌁</span> Each mission adds a new edge</div></div>';
  }

  // ---------- Events and transitions --------------------------------------------

  function wireEvents() {
    root.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', handleAction); });
    if (dock) dock.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', handleAction); });
    var form = document.getElementById('start-form');
    if (form) form.addEventListener('submit', handleStart);
  }

  function handleStart(event) {
    event.preventDefault();
    var input = document.getElementById('player-name');
    var name = input && input.value.trim();
    if (!name) { if (input) { input.focus(); input.setCustomValidity('Add your first name to begin.'); input.reportValidity(); } return; }
    if (input) input.setCustomValidity('');
    state.name = name; state.screen = 'map'; saveState(); render(); announce('Welcome, ' + name + '. Choose a starting region.');
  }

  function handleAction(event) {
    var element = event.currentTarget, action = element.getAttribute('data-action');
    if (action === 'choose-avatar') { state.avatar = element.getAttribute('data-avatar') || 'comet'; render(); return; }
    if (action === 'resume') { state.screen = 'map'; saveState(); render(); announce('Journey resumed.'); return; }
    if (action === 'open-node') { openNode(element.getAttribute('data-node-id')); return; }
    if (action === 'skip-node') { completeNode(state.selectedNodeId); return; }
    if (action === 'back-map' || action === 'explore-another') { state.screen = 'map'; state.selectedNodeId = null; saveState(); render(); announce('Back on the map. Choose another point to explore.'); return; }
    if (action === 'restart') { modalReturnFocus = element; showRestartModal(); return; }
    if (action === 'inspect-skill') { modalReturnFocus = element; showSkillModal(element.getAttribute('data-skill-id')); return; }
  }

  function openNode(id) {
    var node = findNode(id);
    if (!node || !isVisible(node)) return;
    state.selectedNodeId = id;
    if (node.children && node.children.length && !node.career) {
      // Domain nodes still get their own planned challenge; its children become available after Skip.
    }
    state.screen = 'mini'; saveState(); render(); announce(node.title + ' opened. Planned mini-game placeholder.');
  }

  function completeNode(id) {
    var node = findNode(id); if (!node) return;
    var alreadyDone = isCompleted(id);
    if (!alreadyDone) state.completed.push(id);
    var skill = skillFor(node);
    var hasReward = state.earned.some(function (entry) { return (typeof entry === 'string' ? entry : entry.nodeId) === id; });
    if (!hasReward) state.earned.push({ skillId: skill.id, nodeId: id, earnedAt: Date.now() });
    state.lastAward = true;
    state.selectedNodeId = id;
    saveState();
    if (node.career) { state.lastCareerId = node.career.id || node.career.title; state.screen = 'career'; saveState(); render(); animateSkillReward(skill); announce('Career match unlocked: ' + (node.career.title || node.career.name) + '.'); return; }
    state.screen = 'map'; saveState(); render();
    if (!alreadyDone) animateSkillReward(skill);
    announce(alreadyDone ? skill.name + ' is already in your stack.' : skill.name + ' added to your skill stack.');
    showToast(alreadyDone ? 'Skill already discovered' : '+' + skill.name + ' added to your stack', skill, !alreadyDone);
    window.setTimeout(function () { state.lastAward = false; renderDock(); }, prefersReducedMotion ? 0 : 850);
  }

  function showToast(message, skill, reward) {
    if (!toastRegion) return;
    toastRegion.innerHTML = '<div class="toast ' + (reward ? 'toast--reward' : '') + '" role="status"><span class="toast-mark" style="--skill-color:' + escapeAttr(skill && skill.color || '#f6c453') + '" aria-hidden="true">✦</span><span>' + escapeHtml(message) + '</span></div>';
    window.setTimeout(function () { if (toastRegion) toastRegion.innerHTML = ''; }, 3200);
  }

  function animateSkillReward(skill) {
    if (prefersReducedMotion || !dock) return;
    var target = dock.getBoundingClientRect();
    var startX = window.innerWidth * 0.5;
    var startY = window.innerHeight * 0.42;
    var endX = Math.min(target.right - 90, target.left + Math.max(250, target.width * 0.42));
    var endY = target.top + 34;
    var flight = document.createElement('span');
    flight.className = 'hex-flight';
    flight.setAttribute('aria-hidden', 'true');
    flight.style.left = startX + 'px';
    flight.style.top = startY + 'px';
    flight.style.setProperty('--skill-color', skill && skill.color || '#f6c453');
    flight.style.setProperty('--flight-x', (endX - startX) + 'px');
    flight.style.setProperty('--flight-y', (endY - startY) + 'px');
    document.body.appendChild(flight);
    window.setTimeout(function () { if (flight.parentNode) flight.parentNode.removeChild(flight); }, 760);
  }

  function announce(message) {
    if (toastRegion) {
      toastRegion.setAttribute('aria-live', 'polite');
      // Keep map/challenge transitions audible even when there is no visual toast.
      toastRegion.innerHTML = '<span class="sr-only" role="status">' + escapeHtml(message) + '</span>';
    }
    if (window.console && window.console.debug) window.console.debug('[Launchpad]', message);
  }

  // ---------- Small modal surfaces ------------------------------------------------

  function showRestartModal() {
    if (!modalRoot) { resetState(); return; }
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">RESET FIELD GUIDE</p><h2 id="restart-title">Start a fresh journey?</h2><p>Your current name, map progress, and skill stack will be cleared from this browser.</p><div class="modal-actions"><button class="button button--quiet" data-action="close-modal">Keep exploring</button><button class="button button--danger" data-action="confirm-restart">Restart journey</button></div></section></div>';
    modalRoot.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', function (event) { if (event.target === event.currentTarget && element.getAttribute('data-action') === 'close-modal') closeModal(); else if (element.getAttribute('data-action') === 'close-modal') closeModal(); else if (element.getAttribute('data-action') === 'confirm-restart') resetState(); }); });
    var close = modalRoot.querySelector('.modal-close'); if (close) close.focus();
  }

  function showSkillModal(skillId) {
    var skill = model.skills[skillId] || { name: titleCase(skillId), color: '#f6c453' };
    var earned = state.earned.find(function (entry) { return (typeof entry === 'string' ? entry : entry.skillId) === skillId; });
    var node = earned && typeof earned !== 'string' ? findNode(earned.nodeId) : null;
    if (!modalRoot) return;
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--skill" role="dialog" aria-modal="true" aria-labelledby="skill-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="hex hex--modal" style="--skill-color:' + escapeAttr(skill.color || '#f6c453') + '" aria-hidden="true">✦</span><p class="eyebrow">SKILL DISCOVERED</p><h2 id="skill-title">' + escapeHtml(skill.name) + '</h2><p>' + escapeHtml((node ? 'You found this by exploring “' + node.title + '.”' : 'A building block in your career field guide.')) + '</p><button class="button button--primary button--wide" data-action="close-modal">Back to journey</button></section></div>';
    modalRoot.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', function () { closeModal(); }); });
    var close = modalRoot.querySelector('.modal-close'); if (close) close.focus();
  }

  function closeModal() {
    if (modalRoot) modalRoot.innerHTML = '';
    setModalSurfaces(false);
    var returnTarget = modalReturnFocus;
    modalReturnFocus = null;
    if (returnTarget && document.body.contains(returnTarget)) returnTarget.focus();
  }

  function setModalSurfaces(isOpen) {
    [root, dock, document.querySelector('.site-header')].forEach(function (surface) {
      if (surface) surface.inert = isOpen;
    });
  }

  function trapModalFocus(event) {
    if (!modalRoot || !modalRoot.innerHTML || event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(modalRoot.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (element) { return !element.disabled; });
    if (!focusable.length) { event.preventDefault(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function focusAfterRender() {
    var target = root.querySelector('h1, input, [data-action="open-node"]');
    if (!target || document.activeElement === target) return;
    window.setTimeout(function () { if (target && document.body.contains(target)) target.focus && target.focus(); }, prefersReducedMotion ? 0 : 40);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modalRoot && modalRoot.innerHTML) { closeModal(); return; }
    trapModalFocus(event);
  });

  function escapeHtml(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  function escapeAttr(value) { return escapeHtml(value); }

  render();
  window.CareerLaunchpadApp = { render: render, reset: resetState, getState: function () { return state; }, getModel: function () { return model; } };
}());
