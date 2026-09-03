/*
 * IS Career Launchpad — guided RPG progression controller
 *
 * Data and visuals remain separate from this file. The region and domain
 * selections use the placeholder → enjoyment check → reward/reroute
 * contract; the final specialization selection opens its career directly.
 */
(function careerLaunchpadApp() {
  'use strict';

  var STORAGE_KEY = 'is-career-launchpad:v2';
  var EXPLORER_AVATAR_SRC = '__EXPLORER_AVATAR_DATA_URI__';
  var STARTER_BADGE_SOURCES = {
    'creative-thinking': '__STARTER_BADGE_CREATIVE_THINKING_DATA_URI__',
    'coding-curiosity': '__STARTER_BADGE_CODING_CURIOSITY_DATA_URI__',
    'hands-on-tech': '__STARTER_BADGE_HANDS_ON_TECH_DATA_URI__',
    'visual-design': '__STARTER_BADGE_VISUAL_DESIGN_DATA_URI__',
    'numbers-patterns': '__STARTER_BADGE_NUMBERS_PATTERNS_DATA_URI__',
    'problem-solving': '__STARTER_BADGE_PROBLEM_SOLVING_DATA_URI__',
    'security-mindset': '__STARTER_BADGE_SECURITY_MINDSET_DATA_URI__',
    'communication': '__STARTER_BADGE_COMMUNICATION_DATA_URI__',
    'leadership': '__STARTER_BADGE_LEADERSHIP_DATA_URI__',
    'empathy': '__STARTER_BADGE_EMPATHY_DATA_URI__'
  };
  var JOURNEY_BADGE_SOURCES = {
    'creativity': STARTER_BADGE_SOURCES['creative-thinking'],
    'software': '__SKILL_BADGE_SOFTWARE_DATA_URI__',
    'coder': '__SKILL_BADGE_DEVELOPER_DATA_URI__',
    'designer': STARTER_BADGE_SOURCES['visual-design'],
    'hardware': STARTER_BADGE_SOURCES['hands-on-tech'],
    'analyst': STARTER_BADGE_SOURCES['problem-solving'],
    'numbers': STARTER_BADGE_SOURCES['numbers-patterns'],
    'hacker': '__SKILL_BADGE_HACKER_DATA_URI__',
    'trendy': '__SKILL_BADGE_TRENDY_DATA_URI__',
    'fortune-teller': '__SKILL_BADGE_FORTUNE_TELLER_DATA_URI__',
    'detective': '__SKILL_BADGE_DETECTIVE_DATA_URI__',
    'bodyguard': '__SKILL_BADGE_BODYGUARD_DATA_URI__',
    'people-skills': STARTER_BADGE_SOURCES['empathy'],
    'speech': STARTER_BADGE_SOURCES['communication'],
    'market-reach': '__SKILL_BADGE_MARKET_REACH_DATA_URI__',
    'logistical': '__SKILL_BADGE_LOGISTICAL_DATA_URI__',
    'renovator': '__SKILL_BADGE_RENOVATOR_DATA_URI__',
    'creative': '__SKILL_BADGE_CREATIVE_DATA_URI__',
    'strategist': STARTER_BADGE_SOURCES['leadership']
  };
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  var root = document.getElementById('app');
  var dock = document.getElementById('skill-dock');
  var toastRegion = document.getElementById('toast-region');
  var modalRoot = document.getElementById('modal-root');
  var headerStatus = document.getElementById('header-status-copy');

  if (!root) return;

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var research = window.CAREER_RESEARCH_DATA || { salaryByCareerId: {}, interviews: [], sourceLedger: [] };
  var model = normalizeData(window.CAREER_LAUNCHPAD_DATA || {});
  var state = loadState();
  var modalReturnFocus = null;
  var travelTimer = null;

  // ---------------------------------------------------------------------------
  // Data normalization
  // ---------------------------------------------------------------------------

  function starterFallback() {
    return [
      ['starter-creative-thinking', 'Creative Thinking', 'Creative', '✦', '#f6b347', [3, 1, 1]],
      ['starter-coding-curiosity', 'Coding Curiosity', 'Coding', '</>', '#49cfe0', [3, 1, 0]],
      ['starter-hands-on-tech', 'Hands-on Tech', 'Tech', '⚙', '#7da8ff', [3, 1, 0]],
      ['starter-visual-design', 'Visual Design', 'Design', '◈', '#f49ac2', [2, 0, 2]],
      ['starter-numbers-patterns', 'Numbers & Patterns', 'Patterns', '▥', '#a98df4', [0, 3, 1]],
      ['starter-problem-solving', 'Problem Solving', 'Solve', '?', '#8870e8', [1, 3, 1]],
      ['starter-security-mindset', 'Security Mindset', 'Security', '◇', '#ef7d78', [1, 3, 0]],
      ['starter-communication', 'Communication', 'Speak', '“”', '#5ed4a2', [0, 1, 3]],
      ['starter-leadership', 'Leadership', 'Lead', '▲', '#31b98d', [0, 1, 3]],
      ['starter-empathy', 'Empathy', 'Empathy', '♥', '#78d9be', [1, 0, 3]]
    ].map(function (item) {
      return {
        id: item[0], label: item[1], name: item[1], shortName: item[2], glyph: item[3], color: item[4], category: 'starter',
        description: 'Choose this if it feels like one of your strengths or interests.',
        affinities: { 'region-build-create': item[5][0], 'region-analyze-solve': item[5][1], 'region-people-lead': item[5][2] }
      };
    });
  }

  function normalizeSkill(skill) {
    var id = String(skill.id || skill.key || slug(skill.label || skill.name));
    return Object.assign({
      id: id,
      name: skill.name || skill.label || titleCase(id),
      label: skill.label || skill.name || titleCase(id),
      shortName: skill.shortName || skill.label || skill.name || titleCase(id),
      category: skill.category || 'discovery',
      color: skill.color || '#f6b347',
      glyph: skill.glyph || '✦',
      badgeIcon: skill.badgeIcon || 'spark',
      badgeAsset: skill.badgeAsset || id.replace(/^starter-/, '')
    }, skill);
  }

  function normalizeData(source) {
    var starterSkills = (Array.isArray(source.starterSkills) && source.starterSkills.length === 10 ? source.starterSkills : starterFallback()).map(normalizeSkill);
    var skills = {};
    starterSkills.concat(Array.isArray(source.skills) ? source.skills : []).forEach(function (skill) {
      var normalized = normalizeSkill(skill);
      skills[normalized.id] = normalized;
    });

    var careers = indexById(source.careers || []);
    Object.keys(research.salaryByCareerId || {}).forEach(function (careerId) {
      if (!careers[careerId]) return;
      var salaryResearch = research.salaryByCareerId[careerId];
      careers[careerId] = Object.assign({}, careers[careerId], {
        salary: Object.assign({}, careers[careerId].salary || {}, {
          status: 'researched',
          range: salaryResearch.entryRange && salaryResearch.entryRange.label,
          source: 'BLS OEWS May 2023 · SOC ' + salaryResearch.soc,
          note: salaryResearch.mapping,
          research: salaryResearch
        })
      });
    });
    var domains = Array.isArray(source.domains) ? source.domains : [];
    var specializations = Array.isArray(source.specializations) ? source.specializations : [];
    var regions = (Array.isArray(source.regions) ? source.regions : []).map(function (region, index) {
      var regionCopy = normalizeNode(region, null, skills, careers);
      regionCopy.number = String(index + 1);
      regionCopy.children = domains.filter(function (domain) { return domain.parentId === region.id; }).map(function (domain) {
        var domainCopy = normalizeNode(domain, region.id, skills, careers);
        domainCopy.children = specializations.filter(function (spec) { return spec.parentId === domain.id; }).map(function (spec) {
          return normalizeNode(spec, domain.id, skills, careers);
        });
        return domainCopy;
      });
      return regionCopy;
    });

    return { starterSkills: starterSkills, skills: skills, regions: regions, careers: careers };
  }

  /** Preserve authored camera stops while supplying safe offline defaults. */
  function normalizeScene(scene) {
    if (!scene || typeof scene !== 'object') return null;
    var camera = scene.camera && typeof scene.camera === 'object' ? scene.camera : {};
    var fallbackStops = [
      { x: 0, y: 70, compactX: 20, compactY: 66 },
      { x: 50, y: 48, compactX: 50, compactY: 48 },
      { x: 100, y: 57, compactX: 80, compactY: 55 }
    ];
    var authoredStops = Array.isArray(camera.stages) ? camera.stages : [];
    var stages = fallbackStops.map(function (fallback, index) {
      var stop = authoredStops[index] || {};
      return {
        x: finiteNumber(stop.x, fallback.x),
        y: finiteNumber(stop.y, fallback.y),
        compactX: finiteNumber(stop.compactX, fallback.compactX),
        compactY: finiteNumber(stop.compactY, fallback.compactY)
      };
    });
    return Object.assign({}, scene, {
      camera: {
        zoom: finiteNumber(camera.zoom, 250),
        compactZoom: finiteNumber(camera.compactZoom, finiteNumber(camera.zoom, 250)),
        stages: stages
      }
    });
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeNode(item, parentId, skills, careers) {
    var reward = item.earnedSkill || item.skill || null;
    var rewardSkill = typeof reward === 'string' ? skills[reward] : (reward ? normalizeSkill(reward) : null);
    if (rewardSkill) {
      if (!reward.color && item.color) rewardSkill.color = item.color;
      skills[rewardSkill.id] = Object.assign({}, skills[rewardSkill.id] || {}, rewardSkill);
    }
    return Object.assign({}, item, {
      id: String(item.id),
      parentId: item.parentId || parentId || null,
      title: item.title || item.name || titleCase(item.id),
      subtitle: item.subtitle || item.description || '',
      description: item.description || item.subtitle || '',
      scene: normalizeScene(item.scene),
      earnedSkill: rewardSkill ? rewardSkill.id : null,
      miniGame: item.miniGame ? Object.assign({ title: 'Planned mini-game', concept: 'A focused sixty-second challenge will live here.', durationSeconds: 60 }, item.miniGame) : null,
      career: item.career || careers[item.careerId] || null,
      children: []
    });
  }

  function indexById(list) {
    var result = {};
    (Array.isArray(list) ? list : []).forEach(function (item) { if (item && item.id) result[item.id] = item; });
    return result;
  }

  // ---------------------------------------------------------------------------
  // State and recommendation logic
  // ---------------------------------------------------------------------------

  function defaultState() {
    return {
      version: 2, screen: 'landing', name: '', avatar: 'cougar', starterSkills: [],
      recommendedRegionId: null, activeRegionId: null, activeDomainId: null,
      completed: [], earned: [], rejected: [], selectedNodeId: null,
      travelTargetId: null, travelFromId: null, lastCareerId: null, lastAward: false,
      reviewingNodeId: null,
      interview: defaultInterviewState()
    };
  }

  function defaultInterviewState() {
    return { careerId: null, questionIndex: 0, answers: {}, feedback: {}, status: 'idle', returnScreen: 'career' };
  }

  function interviewForCareer(careerId) {
    return (research.interviews || []).filter(function (interview) { return interview.careerId === careerId; })[0] || null;
  }

  function normalizeInterview(savedInterview) {
    var result = defaultInterviewState();
    if (!savedInterview || typeof savedInterview !== 'object') return result;
    var authored = interviewForCareer(savedInterview.careerId);
    if (!authored) return result;
    result.careerId = authored.careerId;
    result.questionIndex = Math.max(0, Math.min(2, Number(savedInterview.questionIndex) || 0));
    result.status = ['idle', 'in-progress', 'feedback', 'complete'].indexOf(savedInterview.status) === -1 ? 'idle' : savedInterview.status;
    result.returnScreen = savedInterview.returnScreen === 'career' ? 'career' : 'career';
    var validQuestionIds = authored.questions.map(function (question) { return question.id; });
    Object.keys(savedInterview.answers || {}).forEach(function (questionId) {
      if (validQuestionIds.indexOf(questionId) !== -1 && typeof savedInterview.answers[questionId] === 'string') result.answers[questionId] = savedInterview.answers[questionId].slice(0, 1000);
    });
    Object.keys(savedInterview.feedback || {}).forEach(function (questionId) {
      if (validQuestionIds.indexOf(questionId) === -1 || !savedInterview.feedback[questionId]) return;
      var feedback = savedInterview.feedback[questionId];
      result.feedback[questionId] = {
        level: feedback.level,
        wordCount: Number(feedback.wordCount) || 0,
        matchedCriterionIds: Array.isArray(feedback.matchedCriterionIds) ? feedback.matchedCriterionIds : [],
        missingCriterionIds: Array.isArray(feedback.missingCriterionIds) ? feedback.missingCriterionIds : []
      };
    });
    return result;
  }

  function validNodeIds(values) {
    return (Array.isArray(values) ? values : []).filter(function (id, index, list) {
      return typeof id === 'string' && list.indexOf(id) === index && !!findNode(id);
    });
  }

  function validStarterSkillIds(values) {
    return (Array.isArray(values) ? values : []).filter(function (id, index, list) {
      return typeof id === 'string' && list.indexOf(id) === index && !!model.skills[id] && model.starterSkills.some(function (skill) { return skill.id === id; });
    });
  }

  function validEarned(values) {
    return (Array.isArray(values) ? values : []).filter(function (entry) {
      var node = entry && typeof entry.nodeId === 'string' ? findNode(entry.nodeId) : null;
      return entry && typeof entry === 'object' && node && node.earnedSkill === entry.skillId && !!model.skills[entry.skillId];
    }).map(function (entry) {
      return { skillId: entry.skillId, nodeId: entry.nodeId, earnedAt: Number(entry.earnedAt) || 0 };
    });
  }

  function loadState() {
    var initial = defaultState();
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || saved.version !== 2) return initial;
      var restored = Object.assign(initial, saved, {
        starterSkills: validStarterSkillIds(saved.starterSkills).slice(0, 4),
        completed: validNodeIds(saved.completed),
        earned: validEarned(saved.earned),
        rejected: validNodeIds(saved.rejected),
        screen: ['landing', 'skill-select', 'map', 'travel', 'mini', 'reflection', 'career', 'interview-intro', 'interview-question', 'interview-feedback', 'interview-debrief'].indexOf(saved.screen) === -1 ? 'landing' : (saved.screen === 'travel' ? 'map' : saved.screen),
        reviewingNodeId: typeof saved.reviewingNodeId === 'string' && findNode(saved.reviewingNodeId) ? saved.reviewingNodeId : null,
        interview: normalizeInterview(saved.interview)
      });
      if (restored.starterSkills.length === 4 && !findNode(restored.activeRegionId)) restored.activeRegionId = recommendRegion(restored.starterSkills, restored.rejected).id;
      if (restored.screen === 'career' && !findNode(restored.selectedNodeId)) restored.screen = restored.starterSkills.length === 4 ? 'map' : 'landing';
      if ((restored.screen === 'mini' || restored.screen === 'reflection') && !findNode(restored.selectedNodeId)) restored.screen = restored.starterSkills.length === 4 ? 'map' : 'landing';
      var restoredNode = findNode(restored.selectedNodeId);
      if ((restored.screen === 'mini' || restored.screen === 'reflection') && restoredNode && !restoredNode.miniGame && restoredNode.career) {
        if (restored.completed.indexOf(restoredNode.id) === -1) restored.completed.push(restoredNode.id);
        restored.lastCareerId = restoredNode.career.id || restoredNode.career.title;
        restored.screen = 'career';
      }
      if (restored.screen === 'career' && restoredNode && restoredNode.career && restoredNode.earnedSkill && !restored.earned.some(function (entry) { return entry.nodeId === restoredNode.id; })) {
        restored.earned.push({ skillId: restoredNode.earnedSkill, nodeId: restoredNode.id, earnedAt: Date.now() });
      }
      if (['interview-intro', 'interview-question', 'interview-feedback', 'interview-debrief'].indexOf(restored.screen) !== -1 && !interviewForCareer(restored.interview.careerId)) restored.screen = 'career';
      restored.avatar = 'cougar';
      return restored;
    } catch (error) { return initial; }
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* Storage can be unavailable in private mode. */ }
  }

  function resetState() {
    if (travelTimer) window.clearTimeout(travelTimer);
    state = defaultState(); saveState(); closeModal(); render();
    announce('Journey restarted. Choose your explorer.');
  }

  function scoreRegions(selection) {
    var scores = {};
    model.regions.forEach(function (region) { scores[region.id] = 0; });
    selection.forEach(function (skillId) {
      var skill = model.skills[skillId];
      if (!skill || !skill.affinities) return;
      model.regions.forEach(function (region) { scores[region.id] += Number(skill.affinities[region.id] || 0); });
    });
    return scores;
  }

  function rankedRegions(selection, excluded) {
    var scores = scoreRegions(selection);
    var blocked = excluded || [];
    return model.regions.slice().sort(function (a, b) {
      var difference = scores[b.id] - scores[a.id];
      return difference || model.regions.indexOf(a) - model.regions.indexOf(b);
    }).filter(function (region) { return blocked.indexOf(region.id) === -1; });
  }

  function recommendRegion(selection, excluded) {
    return rankedRegions(selection, excluded)[0] || rankedRegions(selection, [])[0] || model.regions[0];
  }

  function findNode(id, nodes) {
    nodes = nodes || model.regions;
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].id === id) return nodes[i];
      var found = findNode(id, nodes[i].children || []);
      if (found) return found;
    }
    return null;
  }

  function nodeDepth(node) {
    var depth = 0;
    while (node && node.parentId) { depth += 1; node = findNode(node.parentId); }
    return depth;
  }

  function isCompleted(id) { return state.completed.indexOf(id) !== -1; }
  function isRejected(id) { return state.rejected.indexOf(id) !== -1; }
  function skillFor(node) { return model.skills[node && node.earnedSkill] || normalizeSkill({ id: 'discovery', label: 'Discovery' }); }

  function currentJourneyNode() {
    if (state.activeDomainId && isCompleted(state.activeDomainId)) return findNode(state.activeDomainId);
    if (state.activeRegionId && isCompleted(state.activeRegionId)) return findNode(state.activeRegionId);
    return null;
  }

  function canOpen(node) {
    if (!node || isRejected(node.id)) return false;
    var depth = nodeDepth(node);
    // Completed stops stay reviewable, but only inside the route currently on screen.
    if (isCompleted(node.id)) {
      if (depth === 0) return node.id === state.activeRegionId;
      if (depth === 1) return node.parentId === state.activeRegionId;
      return node.parentId === state.activeDomainId;
    }
    if (depth === 0) return node.id === state.activeRegionId;
    if (depth === 1) return node.parentId === state.activeRegionId && isCompleted(state.activeRegionId);
    return node.parentId === state.activeDomainId && isCompleted(state.activeDomainId);
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function render() {
    root.innerHTML = renderScreen(); renderDock(); updateHeader(); wireEvents();
    window.scrollTo(0, 0); focusAfterRender();
  }

  function renderScreen() {
    if (state.screen === 'landing') return renderLanding();
    if (state.screen === 'skill-select') return renderSkillSelect();
    if (state.screen === 'map' || state.screen === 'travel') return renderMap();
    if (state.screen === 'mini') return renderMiniGame(findNode(state.selectedNodeId));
    if (state.screen === 'reflection') return renderReflection(findNode(state.selectedNodeId));
    if (state.screen === 'career') return renderCareer(findNode(state.selectedNodeId));
    if (state.screen === 'interview-intro') return renderInterviewIntro();
    if (state.screen === 'interview-question') return renderInterviewQuestion();
    if (state.screen === 'interview-feedback') return renderInterviewFeedback();
    if (state.screen === 'interview-debrief') return renderInterviewDebrief();
    return renderLanding();
  }

  function renderLanding() {
    return '<section class="screen hero-screen screen--landing" aria-labelledby="welcome-title">' +
      '<div class="landing-sky" aria-hidden="true"><span class="star star--one"></span><span class="star star--two"></span><span class="star star--three"></span><span class="planet"></span></div>' +
      '<div class="hero-copy landing-copy"><p class="screen-kicker">INFORMATION SYSTEMS / FIELD GUIDE 02</p><h1 id="welcome-title" class="screen-title" tabindex="-1">Build your skills.<br><em>Find your world.</em></h1><p class="screen-subtitle">Choose the strengths that feel like you, then watch your explorer travel through an IS career world built around them.</p>' +
      '<form id="start-form" class="launch-card start-card"><p class="card-label">Create your explorer</p><label for="player-name">What should we call you?</label><input id="player-name" name="playerName" autocomplete="name" maxlength="32" placeholder="Your first name" value="' + escapeHtml(state.name) + '" required><div class="assigned-explorer"><span class="assigned-status" aria-hidden="true">✓</span><div><small>Your explorer is ready</small><strong>BYU Cougar</strong><p>One guide. Every world. Your skills shape the route.</p></div></div><button class="button button--primary button--wide" type="submit">Choose my starter skills <span aria-hidden="true">→</span></button></form>' +
      (state.name && state.starterSkills.length === 4 ? '<button class="text-button" data-action="resume">Resume ' + escapeHtml(state.name) + '’s journey</button>' : '') + '</div><aside class="landing-explorer-stage" aria-label="Your BYU cougar explorer"><div class="explorer-orbit" aria-hidden="true"></div><img class="explorer-avatar explorer-avatar--hero" src="' + EXPLORER_AVATAR_SRC + '" width="1254" height="1254" alt="Pixel-art BYU cougar wearing a blue Y hoodie and backpack"><div class="explorer-id"><span>PLAYER 01</span><strong>COUGAR EXPLORER</strong><small>Ready for launch</small></div></aside><p class="landing-note">Four starter skills · three worlds · one career path</p></section>';
  }

  function renderSkillSelect() {
    var selected = state.starterSkills;
    return '<section class="screen screen--skills" aria-labelledby="skills-title"><div class="skills-heading"><div><p class="screen-kicker">LOADOUT / CHOOSE 4 OF 10</p><h1 id="skills-title" tabindex="-1">What are you good at—<br><em>or excited to become good at?</em></h1><p>Select exactly four. Your combination becomes your first skill stack and points your compass toward a career world.</p></div><div class="selection-meter" aria-live="polite"><strong>' + selected.length + '<span>/4</span></strong><small>skills selected</small></div></div><div class="starter-skill-grid">' + model.starterSkills.map(function (skill, index) {
      var picked = selected.indexOf(skill.id) !== -1;
      var unavailable = selected.length >= 4 && !picked;
      var badgeSource = STARTER_BADGE_SOURCES[skill.badgeAsset] || '';
      return '<button class="starter-skill' + (picked ? ' is-picked' : '') + '" type="button" data-action="toggle-starter" data-skill-id="' + escapeAttr(skill.id) + '" aria-pressed="' + picked + '" ' + (unavailable ? 'aria-disabled="true"' : '') + ' style="--skill-color:' + escapeAttr(skill.color) + '"><span class="starter-number">' + String(index + 1).padStart(2, '0') + '</span><span class="starter-badge-frame" aria-hidden="true"><img class="starter-badge-art" src="' + badgeSource + '" alt=""><i class="starter-selected-mark">✓</i></span><strong>' + escapeHtml(skill.label) + '</strong><small>' + escapeHtml(skill.description) + '</small><span class="pick-state">' + (picked ? 'Selected ✓' : 'Choose +') + '</span></button>';
    }).join('') + '</div><div class="skills-footer"><button class="text-button" data-action="back-landing">← Back</button><p>' + (selected.length === 4 ? 'Your compass is ready.' : 'Choose ' + (4 - selected.length) + ' more to continue.') + '</p><button class="button button--primary" data-action="confirm-skills" ' + (selected.length === 4 ? '' : 'disabled') + '>Reveal my world <span aria-hidden="true">↗</span></button></div></section>';
  }

  function renderMap() {
    var region = findNode(state.activeRegionId) || recommendRegion(state.starterSkills, state.rejected);
    if (!region) return '<section class="screen"><h1>No map data found</h1></section>';
    var scene = region.scene || {};
    var regionDone = isCompleted(region.id);
    var domain = state.activeDomainId ? findNode(state.activeDomainId) : null;
    var domainDone = domain && isCompleted(domain.id);
    var stage = domainDone ? 2 : regionDone ? 1 : 0;
    var options = stage === 0 ? [region] : stage === 1 ? region.children : domain.children;
    var openRouteCount = options.filter(function (node) { return !isRejected(node.id) && !isCompleted(node.id); }).length;
    var current = currentJourneyNode();
    var scores = scoreRegions(state.starterSkills);
    var recommendation = region.id === state.recommendedRegionId ? 'BEST STARTING MATCH' : 'NEXT BEST MATCH';
    // Keep the lower fork above the fixed skill stack on compact phone screens.
    // Keep both phone forks above the fixed skill HUD; the chapter label now
    // lives in the sky band, leaving the lower terrain band available for the
    // route card and traveling explorer.
    var compactMap = window.innerWidth <= 767;
    var lowerChoiceY = compactMap ? 43 : 53;
    var choiceX = compactMap ? 72 : 75;
    var sceneNodes = [];
    if (stage === 0) sceneNodes.push({ node: region, position: { x: 58, y: window.innerWidth <= 430 ? 39 : 43 }, kind: 'region', routeIndex: 0 });
    if (stage === 1) {
      sceneNodes.push({ node: region, position: { x: 20, y: 62 }, kind: 'past' });
      region.children.forEach(function (item, index) { sceneNodes.push({ node: item, position: { x: 72, y: index ? lowerChoiceY : 29 }, kind: 'choice', routeIndex: index }); });
    }
    if (stage === 2) {
      sceneNodes.push({ node: region, position: { x: 24, y: 62 }, kind: 'past-region' });
      sceneNodes.push({ node: domain, position: { x: 47, y: 62 }, kind: 'past-domain' });
      domain.children.forEach(function (item, index) { sceneNodes.push({ node: item, position: { x: choiceX, y: index ? lowerChoiceY : 29 }, kind: 'choice', routeIndex: index }); });
    }
    var avatarPosition = avatarMapPosition(stage, current && current.id, sceneNodes);
    var travelTarget = state.travelTargetId && sceneNodes.filter(function (entry) { return entry.node.id === state.travelTargetId; })[0];
    var travelFrom = state.travelFromId && sceneNodes.filter(function (entry) { return entry.node.id === state.travelFromId; })[0];
    var targetPosition = travelTarget ? avatarMapPosition(stage, travelTarget.node.id, sceneNodes) : avatarPosition;
    var fromPosition = travelFrom ? avatarMapPosition(stage, travelFrom.node.id, sceneNodes) : avatarPosition;
    var routePath = scene.paths && scene.paths[stage] || 'M80 360 C220 380 355 270 580 224 S730 154 850 155';
    var sceneStyle = '--scene-sky:' + escapeAttr(scene.sky || '#9ed8eb') + ';--scene-horizon:' + escapeAttr(scene.horizon || '#a4d477') + ';--scene-terrain:' + escapeAttr(scene.terrain || '#347c51') + ';--scene-mountain:' + escapeAttr(scene.mountain || '#6d8fa5') + ';--scene-sun:' + escapeAttr(scene.sun || '#ffb647') + ';--scene-haze:' + escapeAttr(scene.haze || '#d9f4ef') + ';--scene-accent:' + escapeAttr(scene.accent || region.color || '#2f6fed') + ';' + cameraStyle(scene, stage);

    var travelClass = state.screen === 'travel' ? ' is-traveling' : '';
    var shiftClass = state.lastAward ? ' is-shifting' : '';
    var travelBanner = state.screen === 'travel' && travelTarget
      ? '<div class="travel-banner" aria-live="polite"><span>EXPLORER MOVING</span><strong>' + escapeHtml(travelTarget.node.title) + '</strong><i aria-hidden="true"></i></div>'
      : '';
    var panorama = '<div class="world-panorama" aria-hidden="true"><div class="world-atlas"><span class="atlas-art"></span><span class="atlas-color-grade"></span><span class="atlas-contours"></span><span class="atlas-vignette"></span></div><div class="world-sky"><span class="world-haze"></span></div></div>';
    var avatar = '<div class="map-avatar avatar-cougar' + travelClass + (state.lastAward ? ' is-arrived' : '') + '" style="--from-x:' + fromPosition.x + '%;--from-y:' + fromPosition.y + '%;--to-x:' + targetPosition.x + '%;--to-y:' + targetPosition.y + '%" aria-label="' + escapeAttr((state.name || 'Your explorer') + (state.screen === 'travel' ? ' traveling to ' + (travelTarget ? travelTarget.node.title : 'the next stop') : ' current map position')) + '"><span class="avatar-shell" aria-hidden="true"><img class="explorer-avatar explorer-avatar--map" src="' + EXPLORER_AVATAR_SRC + '" width="1254" height="1254" alt=""></span><small>' + escapeHtml(state.name || 'YOU') + '</small></div>';
    var mapTitle = stage === 0 ? 'What gives you energy?' : stage === 1 ? 'Choose your next trail.' : 'One last fork in the road.';
    var chapterTitle = stage === 0 ? region.title : stage === 1 ? 'Choose a domain' : 'Choose a career style';

    return '<section class="screen screen--map world-screen" aria-labelledby="map-title">' +
      '<header class="world-header"><div><p class="screen-kicker">WORLD ' + region.number + ' / ' + recommendation + '</p><h1 id="map-title" tabindex="-1">' + mapTitle + '</h1><p>' + mapPrompt(stage, region, domain) + '</p></div><div class="compass-card" style="--region-color:' + escapeAttr(region.color) + '"><span>Your skill compass points to</span><strong>' + escapeHtml(region.title) + '</strong><small>Match score ' + Number(scores[region.id] || 0) + ' · based on your four skills</small><button class="text-button" data-action="edit-skills">Edit starter skills</button></div></header>' +
      '<section class="rpg-world stage-' + stage + ' theme-' + escapeAttr(region.theme || slug(region.id)) + travelClass + shiftClass + '" data-camera-stage="' + stage + '" style="' + sceneStyle + '" aria-label="Interactive journey map">' + panorama +
      renderQuestPath(stage, sceneNodes, routePath) +
      sceneNodes.map(renderWorldStop).join('') + avatar + travelBanner +
      '<div class="world-stage-label"><span>CHAPTER ' + (stage + 1) + ' OF 3</span><strong>' + escapeHtml(chapterTitle) + '</strong>' + renderJourneyMeter(stage) + '</div></section>' +
      '<div class="map-action-row"><p>' + (stage === 2 ? '<strong>' + openRouteCount + '</strong> career possibilit' + (openRouteCount === 1 ? 'y' : 'ies') + ' ready to explore.' : '<strong>' + openRouteCount + '</strong> forward route' + (openRouteCount === 1 ? '' : 's') + ' open · a “no” closes that trail and returns you here.') + '</p><button class="button button--quiet" data-action="restart">Restart journey</button></div></section>';
  }

  /**
   * Preserve each world's authored terrain curves while snapping the live
   * branches to their destination cards. Separate branch groups let pointer,
   * keyboard, and travel states highlight one choice at a time.
   */
  function renderQuestPath(stage, entries, authoredPath) {
    var segments = String(authoredPath || '').match(/M[^M]*/g) || [];
    var destinations = entries.filter(function (entry) { return typeof entry.routeIndex === 'number'; });
    var trunk = stage > 0 && segments[0] ? segments[0].trim() : '';
    var branches = destinations.map(function (entry, index) {
      var segmentIndex = stage === 0 ? index : index + 1;
      var authored = segments[segmentIndex] || segments[segments.length - 1] || authoredPath;
      return { nodeId: entry.node.id, path: alignRouteEndpoint(authored, entry.position) };
    });
    var trunkMarkup = trunk
      ? '<path class="route-shadow" d="' + escapeAttr(trunk) + '"></path><path class="route-complete" d="' + escapeAttr(trunk) + '"></path>'
      : '';
    var branchMarkup = branches.map(function (branch) {
      return '<g class="route-option" data-route-node-id="' + escapeAttr(branch.nodeId) + '"><path class="route-shadow" d="' + escapeAttr(branch.path) + '"></path><path class="route-line" d="' + escapeAttr(branch.path) + '"></path><path class="route-pulse" d="' + escapeAttr(branch.path) + '"></path></g>';
    }).join('');
    return '<svg class="quest-path" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">' + trunkMarkup + branchMarkup + '</svg>';
  }

  function alignRouteEndpoint(path, position) {
    var endpointX = Math.round(position.x * 10);
    var endpointY = Math.round(position.y * 5.2);
    return String(path || '').trim().replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*$/, endpointX + ' ' + endpointY);
  }

  /** Translate authored chapter stops into CSS camera variables. */
  function cameraStyle(scene, stage) {
    var camera = scene.camera || {};
    var stops = Array.isArray(camera.stages) && camera.stages.length === 3 ? camera.stages : [
      { x: 0, y: 70, compactX: 20, compactY: 66 },
      { x: 50, y: 48, compactX: 50, compactY: 48 },
      { x: 100, y: 57, compactX: 80, compactY: 55 }
    ];
    var current = stops[Math.max(0, Math.min(2, stage))];
    var previous = stops[Math.max(0, stage - 1)];
    return [
      '--camera-zoom:' + finiteNumber(camera.zoom, 250) + '%',
      '--camera-compact-zoom:' + finiteNumber(camera.compactZoom, finiteNumber(camera.zoom, 250)) + '%',
      '--camera-x:' + finiteNumber(current.x, 50) + '%',
      '--camera-y:' + finiteNumber(current.y, 50) + '%',
      '--camera-from-x:' + finiteNumber(previous.x, current.x) + '%',
      '--camera-from-y:' + finiteNumber(previous.y, current.y) + '%',
      '--camera-compact-x:' + finiteNumber(current.compactX, current.x) + '%',
      '--camera-compact-y:' + finiteNumber(current.compactY, current.y) + '%',
      '--camera-compact-from-x:' + finiteNumber(previous.compactX, previous.x) + '%',
      '--camera-compact-from-y:' + finiteNumber(previous.compactY, previous.y) + '%'
    ].join(';');
  }

  function renderJourneyMeter(stage) {
    var labels = ['Arrival', 'Crossroads', 'Career'];
    return '<ol class="journey-meter" aria-label="Journey progress">' + labels.map(function (label, index) {
      var status = index < stage ? ' is-complete' : index === stage ? ' is-current' : '';
      return '<li class="' + status + '"><i aria-hidden="true">' + (index < stage ? '✓' : index + 1) + '</i><small>' + label + '</small></li>';
    }).join('') + '</ol>';
  }

  function renderWorldStop(entry) {
    var node = entry.node;
    var skill = node.earnedSkill ? skillFor(node) : null;
    var rejected = isRejected(node.id);
    var complete = isCompleted(node.id);
    var open = canOpen(node);
    var destination = state.screen === 'travel' && state.travelTargetId === node.id;
    var status = destination ? 'TRAVELING' : rejected ? 'TRAIL CLOSED' : complete ? 'EXPLORED' : node.career && !node.miniGame ? 'CAREER POSSIBILITY' : 'NEXT STOP';
    var routeAttribute = typeof entry.routeIndex === 'number' ? ' data-route-node-id="' + escapeAttr(node.id) + '"' : '';
    var marker = rejected ? '×' : complete || entry.kind.indexOf('past') === 0 ? '✓' : '';
    return '<button class="world-stop world-stop--' + entry.kind + (rejected ? ' is-rejected' : '') + (complete ? ' is-complete' : '') + (destination ? ' is-destination' : '') + '" type="button" data-action="open-node" data-node-id="' + escapeAttr(node.id) + '"' + routeAttribute + ' style="--x:' + entry.position.x + '%;--y:' + entry.position.y + '%;--node-color:' + escapeAttr(node.color || '#2f6fed') + '" ' + (open ? '' : 'disabled') + '><span class="stop-icon stop-icon--badge' + originalBadgeClass(skill) + '" aria-hidden="true">' + renderBadgeArtwork(skill) + (marker ? '<i class="stop-status-mark">' + marker + '</i>' : '') + '</span><span class="stop-copy"><small>' + escapeHtml(status) + '</small><strong>' + escapeHtml(node.title) + '</strong><em>' + escapeHtml(rejected ? 'You chose the other path' : node.subtitle) + '</em></span></button>';
  }

  function avatarMapPosition(stage, currentId, entries) {
    var compact = window.innerWidth <= 767;
    var shortLandscape = window.matchMedia && window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
    if (!currentId) return { x: compact ? 18 : 14, y: 67 };
    var current = entries.filter(function (entry) { return entry.node.id === currentId; })[0];
    // Keep the cougar in a quiet clearing beside the route card. This makes the
    // explorer feel connected to the stop without covering its badge or copy.
    if (current && current.kind.indexOf('past') === 0) {
      if (compact) return { x: 20, y: 75 };
      if (current.kind === 'past-domain') return { x: 60, y: 86 };
      if (shortLandscape) return { x: 45, y: 77 };
      return { x: 36, y: 72 };
    }
    if (current) {
      return {
        x: Math.max(compact ? 18 : 12, current.position.x - (compact ? 27 : 19)),
        y: Math.min(78, current.position.y + 11)
      };
    }
    if (stage === 2) return { x: compact ? 20 : 60, y: 86 };
    if (stage === 1) return { x: compact ? 20 : 36, y: 72 };
    return { x: compact ? 18 : 14, y: 67 };
  }

  function mapPrompt(stage, region, domain) {
    if (stage === 0) return 'Your four starter skills brought you to ' + region.title + '. Move your explorer to the first challenge.';
    if (stage === 1) return 'The world shifts forward. Choose the kind of ' + region.title.toLowerCase() + ' work you want to try.';
    return 'You enjoyed ' + domain.title + '. Choose the work style that sounds most like you.';
  }

  function renderMiniGame(node) {
    if (!node || !node.miniGame) return renderMap();
    var skill = skillFor(node);
    var mini = node.miniGame || {};
    return '<section class="screen screen--challenge" aria-labelledby="challenge-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to map</button><span class="progress-chip">~60 SEC / PLANNED</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="challenge-layout"><div class="challenge-copy"><p class="eyebrow">' + escapeHtml(node.id) + ' / MINI-GAME STOP</p><h1 id="challenge-title" tabindex="-1">' + escapeHtml(mini.title) + '</h1><p class="lede">' + escapeHtml(mini.concept || mini.description) + '</p><div class="reward-callout"><span class="hex hex--small badge-hex badge-hex--icon' + originalBadgeClass(skill) + '" aria-hidden="true">' + renderBadgeArtwork(skill) + '</span><div><span class="eyebrow">POSSIBLE NEW SKILL</span><strong>' + escapeHtml(skill.name) + '</strong><p>You earn it only if you choose to keep following this trail.</p></div></div><div class="challenge-actions"><button class="button button--primary" data-action="finish-game">Skip game for now <span aria-hidden="true">→</span></button><button class="text-button" data-action="back-map">Return to map</button></div></div><div class="placeholder-stage" role="region" aria-label="Planned mini-game workspace"><div class="stage-grid" aria-hidden="true"></div><div class="placeholder-card"><span class="placeholder-icon" aria-hidden="true">⌁</span><span class="eyebrow">GAME SPACE / EDITABLE MODULE</span><h2>' + escapeHtml(mini.title) + '</h2><p>' + escapeHtml(mini.instructions || 'Placeholder ready for a future interactive build.') + '</p><div class="placeholder-meta"><span>~ ' + escapeHtml(mini.durationSeconds || 60) + ' sec</span><span>' + escapeHtml(mini.visualType || 'activity') + '</span></div></div></div></div></section>';
  }

  function renderReflection(node) {
    var skill = skillFor(node);
    var alternative = findAlternative(node);
    return '<section class="screen screen--reflection" aria-labelledby="reflection-title"><div class="reflection-scene"><div class="reflection-avatar avatar-cougar" aria-hidden="true"><img class="explorer-avatar explorer-avatar--reflection" src="' + EXPLORER_AVATAR_SRC + '" width="1254" height="1254" alt=""></div><div class="reflection-card"><p class="screen-kicker">TRAIL CHECKPOINT</p><h1 id="reflection-title" tabindex="-1">Did you enjoy that kind of activity?</h1><p>Your answer changes the map. There is no wrong response—this is about noticing what gives you energy.</p><div class="reflection-choice-grid"><button class="reflection-choice reflection-choice--yes" data-action="enjoy-yes"><span aria-hidden="true">✓</span><strong>Yes, keep going</strong><small>Add <b>' + escapeHtml(skill.name) + '</b> and reveal the next stage.</small></button><button class="reflection-choice reflection-choice--maybe" data-action="enjoy-maybe"><span aria-hidden="true">?</span><strong>Maybe, show me more</strong><small>Keep this trail open without changing your progress.</small></button><button class="reflection-choice reflection-choice--no" data-action="enjoy-no"><span aria-hidden="true">↶</span><strong>No, try another trail</strong><small>' + escapeHtml(alternative ? 'Not for me? Confirm to try ' + alternative.title + '.' : 'Not for me? Confirm to reopen your closest matches.') + '</small></button></div><button class="text-button" data-action="back-map">I’m not sure yet — return to map</button></div></div></section>';
  }

  function renderCareer(node) {
    var career = node && node.career || { title: 'Career match', summary: 'A career path is ready to explore.' };
    var candidate = career.strongCandidate || career.candidate;
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) candidate = (candidate.skills || []).concat(candidate.experience || [], candidate.projects || [], candidate.certifications || []);
    var lists = [
      ['Day to day', career.dayToDay || career.responsibilities], ['Typical projects', career.typicalProjects || career.projects],
      ['Where they work', career.workSettings || career.workplace], ['Industries', career.industries], ['Company types', career.companyTypes || career.companies],
      ['Technical skills', career.technicalSkills || career.skills], ['Tools & technology', career.toolsAndTechnologies || career.tools],
      ['Entry-level needs', career.entryLevelNeeds || career.entryLevel], ['Strong candidate', candidate]
    ];
    var salaryResearch = research.salaryByCareerId[career.id];
    var interview = interviewForCareer(career.id);
    var practiceMarkup = interview
      ? '<div class="practice-card"><span class="eyebrow">INTERVIEW PRACTICE</span><strong>Make the role feel real.</strong><p>Three short prompts on experience, judgment, and your next step.</p><button class="button button-coral button--wide" data-action="open-interview" data-career-id="' + escapeAttr(career.id) + '">' + (state.interview.careerId === career.id && state.interview.status !== 'idle' ? 'Continue practice' : 'Practice a mock interview') + ' <span aria-hidden="true">↗</span></button></div>'
      : '<div class="practice-card practice-card--soon"><span class="eyebrow">INTERVIEW PRACTICE</span><strong>Coming next.</strong><p>We are authoring a dedicated practice path for this role. Explore the field notes above in the meantime.</p></div>';
    return '<section class="screen screen--career" aria-labelledby="career-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to world</button><button class="button button--quiet" data-action="restart">Restart</button></header><div class="career-hero"><p class="eyebrow">' + escapeHtml(node.id) + ' / CAREER MATCH</p><h1 id="career-title" tabindex="-1">' + escapeHtml(career.title) + '</h1><p class="lede">' + escapeHtml(career.summary || career.whatTheyDo) + '</p><div class="career-hero-meta"><span>Starter skills: <strong>4</strong></span><span>Journey skills: <strong>' + state.earned.length + '</strong></span><span>Path complete ✓</span></div></div><div class="career-grid"><div class="career-facts">' + lists.map(function (pair) { return '<section class="fact"><h2>' + escapeHtml(pair[0]) + '</h2>' + renderFactList(pair[1]) + '</section>'; }).join('') + '</div><aside class="career-sidebar"><div class="career-stat"><span class="eyebrow">ENTRY RANGE · NATIONAL PROXY</span><strong>' + escapeHtml(salaryResearch ? salaryResearch.entryRange.label : formatSalary(career.salary)) + '</strong><small>' + escapeHtml(salaryResearch ? 'BLS OEWS May 2023 · 10th–25th percentile · SOC ' + salaryResearch.soc : 'Salary context is being prepared.') + '</small></div><div class="career-stat"><span class="eyebrow">GROWTH</span><p>' + escapeHtml(formatList(career.careerGrowth || career.growth)) + '</p></div>' + practiceMarkup + '<button class="button button-coral button--wide" data-action="new-path">Start another path ↗</button><button class="text-button" data-action="back-map">View this world</button></aside></div>' + (salaryResearch ? '<details class="career-sources"><summary>Sources &amp; salary methodology</summary><div class="source-disclosure"><p><strong>How to read this:</strong> The range is a national occupational benchmark, not a guaranteed offer. The role is mapped to <em>' + escapeHtml(salaryResearch.occupation) + '</em> (' + escapeHtml(salaryResearch.soc) + ') because student-facing titles do not always have one federal occupation code.</p><p>' + escapeHtml(salaryResearch.mapping) + ' ' + escapeHtml(salaryResearch.proxyLimitations) + '</p>' + renderSourceList((salaryResearch.sourceRefs || []).concat(['src-bls-oews-methods'])) + '</div></details>' : '') + '</section>';
  }

  function currentInterview() {
    return interviewForCareer(state.interview.careerId);
  }

  function currentInterviewQuestion() {
    var interview = currentInterview();
    return interview && interview.questions[state.interview.questionIndex];
  }

  function renderSourceList(sourceRefs) {
    var seen = {};
    var sources = (sourceRefs || []).map(function (sourceId) {
      return (research.sourceLedger || []).filter(function (source) { return source.id === sourceId; })[0];
    }).filter(function (source) {
      if (!source || seen[source.id]) return false;
      seen[source.id] = true;
      return true;
    });
    if (!sources.length) return '';
    return '<ul class="source-list">' + sources.map(function (source) {
      return '<li><a href="' + escapeAttr(source.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(source.title) + '</a><span>' + escapeHtml(source.publisher) + ' · accessed ' + escapeHtml(source.accessed) + '</span></li>';
    }).join('') + '</ul>';
  }

  function renderInterviewIntro() {
    var interview = currentInterview();
    var career = modelCareer(state.interview.careerId);
    if (!interview || !career) return renderCareer(findNode(state.selectedNodeId));
    var inProgress = state.interview.status !== 'idle';
    return '<section class="screen interview-screen interview-intro" aria-labelledby="interview-title"><header class="topbar"><button class="button button--quiet" data-action="interview-back-career">← Back to career</button><span class="progress-chip">3 QUESTIONS / ~4 MIN</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="interview-intro-grid"><div><p class="screen-kicker">FIELD PRACTICE / ROLE REHEARSAL</p><h1 id="interview-title" tabindex="-1">' + escapeHtml(career.title) + '<br><em>in your own words.</em></h1><p class="interview-lede">' + escapeHtml(interview.intro) + '</p><div class="interview-expectations"><span><b>01</b> Your experience</span><span><b>02</b> Role scenario</span><span><b>03</b> Your next step</span></div></div><aside class="interview-welcome-card"><span class="eyebrow">A QUICK REHEARSAL</span><strong>This is practice, not a grade.</strong><p>Write what you would really say. The feedback is a transparent checklist based on words you chose.</p><button class="button button--primary button--wide" data-action="interview-start">' + (inProgress ? 'Continue practice' : 'Start practice') + ' <span aria-hidden="true">→</span></button>' + (inProgress ? '<button class="text-button" data-action="interview-replay">Start this interview again</button>' : '') + '</aside></div>' + renderInterviewSources(interview) + '</section>';
  }

  function renderInterviewQuestion() {
    var interview = currentInterview();
    var question = currentInterviewQuestion();
    if (!interview || !question) return renderCareer(findNode(state.selectedNodeId));
    var answer = state.interview.answers[question.id] || '';
    return '<section class="screen interview-screen interview-question" aria-labelledby="question-title"><header class="topbar"><button class="button button--quiet" data-action="interview-save-exit">Save and exit</button><span class="progress-chip">QUESTION ' + (state.interview.questionIndex + 1) + ' OF ' + interview.questions.length + '</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="interview-layout"><aside class="interview-rail" aria-label="Interview progress">' + interview.questions.map(function (item, index) { return '<div class="rail-step ' + (index < state.interview.questionIndex ? 'is-done' : index === state.interview.questionIndex ? 'is-current' : '') + '"><span>' + String(index + 1).padStart(2, '0') + '</span><small>' + escapeHtml(item.type === 'experience' ? 'Experience' : item.type === 'growth' ? 'Growth' : 'Scenario') + '</small></div>'; }).join('') + '</aside><div class="question-card"><p class="eyebrow">' + escapeHtml(modelCareer(state.interview.careerId).title) + '</p><h1 id="question-title" tabindex="-1">' + escapeHtml(question.prompt) + '</h1><p class="question-helper">' + escapeHtml(question.helper || '') + '</p><form id="interview-answer-form"><label for="interview-answer">Your answer</label><textarea id="interview-answer" maxlength="1000" rows="8" placeholder="Start with the situation, then explain what you did…">' + escapeHtml(answer) + '</textarea><div class="answer-meta"><span id="word-count">' + wordCount(answer) + ' words</span><span>Minimum ' + question.minWords + ' words · 1,000 characters max</span></div><details class="hint-disclosure"><summary>Show a hint</summary><p>' + escapeHtml(question.guidance) + '</p></details><div class="question-actions"><button class="button button--primary" type="submit" ' + (answer.trim() ? '' : 'disabled') + '>Check my answer <span aria-hidden="true">→</span></button><button class="text-button" type="button" data-action="interview-save-exit">Save and exit</button></div></form></div></div></section>';
  }

  function renderInterviewFeedback() {
    var interview = currentInterview();
    var question = currentInterviewQuestion();
    var feedback = question && state.interview.feedback[question.id];
    if (!interview || !question || !feedback) return renderInterviewQuestion();
    var criteria = question.criteria || question.rubric.criteria;
    var matched = criteria.filter(function (criterion) { return feedback.matchedCriterionIds.indexOf(criterion.id) !== -1; });
    var missing = criteria.filter(function (criterion) { return feedback.missingCriterionIds.indexOf(criterion.id) !== -1; });
    var nextLabel = state.interview.questionIndex === interview.questions.length - 1 ? 'See my debrief' : 'Next question';
    return '<section class="screen interview-screen interview-feedback" aria-labelledby="feedback-title"><header class="topbar"><button class="button button--quiet" data-action="interview-save-exit">Save and exit</button><span class="progress-chip">FEEDBACK / ' + (state.interview.questionIndex + 1) + ' OF ' + interview.questions.length + '</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="feedback-grid"><div class="question-card feedback-question"><p class="eyebrow">YOUR RESPONSE</p><h1 id="feedback-title" tabindex="-1">' + escapeHtml(question.prompt) + '</h1><div class="answer-quote">' + escapeHtml(state.interview.answers[question.id] || '') + '</div><button class="text-button" data-action="interview-edit">Edit and try again</button></div><div class="feedback-card"><span class="feedback-level feedback-level--' + escapeAttr(feedback.level) + '">' + escapeHtml(feedback.level === 'strong' ? 'Strong foundation' : feedback.level === 'developing' ? 'Developing answer' : 'Good starting point') + '</span><p class="feedback-summary">' + feedback.wordCount + ' words · built from your answer</p><section><h2>You mentioned</h2>' + (matched.length ? '<ul class="criteria-list criteria-list--matched">' + matched.map(function (criterion) { return '<li>✓ ' + escapeHtml(criterion.label) + '</li>'; }).join('') + '</ul>' : '<p class="muted-copy">Not enough rubric evidence yet.</p>') + '</section>' + (missing.length ? '<section><h2>Try adding</h2><ul class="criteria-list criteria-list--missing">' + missing.map(function (criterion) { return '<li>＋ ' + escapeHtml(criterion.label) + '</li>'; }).join('') + '</ul></section>' : '') + '<p class="feedback-guidance"><strong>Practice note:</strong> ' + escapeHtml(question.guidance) + '</p><details class="strong-answer"><summary>Show a strong-answer example</summary><p>' + escapeHtml(question.strongAnswer) + '</p></details><button class="button button--primary button--wide" data-action="interview-next">' + nextLabel + ' <span aria-hidden="true">→</span></button></div></div></section>';
  }

  function renderInterviewDebrief() {
    var interview = currentInterview();
    var career = modelCareer(state.interview.careerId);
    if (!interview || !career) return renderCareer(findNode(state.selectedNodeId));
    var summaries = interview.questions.map(function (question, index) {
      var feedback = state.interview.feedback[question.id];
      return '<li><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + escapeHtml(question.type === 'experience' ? 'Experience' : question.type === 'growth' ? 'Growth plan' : 'Role scenario') + '</strong><em>' + escapeHtml(feedback ? (feedback.level === 'strong' ? 'Strong foundation' : feedback.level === 'developing' ? 'Developing answer' : 'Good starting point') : 'Not answered') + '</em></li>';
    }).join('');
    var strongest = strongestCriterion(interview);
    return '<section class="screen interview-screen interview-debrief" aria-labelledby="debrief-title"><header class="topbar"><button class="button button--quiet" data-action="interview-back-career">← Back to career</button><span class="progress-chip">PRACTICE COMPLETE</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="debrief-card"><p class="screen-kicker">FIELD NOTES SAVED</p><h1 id="debrief-title" tabindex="-1">You made the role<br><em>more concrete.</em></h1><p class="interview-lede">Your answers stay in this browser so you can return, revise, and build a clearer story over time.</p><div class="debrief-grid"><section><span class="eyebrow">YOUR THREE ANSWERS</span><ol class="debrief-list">' + summaries + '</ol></section><aside class="debrief-next"><span class="eyebrow">A NEXT PRACTICE MOVE</span><strong>' + escapeHtml(strongest ? 'Keep developing ' + strongest.label.toLowerCase() + '.' : 'Keep collecting specific examples.') + '</strong><p>Use one class, work, club, or personal project this week to make that idea more specific.</p></aside></div><div class="debrief-actions"><button class="button button--primary" data-action="interview-replay">Practice again</button><button class="button button--secondary" data-action="interview-back-career">Return to career</button></div></div>' + renderInterviewSources(interview) + '</section>';
  }

  function renderInterviewSources(interview) {
    return '<details class="career-sources interview-sources"><summary>Sources &amp; attribution</summary><div class="source-disclosure"><p>These prompts and examples are authored practice content. The linked sources support role framing and interview habits; they do not publish these exact questions.</p>' + renderSourceList(interview.sourceRefs) + '</div></details>';
  }

  function modelCareer(careerId) {
    return (model.careers || {})[careerId] || null;
  }

  function wordCount(value) { return (String(value || '').match(/[a-z0-9']+/gi) || []).length; }

  function evaluateInterviewAnswer(answer, question) {
    var normalized = String(answer || '').toLowerCase();
    var words = wordCount(answer);
    var criteria = question.criteria || (question.rubric && question.rubric.criteria) || [];
    var matched = criteria.filter(function (criterion) { return (criterion.signals || []).some(function (signal) { return normalized.indexOf(String(signal).toLowerCase()) !== -1; }); });
    var ratio = criteria.length ? matched.length / criteria.length : 0;
    var level = words >= question.minWords && ratio >= 0.67 ? 'strong' : words >= Math.max(8, Math.floor(question.minWords / 2)) && ratio >= 0.34 ? 'developing' : 'starting';
    return { level: level, wordCount: words, matchedCriterionIds: matched.map(function (criterion) { return criterion.id; }), missingCriterionIds: criteria.filter(function (criterion) { return matched.indexOf(criterion) === -1; }).map(function (criterion) { return criterion.id; }) };
  }

  function strongestCriterion(interview) {
    var counts = {};
    interview.questions.forEach(function (question) { var feedback = state.interview.feedback[question.id]; (feedback ? feedback.matchedCriterionIds : []).forEach(function (id) { counts[id] = (counts[id] || 0) + 1; }); });
    var best = null; var bestCount = 0;
    interview.questions.forEach(function (question) { (question.criteria || []).forEach(function (criterion) { if ((counts[criterion.id] || 0) > bestCount) { best = criterion; bestCount = counts[criterion.id]; } }); });
    return best;
  }

  function renderFactList(value) {
    var items = Array.isArray(value) ? value : value ? [value] : ['Details coming soon'];
    return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(typeof item === 'object' ? formatList(item) : item) + '</li>'; }).join('') + '</ul>';
  }

  function formatSalary(value) {
    if (!value) return 'Details coming soon';
    if (typeof value === 'string') return value;
    return value.range || value.note || 'Details coming soon';
  }

  function formatList(value) {
    if (Array.isArray(value)) return value.join(' · ');
    if (value && typeof value === 'object') return Object.keys(value).map(function (key) { return formatList(value[key]); }).filter(Boolean).join(' · ');
    return value || 'Details coming soon';
  }

  /** Return the supplied original artwork for a starter or journey skill. */
  function badgeSourceFor(skill) {
    if (!skill) return '';
    if (skill.category === 'starter') return STARTER_BADGE_SOURCES[skill.badgeAsset] || '';
    return JOURNEY_BADGE_SOURCES[skill.id] || '';
  }

  function originalBadgeClass(skill) {
    return badgeSourceFor(skill) ? ' badge-hex--original' : '';
  }

  function renderBadgeArtwork(skill) {
    var source = badgeSourceFor(skill);
    if (!source) return renderBadgeIcon(skill);
    return '<img class="skill-badge-art" src="' + escapeAttr(source) + '" alt="">';
  }

  /** Fallback line art for skills that do not have an authored badge yet. */
  function renderBadgeIcon(skill) {
    var icons = {
      lightbulb: '<path d="M17 29c-3-2.4-5-6-5-10a12 12 0 0 1 24 0c0 4-2 7.6-5 10l-2 3H19l-2-3Z"/><path d="M19 36h10M20 40h8M24 7V3M8 19H4M44 19h-4M11 8l3 3M37 8l-3 3"/>',
      globe: '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7 10.7 7 17s-2 12-7 17c-5-5-7-10.7-7-17s2-12 7-17Z"/><path d="M11 14h26M11 34h26"/>',
      monitor: '<rect x="6" y="8" width="36" height="25" rx="2"/><path d="M18 40h12M24 33v7"/>',
      'code-monitor': '<rect x="5" y="7" width="38" height="27" rx="2"/><path d="m18 16-5 5 5 5M30 16l5 5-5 5M21 40h6M24 34v6"/>',
      pencil: '<path d="m10 34 3-10L32 5l8 8-19 19-11 2Z"/><path d="m28 9 8 8M13 24l8 8M10 34l7-3"/>',
      rocket: '<path d="M28 7c7-2 12-1 13 0 1 1 2 6 0 13L27 34l-13-1-1-13L28 7Z"/><path d="m18 33-5 7-5-1 1-5 6-5M28 34l-1 7M13 20l-7 1M28 15a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>',
      network: '<circle cx="24" cy="10" r="5"/><circle cx="10" cy="36" r="5"/><circle cx="38" cy="36" r="5"/><path d="m21 14-8 17M27 14l8 17M15 36h18"/>',
      gears: '<circle cx="18" cy="20" r="7"/><circle cx="31" cy="30" r="6"/><path d="M18 9v4M18 27v4M7 20h4M25 20h4M10 12l3 3M23 25l3 3M31 20v4M31 36v4M23 30h3M37 30h4"/>',
      numbers: '<circle cx="15" cy="15" r="8"/><circle cx="33" cy="15" r="8"/><circle cx="15" cy="33" r="8"/><circle cx="33" cy="33" r="8"/><path d="M11 15h8M15 11v8M29 15h8M11 33h8M15 29v8M29 30l8 6M37 30l-8 6"/>',
      camera: '<path d="M7 15h9l3-5h10l3 5h9v25H7V15Z"/><circle cx="24" cy="27" r="8"/><path d="M34 20h2"/>',
      crystal: '<circle cx="24" cy="21" r="13"/><path d="M15 39h18M18 34h12M14 31c3-3 6-4 10-4s7 1 10 4"/><path d="M17 18c2-4 5-6 9-7"/>',
      laptop: '<rect x="8" y="9" width="32" height="24" rx="2"/><path d="M4 38h40l-3 4H7l-3-4ZM18 20h12"/>',
      magnifier: '<circle cx="20" cy="20" r="12"/><path d="m29 29 12 12M15 20h10M20 15v10"/>',
      shield: '<path d="M24 5 39 11v10c0 10-6 17-15 22-9-5-15-12-15-22V11l15-6Z"/><path d="m17 24 5 5 10-12"/>',
      handshake: '<path d="m5 25 9-9 8 3 5-3 16 12-7 8-12-9-5 4-7-1-7-5Z"/><path d="m27 16-7 7c-2 2 1 6 4 4l4-3M31 27l6 5M27 31l6 5M22 34l5 4"/>',
      microphone: '<rect x="18" y="5" width="12" height="25" rx="6"/><path d="M12 23c0 7 5 12 12 12s12-5 12-12M24 35v8M18 43h12"/>',
      boxes: '<path d="m7 17 10-6 10 6-10 6-10-6Zm0 0v12l10 6 10-6V17M17 23v12M23 33l9-5 9 5-9 6-9-6Zm9 6v7M23 33v8M41 33v8"/>',
      'ruler-pencil': '<path d="M8 34 34 8l7 7-26 26-8 1 1-8Z"/><path d="m28 14 7 7M11 30l7 7M8 12l28 28M12 8l28 28"/>',
      chess: '<path d="M20 7h8l-1 6 6 6-4 7 5 13H14l5-13-4-7 6-6-1-6Z"/><path d="M17 26h14M12 43h24"/>',
      spark: '<path d="m24 5 4 13 13 6-13 5-4 14-5-14-13-5 13-6 5-13Z"/>'
    };
    var iconName = skill && skill.badgeIcon && icons[skill.badgeIcon] ? skill.badgeIcon : 'spark';
    return '<svg class="hex-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true" data-icon="' + escapeAttr(iconName) + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + icons[iconName] + '</svg>';
  }

  function renderDock() {
    if (!dock) return;
    var items = [];
    state.starterSkills.forEach(function (skillId) {
      var skill = model.skills[skillId];
      if (skill) items.push({ skill: skill, source: 'Starter skill', starter: true });
    });
    state.earned.forEach(function (entry) {
      var skill = model.skills[entry.skillId];
      var node = findNode(entry.nodeId);
      if (skill) items.push({ skill: skill, source: node ? node.title : 'Journey skill', starter: false });
    });
    dock.hidden = items.length === 0;
    dock.classList.toggle('has-skills', items.length > 0);
    var shortLandscape = window.matchMedia && window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
    var interviewScreen = /^interview-/.test(state.screen || '');
    var inlineDock = state.screen === 'career' || interviewScreen || window.innerWidth <= 560 || shortLandscape;
    var screenClass = 'dock--screen-' + slug(state.screen || 'landing');
    ['landing', 'skill-select', 'map', 'travel', 'mini', 'reflection', 'career', 'interview-intro', 'interview-question', 'interview-feedback', 'interview-debrief'].forEach(function (screen) {
      dock.classList.remove('dock--screen-' + slug(screen));
    });
    dock.classList.add(screenClass);
    dock.classList.toggle('dock--inline', inlineDock);
    dock.classList.toggle('dock--floating', !inlineDock);
    dock.classList.toggle('dock--safe-top', !inlineDock && state.screen === 'reflection');
    document.body.classList.toggle('dock-inline', inlineDock);
    document.body.classList.toggle('dock-floating', !inlineDock);
    if (!items.length) { dock.innerHTML = ''; return; }
    dock.innerHTML = '<div class="dock-inner"><div class="dock-label"><span class="dock-pip" aria-hidden="true"></span><div><h2 id="skill-dock-title">SKILL STACK</h2><p>' + items.length + ' total · ' + state.earned.length + ' earned</p></div></div><div class="hex-track" id="skill-dock-list" role="list" aria-label="Four starter skills plus skills earned during this journey">' + items.map(function (item, index) {
      var originalArtwork = Boolean(badgeSourceFor(item.skill));
      return '<button class="hex-item' + (item.starter ? ' is-starter' : ' is-earned') + originalBadgeClass(item.skill) + (index === items.length - 1 && state.lastAward ? ' skill-hex--new' : '') + '" type="button" data-action="inspect-skill" data-inspect-skill-id="' + escapeAttr(item.skill.id) + '" aria-label="' + escapeAttr(item.skill.name + ', ' + item.source) + '" style="--skill-color:' + escapeAttr(item.skill.color) + '"><span class="hex-face" aria-hidden="true">' + renderBadgeArtwork(item.skill) + '<strong' + (originalArtwork ? ' class="badge-label-text"' : '') + '>' + escapeHtml(item.skill.shortName || item.skill.name) + '</strong></span></button>';
    }).join('') + '</div></div>';
  }

  function updateHeader() {
    if (!headerStatus) return;
    if (state.screen === 'skill-select') headerStatus.textContent = state.starterSkills.length + ' OF 4 SKILLS';
    else if (state.starterSkills.length === 4) headerStatus.textContent = (state.earned.length + 4) + ' SKILLS · WORLD ACTIVE';
    else headerStatus.textContent = 'READY TO EXPLORE';
  }

  // ---------------------------------------------------------------------------
  // Events and progression
  // ---------------------------------------------------------------------------

  function wireEvents() {
    root.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', handleAction); });
    wireMapRouteReactions();
    wireDockEvents();
    var form = document.getElementById('start-form');
    if (form) form.addEventListener('submit', handleStart);
    var interviewForm = document.getElementById('interview-answer-form');
    var answerInput = document.getElementById('interview-answer');
    if (interviewForm) interviewForm.addEventListener('submit', handleInterviewCheck);
    if (answerInput) {
      answerInput.addEventListener('input', function () {
        var question = currentInterviewQuestion();
        if (!question) return;
        var answer = answerInput.value.slice(0, 1000);
        state.interview.answers[question.id] = answer;
        saveState();
        var count = document.getElementById('word-count');
        if (count) count.textContent = wordCount(answer) + ' words';
        var check = interviewForm && interviewForm.querySelector('button[type="submit"]');
        if (check) check.disabled = !answer.trim();
      });
      answerInput.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && interviewForm) {
          event.preventDefault();
          if (interviewForm.requestSubmit) interviewForm.requestSubmit();
          else interviewForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      });
    }
  }

  function wireDockEvents() {
    if (dock) dock.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', handleAction); });
  }

  /** Pair each open destination card with its SVG branch for hover and focus. */
  function wireMapRouteReactions() {
    root.querySelectorAll('.world-stop[data-route-node-id]:not([disabled])').forEach(function (stop) {
      var nodeId = stop.getAttribute('data-route-node-id');
      stop.addEventListener('mouseenter', function () { setMapRouteFocus(stop, nodeId); });
      stop.addEventListener('focus', function () { setMapRouteFocus(stop, nodeId); });
      stop.addEventListener('mouseleave', function () {
        if (document.activeElement !== stop) setMapRouteFocus(stop, null);
      });
      stop.addEventListener('blur', function () { setMapRouteFocus(stop, null); });
    });
  }

  function setMapRouteFocus(source, nodeId) {
    var world = source && source.closest ? source.closest('.rpg-world') : source;
    if (!world) return;
    world.classList.toggle('has-route-focus', Boolean(nodeId));
    world.querySelectorAll('.route-option[data-route-node-id]').forEach(function (route) {
      route.classList.toggle('is-focused', route.getAttribute('data-route-node-id') === nodeId);
    });
  }

  function handleStart(event) {
    event.preventDefault();
    var input = document.getElementById('player-name');
    var name = input && input.value.trim();
    if (!name) {
      if (input) { input.setCustomValidity('Add your first name to begin.'); input.reportValidity(); input.focus(); }
      return;
    }
    if (input) input.setCustomValidity('');
    state.name = name; state.screen = 'skill-select'; saveState(); render();
    announce('Choose four starter skills.');
  }

  function handleAction(event) {
    var element = event.currentTarget;
    var action = element.getAttribute('data-action');
    if (action === 'toggle-starter') { toggleStarterSkill(element.getAttribute('data-skill-id')); return; }
    if (action === 'confirm-skills') { confirmStarterSkills(); return; }
    if (action === 'back-landing') { state.screen = 'landing'; saveState(); render(); return; }
    if (action === 'resume') {
      if (state.starterSkills.length === 4 && !findNode(state.activeRegionId)) state.activeRegionId = recommendRegion(state.starterSkills, state.rejected).id;
      state.screen = state.starterSkills.length === 4 ? 'map' : 'skill-select'; saveState(); render(); return;
    }
    if (action === 'edit-skills') { requestEditStarterSkills(); return; }
    if (action === 'open-node') { openNode(element.getAttribute('data-node-id')); return; }
    if (action === 'finish-game') {
      if (state.reviewingNodeId) {
        var replayed = findNode(state.reviewingNodeId);
        state.reviewingNodeId = null; state.screen = 'map'; saveState(); render();
        announce(replayed ? replayed.title + ' replay complete. Your journey progress is unchanged.' : 'Replay complete. Your journey progress is unchanged.');
      } else { state.screen = 'reflection'; saveState(); render(); }
      return;
    }
    if (action === 'enjoy-yes') { completeNode(state.selectedNodeId); return; }
    if (action === 'enjoy-maybe') { pauseReflection(); return; }
    if (action === 'enjoy-no') { requestRejectNode(element); return; }
    if (action === 'back-map') { state.screen = 'map'; state.travelTargetId = null; saveState(); render(); return; }
    if (action === 'new-path') { startAnotherPath(); return; }
    if (action === 'open-interview') { openInterview(element.getAttribute('data-career-id')); return; }
    if (action === 'interview-start') { startInterview(); return; }
    if (action === 'interview-next') { nextInterviewQuestion(); return; }
    if (action === 'interview-edit') { editInterviewAnswer(); return; }
    if (action === 'interview-replay') { replayInterview(); return; }
    if (action === 'interview-save-exit' || action === 'interview-back-career') { exitInterview(); return; }
    if (action === 'restart') { modalReturnFocus = element; showRestartModal(); return; }
    if (action === 'confirm-edit-skills') { editStarterSkills(); closeModal(); return; }
    if (action === 'confirm-reject') { rejectNode(element.getAttribute('data-node-id') || state.selectedNodeId); closeModal(); return; }
    if (action === 'replay-node') { replayNode(element.getAttribute('data-node-id')); closeModal(); return; }
    if (action === 'inspect-skill') { modalReturnFocus = element; showSkillModal(element.getAttribute('data-inspect-skill-id') || element.getAttribute('data-skill-id')); }
  }

  function toggleStarterSkill(skillId) {
    var index = state.starterSkills.indexOf(skillId);
    if (index !== -1) state.starterSkills.splice(index, 1);
    else if (state.starterSkills.length < 4 && model.skills[skillId]) state.starterSkills.push(skillId);
    saveState(); refreshStarterSkillSelection();
  }

  /** Update the loadout without rebuilding the screen or moving the viewport. */
  function refreshStarterSkillSelection() {
    var selectedCount = state.starterSkills.length;
    root.querySelectorAll('.starter-skill[data-skill-id]').forEach(function (button) {
      var picked = state.starterSkills.indexOf(button.getAttribute('data-skill-id')) !== -1;
      var unavailable = selectedCount >= 4 && !picked;
      button.classList.toggle('is-picked', picked);
      button.setAttribute('aria-pressed', String(picked));
      if (unavailable) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
      var status = button.querySelector('.pick-state');
      if (status) status.textContent = picked ? 'Selected ✓' : 'Choose +';
    });
    var meter = root.querySelector('.selection-meter strong');
    if (meter) meter.innerHTML = selectedCount + '<span>/4</span>';
    var footerCopy = root.querySelector('.skills-footer p');
    if (footerCopy) footerCopy.textContent = selectedCount === 4 ? 'Your compass is ready.' : 'Choose ' + (4 - selectedCount) + ' more to continue.';
    var confirm = root.querySelector('[data-action="confirm-skills"]');
    if (confirm) confirm.disabled = selectedCount !== 4;
    renderDock(); wireDockEvents(); updateHeader();
  }

  function confirmStarterSkills() {
    if (state.starterSkills.length !== 4) return;
    var recommendation = recommendRegion(state.starterSkills, []);
    state.recommendedRegionId = recommendation.id; state.activeRegionId = recommendation.id; state.activeDomainId = null;
    state.completed = []; state.earned = []; state.rejected = []; state.selectedNodeId = null; state.screen = 'map';
    saveState(); render(); announce('Your starter skills point to ' + recommendation.title + '.');
  }

  function editStarterSkills() {
    state.screen = 'skill-select'; state.completed = []; state.earned = []; state.rejected = [];
    state.activeRegionId = null; state.activeDomainId = null; state.selectedNodeId = null; state.reviewingNodeId = null; saveState(); render();
  }

  function requestEditStarterSkills() {
    if (!state.completed.length && !state.earned.length && !state.rejected.length) { editStarterSkills(); return; }
    modalReturnFocus = document.querySelector('[data-action="edit-skills"]');
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-skills-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">EDIT STARTER LOADOUT</p><h2 id="edit-skills-title">Change your direction?</h2><p>This will clear your current route progress, including ' + state.completed.length + ' explored stops and ' + state.earned.length + ' earned skills. Your name and avatar will stay saved.</p><div class="modal-actions"><button class="button button-secondary" data-action="close-modal">Keep exploring</button><button class="button button--danger" data-action="confirm-edit-skills">Edit starter skills</button></div></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function openNode(id) {
    var node = findNode(id);
    if (!canOpen(node)) return;
    var replaying = isCompleted(node.id);
    var current = currentJourneyNode();
    state.selectedNodeId = id; state.reviewingNodeId = replaying ? id : null; state.travelFromId = current ? current.id : null; state.travelTargetId = id;
    if (nodeDepth(node) === 1) state.activeDomainId = id;
    state.screen = 'travel'; saveState(); beginMapTravel(node);
    if (travelTimer) window.clearTimeout(travelTimer);
    travelTimer = window.setTimeout(function () {
      state.travelTargetId = null; state.travelFromId = null;
      if (nodeDepth(node) === 2 && node.career) {
        openCareerResult(node);
      } else {
        state.screen = 'mini'; saveState(); render();
        announce(node.title + ' challenge opened.');
      }
    }, prefersReducedMotion ? 70 : 900);
  }

  /** Final specialization choices are destinations, not mini-game stops. */
  function openCareerResult(node) {
    if (!node || !node.career) return;
    if (!isCompleted(node.id)) state.completed.push(node.id);
    var skill = node.earnedSkill ? skillFor(node) : null;
    var alreadyEarned = state.earned.some(function (entry) { return entry.nodeId === node.id; });
    if (skill && !alreadyEarned) state.earned.push({ skillId: skill.id, nodeId: node.id, earnedAt: Date.now() });
    state.reviewingNodeId = null;
    state.selectedNodeId = node.id;
    state.lastCareerId = node.career.id || node.career.title;
    state.lastAward = Boolean(skill && !alreadyEarned);
    state.screen = 'career';
    saveState(); render();
    if (skill && !alreadyEarned) {
      animateSkillReward(skill); showToast('+' + skill.name + ' added to your stack', skill);
      announce(skill.name + ' earned. ' + node.career.title + ' career match opened.');
      window.setTimeout(function () { state.lastAward = false; renderDock(); }, prefersReducedMotion ? 0 : 850);
    } else announce(node.career.title + ' career match opened.');
  }

  /** Start map travel in place so selecting a stop never flashes or jumps. */
  function beginMapTravel(node) {
    var world = root.querySelector('.rpg-world');
    var avatar = root.querySelector('.map-avatar');
    var destination = root.querySelector('[data-action="open-node"][data-node-id="' + node.id + '"]');
    if (!world || !avatar || !destination) { render(); return; }

    var destinationX = parseFloat(destination.style.getPropertyValue('--x')) || 50;
    var destinationY = parseFloat(destination.style.getPropertyValue('--y')) || 50;
    var currentX = parseFloat(avatar.style.getPropertyValue('--to-x')) || 9;
    var currentY = parseFloat(avatar.style.getPropertyValue('--to-y')) || 64;

    world.classList.add('is-traveling');
    setMapRouteFocus(world, node.id);
    destination.classList.add('is-destination');
    var destinationStatus = destination.querySelector('.stop-copy small');
    if (destinationStatus) destinationStatus.textContent = 'TRAVELING';
    avatar.style.setProperty('--from-x', currentX + '%');
    avatar.style.setProperty('--from-y', currentY + '%');
    avatar.style.setProperty('--to-x', destinationX + '%');
    avatar.style.setProperty('--to-y', Math.max(17, destinationY - 14) + '%');
    avatar.setAttribute('aria-label', (state.name || 'Your explorer') + ' traveling to ' + node.title);
    avatar.classList.add('is-traveling');
    world.insertAdjacentHTML('beforeend', '<div class="travel-banner" aria-live="polite"><span>EXPLORER MOVING</span><strong>' + escapeHtml(node.title) + '</strong><i aria-hidden="true"></i></div>');
    var chapterHud = world.querySelector('.world-stage-label');
    if (chapterHud && window.matchMedia && window.matchMedia('(max-width: 560px), (orientation: landscape) and (max-height: 500px)').matches) {
      chapterHud.style.setProperty('transition-property', 'none', 'important');
      chapterHud.style.visibility = 'hidden';
      chapterHud.style.opacity = '0';
    }
    dock.classList.remove('dock--screen-map');
    dock.classList.add('dock--screen-travel');
  }

  function completeNode(id) {
    var node = findNode(id);
    if (!node) return;
    if (!node.miniGame) { openCareerResult(node); return; }
    var alreadyCompleted = isCompleted(id);
    if (!alreadyCompleted) state.completed.push(id);
    var skill = skillFor(node);
    var alreadyEarned = state.earned.some(function (entry) { return entry.nodeId === id; });
    if (!alreadyEarned) state.earned.push({ skillId: skill.id, nodeId: id, earnedAt: Date.now() });
    state.lastAward = !alreadyEarned; state.selectedNodeId = id;
    if (node.career) { state.lastCareerId = node.career.id || node.career.title; state.screen = 'career'; }
    else state.screen = 'map';
    saveState(); render();
    if (!alreadyEarned) {
      animateSkillReward(skill); showToast('+' + skill.name + ' added to your stack', skill);
      announce(skill.name + ' earned. The next stage is open.');
    } else {
      showToast(skill.name + ' is already in your stack', skill);
      announce(skill.name + ' activity reviewed.');
    }
    window.setTimeout(function () { state.lastAward = false; renderDock(); }, prefersReducedMotion ? 0 : 850);
  }

  function rejectNode(id) {
    var node = findNode(id);
    if (!node || isCompleted(id)) return;
    var alternative = findAlternative(node);
    if (!isRejected(id)) state.rejected.push(id);
    if (alternative) {
      var alternativeDepth = nodeDepth(alternative);
      if (alternativeDepth === 0) {
        state.activeRegionId = alternative.id; state.activeDomainId = null;
      } else if (alternativeDepth === 1) {
        state.activeRegionId = alternative.parentId; state.activeDomainId = null;
      } else {
        var alternativeDomain = findNode(alternative.parentId);
        state.activeRegionId = alternativeDomain.parentId; state.activeDomainId = alternativeDomain.id;
      }
    } else {
      // A student can eventually say no to every branch. Reopen the ranked
      // worlds rather than leaving a zero-route map with no way forward.
      state.rejected = [];
      state.activeRegionId = recommendRegion(state.starterSkills, []).id;
      state.activeDomainId = null;
    }
    state.selectedNodeId = null; state.travelTargetId = null; state.screen = 'map'; saveState(); render();
    announce(alternative ? node.title + ' closed. Try ' + alternative.title + '.' : 'Every route was explored. Your closest matches are open again.');
  }

  function pauseReflection() {
    var node = findNode(state.selectedNodeId);
    state.selectedNodeId = null; state.travelTargetId = null; state.travelFromId = null; state.screen = 'map'; saveState(); render();
    announce(node ? 'You can revisit ' + node.title + ' when you are ready.' : 'The trail stays open for later.');
  }

  function requestRejectNode(element) {
    var id = element && element.getAttribute('data-node-id') || state.selectedNodeId;
    var node = findNode(id);
    if (!node || isCompleted(id)) return;
    var alternative = findAlternative(node);
    modalReturnFocus = element;
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="reject-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">TRAIL DECISION</p><h2 id="reject-title">Try another trail?</h2><p>Choosing “Not for me” closes ' + escapeHtml(node.title) + (alternative ? ' and points your explorer to ' + escapeHtml(alternative.title) + '.' : ' and reopens your closest matches so the journey can continue.') + ' Your earned skills stay saved.</p><div class="modal-actions"><button class="button button-secondary" data-action="close-modal">Keep this trail open</button><button class="button button--danger" data-action="confirm-reject" data-node-id="' + escapeAttr(id) + '">Close this trail</button></div></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function findAlternative(node) {
    if (!node) return null;
    var depth = nodeDepth(node);
    if (!node.parentId) return nextOpenRegion(node.id);
    var parent = findNode(node.parentId);
    var sibling = parent && parent.children.filter(function (candidate) {
      return candidate.id !== node.id && !isRejected(candidate.id) && (depth !== 1 || domainHasCareerRoute(candidate));
    })[0];
    if (sibling) return sibling;
    if (depth === 2) {
      var region = findNode(parent.parentId);
      var nextDomain = region && region.children.filter(function (candidate) {
        return candidate.id !== parent.id && domainHasCareerRoute(candidate);
      })[0];
      if (nextDomain) return nextDomain;
      return nextOpenRegion(region && region.id);
    }
    if (depth === 1) return nextOpenRegion(parent && parent.id);
    return null;
  }

  function domainHasCareerRoute(domain) {
    return !!domain && !isRejected(domain.id) && (domain.children || []).some(function (candidate) { return !isRejected(candidate.id); });
  }

  function regionHasCareerRoute(region) {
    return !!region && !isRejected(region.id) && (region.children || []).some(domainHasCareerRoute);
  }

  function nextOpenRegion(excludedRegionId) {
    var excluded = state.rejected.slice();
    if (excludedRegionId) excluded.push(excludedRegionId);
    return rankedRegions(state.starterSkills, excluded).filter(regionHasCareerRoute)[0] || null;
  }

  function startAnotherPath() {
    state.screen = 'skill-select'; state.completed = []; state.earned = []; state.rejected = [];
    state.activeRegionId = null; state.activeDomainId = null; state.selectedNodeId = null; state.lastCareerId = null; state.interview = defaultInterviewState();
    saveState(); render();
  }

  function openInterview(careerId) {
    var career = modelCareer(careerId);
    if (!career || !interviewForCareer(careerId)) return;
    if (state.interview.careerId !== careerId) state.interview = Object.assign(defaultInterviewState(), { careerId: careerId });
    state.interview.returnScreen = 'career'; state.screen = 'interview-intro'; saveState(); render();
  }

  function startInterview() {
    var interview = currentInterview();
    if (!interview) return;
    if (state.interview.status === 'complete') { state.screen = 'interview-debrief'; saveState(); render(); return; }
    state.interview.status = 'in-progress'; state.screen = 'interview-question'; saveState(); render();
  }

  function nextInterviewQuestion() {
    var interview = currentInterview();
    if (!interview) return;
    if (state.interview.questionIndex >= interview.questions.length - 1) {
      state.interview.status = 'complete'; state.screen = 'interview-debrief';
    } else {
      state.interview.questionIndex += 1; state.interview.status = 'in-progress'; state.screen = 'interview-question';
    }
    saveState(); render();
  }

  function editInterviewAnswer() {
    if (!currentInterviewQuestion()) return;
    state.interview.status = 'in-progress'; state.screen = 'interview-question'; saveState(); render();
  }

  function replayInterview() {
    var careerId = state.interview.careerId;
    if (!interviewForCareer(careerId)) return;
    state.interview = Object.assign(defaultInterviewState(), { careerId: careerId, status: 'in-progress', returnScreen: 'career' });
    state.screen = 'interview-question'; saveState(); render();
  }

  function exitInterview() {
    state.screen = 'career'; saveState(); render();
  }

  function handleInterviewCheck(event) {
    event.preventDefault();
    var question = currentInterviewQuestion();
    var input = document.getElementById('interview-answer');
    if (!question || !input || !input.value.trim()) return;
    var answer = input.value.slice(0, 1000);
    state.interview.answers[question.id] = answer;
    state.interview.feedback[question.id] = evaluateInterviewAnswer(answer, question);
    state.interview.status = 'feedback';
    state.screen = 'interview-feedback';
    saveState(); render();
  }

  function showNodeReview(node) {
    if (!modalRoot || !node) return;
    var skill = skillFor(node);
    modalReturnFocus = document.querySelector('[data-node-id="' + node.id + '"]');
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--skill" role="dialog" aria-modal="true" aria-labelledby="review-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">EXPLORED STOP / RECAP</p><h2 id="review-title">' + escapeHtml(node.title) + '</h2><p>' + escapeHtml(node.description || node.subtitle) + '</p><p><strong>Skill earned:</strong> ' + escapeHtml(skill.name) + '</p><div class="modal-actions"><button class="button button-secondary" data-action="close-modal">Back to map</button><button class="button button--primary" data-action="replay-node" data-node-id="' + escapeAttr(node.id) + '">Replay challenge</button></div></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function replayNode(id) {
    var node = findNode(id);
    if (!node || !isCompleted(id)) return;
    closeModal();
    if (!node.miniGame && node.career) { openCareerResult(node); return; }
    state.reviewingNodeId = id; state.selectedNodeId = id; state.screen = 'mini'; saveState(); render();
  }

  // ---------------------------------------------------------------------------
  // Feedback, motion, and dialogs
  // ---------------------------------------------------------------------------

  function showToast(message, skill) {
    if (!toastRegion) return;
    toastRegion.innerHTML = '<div class="toast toast--reward" role="status"><span class="toast-mark badge-hex badge-hex--icon' + originalBadgeClass(skill) + '" aria-hidden="true">' + renderBadgeArtwork(skill) + '</span><span>' + escapeHtml(message) + '</span></div>';
    window.setTimeout(function () { if (toastRegion) toastRegion.innerHTML = ''; }, 3000);
  }

  function animateSkillReward(skill) {
    if (prefersReducedMotion || !dock) return;
    var target = dock.getBoundingClientRect();
    var startX = window.innerWidth * 0.48; var startY = window.innerHeight * 0.42;
    var flight = document.createElement('span');
    flight.className = 'hex-flight'; flight.setAttribute('aria-hidden', 'true');
    flight.style.left = startX + 'px'; flight.style.top = startY + 'px';
    flight.style.setProperty('--skill-color', skill.color);
    flight.style.setProperty('--flight-x', (target.left + target.width * 0.62 - startX) + 'px');
    flight.style.setProperty('--flight-y', (target.top + 45 - startY) + 'px');
    document.body.appendChild(flight);
    window.setTimeout(function () { if (flight.parentNode) flight.remove(); }, 760);
  }

  function announce(message) {
    if (toastRegion && !toastRegion.querySelector('.toast')) toastRegion.innerHTML = '<span class="sr-only" role="status">' + escapeHtml(message) + '</span>';
    if (window.console && window.console.debug) window.console.debug('[Launchpad]', message);
  }

  function showRestartModal() {
    if (!modalRoot) { resetState(); return; }
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">RESET FIELD GUIDE</p><h2 id="restart-title">Start a fresh journey?</h2><p>Your starter skills, map decisions, and earned skills will be cleared from this browser.</p><div class="modal-actions"><button class="button button-secondary" data-action="close-modal">Keep exploring</button><button class="button button--danger" data-action="confirm-restart">Restart journey</button></div></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function showSkillModal(skillId) {
    var skill = model.skills[skillId];
    if (!skill || !modalRoot) return;
    var earned = state.earned.filter(function (entry) { return entry.skillId === skillId; })[0];
    var node = earned ? findNode(earned.nodeId) : null;
    setModalSurfaces(true);
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--skill" role="dialog" aria-modal="true" aria-labelledby="skill-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="hex hex--modal badge-hex badge-hex--icon' + originalBadgeClass(skill) + '" aria-hidden="true">' + renderBadgeArtwork(skill) + '</span><p class="eyebrow">' + (skill.category === 'starter' ? 'STARTER SKILL' : 'SKILL EARNED') + '</p><h2 id="skill-title">' + escapeHtml(skill.name) + '</h2><p>' + escapeHtml(node ? 'You earned this by enjoying “' + node.title + '.”' : 'One of the four strengths that set your initial direction.') + '</p><button class="button button--primary button--wide" data-action="close-modal">Back to journey</button></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function wireModalEvents() {
    modalRoot.querySelectorAll('[data-action]').forEach(function (element) {
      element.addEventListener('click', function (event) {
        var action = element.getAttribute('data-action');
        if (action === 'confirm-restart') resetState();
        else if (action === 'confirm-edit-skills') { editStarterSkills(); closeModal(); }
        else if (action === 'confirm-reject') { rejectNode(element.getAttribute('data-node-id') || state.selectedNodeId); closeModal(); }
        else if (action === 'replay-node') { replayNode(element.getAttribute('data-node-id')); closeModal(); }
        else if (action === 'close-modal' && event.target === event.currentTarget) closeModal();
      });
    });
  }

  function closeModal() {
    if (modalRoot) modalRoot.innerHTML = '';
    setModalSurfaces(false);
    var target = modalReturnFocus; modalReturnFocus = null;
    if (target && document.body.contains(target)) target.focus();
  }

  function setModalSurfaces(isOpen) {
    [root, dock, document.querySelector('.site-header')].forEach(function (surface) { if (surface) surface.inert = isOpen; });
  }

  function trapModalFocus(event) {
    if (!modalRoot || !modalRoot.innerHTML || event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(modalRoot.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')).filter(function (element) { return !element.disabled; });
    if (!focusable.length) { event.preventDefault(); return; }
    var first = focusable[0]; var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function focusAfterRender() {
    var target = root.querySelector('h1, input, [data-action="open-node"]');
    if (!target) return;
    window.setTimeout(function () {
      if (document.body.contains(target) && target.focus) {
        // Do not steal focus when a keyboard user has already moved to a new
        // control during the short post-render delay.
        var active = document.activeElement;
        // Browsers may restore the prior scroll position after initial render;
        // enforce the screen-start contract even when focus is user-owned.
        window.scrollTo(0, 0);
        // A control that triggered this render can remain document.activeElement
        // briefly even after root.innerHTML detached it. Treat that stale focus
        // as unowned so the new screen heading still receives context focus.
        var activeOwnsFocus = active && active !== document.body && active !== root && document.documentElement.contains(active);
        if (activeOwnsFocus) return;
        try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
        // Some older WebKit builds ignore focus({preventScroll}); enforce the
        // screen contract after focus as a harmless second guard.
        window.scrollTo(0, 0);
      }
    }, prefersReducedMotion ? 0 : 35);
  }

  function slug(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function titleCase(value) { return String(value || '').replace(/[-_]/g, ' ').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); }); }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  function escapeAttr(value) { return escapeHtml(value); }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modalRoot && modalRoot.innerHTML) { closeModal(); return; }
    trapModalFocus(event);
  });

  render();
  window.CareerLaunchpadApp = {
    render: render, reset: resetState,
    getState: function () { return state; }, getModel: function () { return model; },
    recommendRegion: function (skillIds) { var region = recommendRegion(skillIds || state.starterSkills, []); return region && region.id; }
  };
}());
