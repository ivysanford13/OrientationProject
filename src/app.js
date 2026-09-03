/*
 * IS Career Launchpad — guided RPG progression controller
 *
 * Data and visuals remain separate from this file. Mini-games plug into the
 * stable node ids in data.js; until then, every node uses the same placeholder
 * → enjoyment check → reward/reroute contract.
 */
(function careerLaunchpadApp() {
  'use strict';

  var STORAGE_KEY = 'is-career-launchpad:v2';
  var root = document.getElementById('app');
  var dock = document.getElementById('skill-dock');
  var toastRegion = document.getElementById('toast-region');
  var modalRoot = document.getElementById('modal-root');
  var headerStatus = document.getElementById('header-status-copy');

  if (!root) return;

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      glyph: skill.glyph || '✦'
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

    return { starterSkills: starterSkills, skills: skills, regions: regions };
  }

  function normalizeNode(item, parentId, skills, careers) {
    var reward = item.earnedSkill || item.skill || {};
    var rewardSkill = typeof reward === 'string' ? skills[reward] : normalizeSkill(reward);
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
      earnedSkill: rewardSkill ? rewardSkill.id : null,
      miniGame: Object.assign({ title: 'Planned mini-game', concept: 'A focused sixty-second challenge will live here.', durationSeconds: 60 }, item.miniGame || {}),
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
      version: 2, screen: 'landing', name: '', avatar: 'comet', starterSkills: [],
      recommendedRegionId: null, activeRegionId: null, activeDomainId: null,
      completed: [], earned: [], rejected: [], selectedNodeId: null,
      travelTargetId: null, travelFromId: null, lastCareerId: null, lastAward: false
    };
  }

  function loadState() {
    var initial = defaultState();
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || saved.version !== 2) return initial;
      return Object.assign(initial, saved, {
        starterSkills: Array.isArray(saved.starterSkills) ? saved.starterSkills.slice(0, 4) : [],
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        earned: Array.isArray(saved.earned) ? saved.earned : [],
        rejected: Array.isArray(saved.rejected) ? saved.rejected : [],
        screen: saved.screen === 'travel' ? 'map' : saved.screen
      });
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
    return renderLanding();
  }

  function renderLanding() {
    var avatars = [
      { id: 'comet', label: 'Comet', glyph: '✦' }, { id: 'pixel', label: 'Pixel', glyph: '▦' },
      { id: 'sprout', label: 'Sprout', glyph: '✿' }, { id: 'orbit', label: 'Orbit', glyph: '◉' }
    ];
    return '<section class="screen hero-screen screen--landing" aria-labelledby="welcome-title">' +
      '<div class="landing-sky" aria-hidden="true"><span class="star star--one"></span><span class="star star--two"></span><span class="star star--three"></span><span class="planet"></span></div>' +
      '<div class="hero-copy landing-copy"><p class="screen-kicker">INFORMATION SYSTEMS / FIELD GUIDE 02</p><h1 id="welcome-title" class="screen-title" tabindex="-1">Build your skills.<br><em>Find your world.</em></h1><p class="screen-subtitle">Choose the strengths that feel like you, then watch your explorer travel through an IS career world built around them.</p>' +
      '<form id="start-form" class="launch-card start-card"><p class="card-label">Create your explorer</p><label for="player-name">What should we call you?</label><input id="player-name" name="playerName" autocomplete="name" maxlength="32" placeholder="Your first name" value="' + escapeHtml(state.name) + '" required><fieldset><legend>Choose your explorer</legend><div class="avatar-grid">' + avatars.map(function (avatar) {
        return '<button class="avatar-choice' + (state.avatar === avatar.id ? ' is-selected' : '') + '" type="button" data-action="choose-avatar" data-avatar="' + avatar.id + '" aria-pressed="' + (state.avatar === avatar.id) + '"><span class="avatar-portrait" aria-hidden="true">' + avatar.glyph + '</span><span class="avatar-name">' + avatar.label + '</span><small class="avatar-tag">ready to travel</small></button>';
      }).join('') + '</div></fieldset><button class="button button--primary button--wide" type="submit">Choose my starter skills <span aria-hidden="true">→</span></button></form>' +
      (state.name && state.starterSkills.length === 4 ? '<button class="text-button" data-action="resume">Resume ' + escapeHtml(state.name) + '’s journey</button>' : '') + '</div><p class="landing-note">Four starter skills · three worlds · one career path</p></section>';
  }

  function renderSkillSelect() {
    var selected = state.starterSkills;
    return '<section class="screen screen--skills" aria-labelledby="skills-title"><div class="skills-heading"><div><p class="screen-kicker">LOADOUT / CHOOSE 4 OF 10</p><h1 id="skills-title" tabindex="-1">What are you good at—<br><em>or excited to become good at?</em></h1><p>Select exactly four. Your combination becomes your first skill stack and points your compass toward a career world.</p></div><div class="selection-meter" aria-live="polite"><strong>' + selected.length + '<span>/4</span></strong><small>skills selected</small></div></div><div class="starter-skill-grid">' + model.starterSkills.map(function (skill, index) {
      var picked = selected.indexOf(skill.id) !== -1;
      var unavailable = selected.length >= 4 && !picked;
      return '<button class="starter-skill' + (picked ? ' is-picked' : '') + '" type="button" data-action="toggle-starter" data-skill-id="' + escapeAttr(skill.id) + '" aria-pressed="' + picked + '" ' + (unavailable ? 'aria-disabled="true"' : '') + ' style="--skill-color:' + escapeAttr(skill.color) + '"><span class="starter-number">' + String(index + 1).padStart(2, '0') + '</span><span class="starter-glyph" aria-hidden="true">' + escapeHtml(skill.glyph) + '</span><strong>' + escapeHtml(skill.label) + '</strong><small>' + escapeHtml(skill.description) + '</small><span class="pick-state">' + (picked ? 'Selected ✓' : 'Choose +') + '</span></button>';
    }).join('') + '</div><div class="skills-footer"><button class="text-button" data-action="back-landing">← Back</button><p>' + (selected.length === 4 ? 'Your compass is ready.' : 'Choose ' + (4 - selected.length) + ' more to continue.') + '</p><button class="button button--primary" data-action="confirm-skills" ' + (selected.length === 4 ? '' : 'disabled') + '>Reveal my world <span aria-hidden="true">↗</span></button></div></section>';
  }

  function renderMap() {
    var region = findNode(state.activeRegionId) || recommendRegion(state.starterSkills, state.rejected);
    if (!region) return '<section class="screen"><h1>No map data found</h1></section>';
    var regionDone = isCompleted(region.id);
    var domain = state.activeDomainId ? findNode(state.activeDomainId) : null;
    var domainDone = domain && isCompleted(domain.id);
    var stage = domainDone ? 2 : regionDone ? 1 : 0;
    var options = stage === 0 ? [region] : stage === 1 ? region.children : domain.children;
    var current = currentJourneyNode();
    var scores = scoreRegions(state.starterSkills);
    var recommendation = region.id === state.recommendedRegionId ? 'BEST STARTING MATCH' : 'NEXT BEST MATCH';
    // Keep the lower fork above the fixed skill stack on compact phone screens.
    var lowerChoiceY = window.innerWidth <= 767 ? 43 : 70;
    var sceneNodes = [];
    if (stage === 0) sceneNodes.push({ node: region, position: { x: 58, y: 43 }, kind: 'region' });
    if (stage === 1) {
      sceneNodes.push({ node: region, position: { x: 17, y: 53 }, kind: 'past' });
      region.children.forEach(function (item, index) { sceneNodes.push({ node: item, position: { x: 66, y: index ? lowerChoiceY : 29 }, kind: 'choice' }); });
    }
    if (stage === 2) {
      sceneNodes.push({ node: region, position: { x: 8, y: 53 }, kind: 'past' });
      sceneNodes.push({ node: domain, position: { x: 31, y: 53 }, kind: 'past' });
      domain.children.forEach(function (item, index) { sceneNodes.push({ node: item, position: { x: 73, y: index ? lowerChoiceY : 29 }, kind: 'choice' }); });
    }
    var avatarPosition = avatarMapPosition(stage, current && current.id, sceneNodes);
    var travelTarget = state.travelTargetId && sceneNodes.filter(function (entry) { return entry.node.id === state.travelTargetId; })[0];
    var travelFrom = state.travelFromId && sceneNodes.filter(function (entry) { return entry.node.id === state.travelFromId; })[0];
    var targetPosition = travelTarget ? travelTarget.position : avatarPosition;
    var fromPosition = travelFrom ? travelFrom.position : avatarPosition;

    return '<section class="screen screen--map world-screen" aria-labelledby="map-title"><header class="world-header"><div><p class="screen-kicker">WORLD ' + region.number + ' / ' + recommendation + '</p><h1 id="map-title" tabindex="-1">' + (stage === 0 ? 'What gives you energy?' : stage === 1 ? 'Choose your next trail.' : 'One last fork in the road.') + '</h1><p>' + mapPrompt(stage, region, domain) + '</p></div><div class="compass-card" style="--region-color:' + escapeAttr(region.color) + '"><span>Your skill compass points to</span><strong>' + escapeHtml(region.title) + '</strong><small>Match score ' + Number(scores[region.id] || 0) + ' · based on your four skills</small><button class="text-button" data-action="edit-skills">Edit starter skills</button></div></header><section class="rpg-world stage-' + stage + ' theme-' + escapeAttr(region.theme || slug(region.id)) + '" aria-label="Interactive journey map"><div class="world-sky" aria-hidden="true"><span class="world-sun"></span><span class="cloud cloud--one"></span><span class="cloud cloud--two"></span><span class="mountain mountain--one"></span><span class="mountain mountain--two"></span></div><svg class="quest-path" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M80 360 C240 375 315 260 450 260 S655 125 850 155 M450 260 C625 260 660 390 850 390"></path></svg><div class="start-camp world-landmark" style="--x:9%;--y:69%" aria-label="Journey start"><span aria-hidden="true">⌂</span><small>START</small></div>' + sceneNodes.map(renderWorldStop).join('') + '<div class="map-avatar avatar-' + escapeAttr(state.avatar) + (state.screen === 'travel' ? ' is-traveling' : '') + '" style="--from-x:' + fromPosition.x + '%;--from-y:' + fromPosition.y + '%;--to-x:' + targetPosition.x + '%;--to-y:' + targetPosition.y + '%" aria-label="' + escapeAttr((state.name || 'Your explorer') + (state.screen === 'travel' ? ' traveling to ' + (travelTarget ? travelTarget.node.title : 'the next stop') : ' current map position')) + '"><span aria-hidden="true">' + avatarGlyph(state.avatar) + '</span><small>' + escapeHtml(state.name || 'YOU') + '</small></div><div class="terrain terrain--front" aria-hidden="true"></div><div class="world-stage-label"><span>CHAPTER ' + (stage + 1) + ' OF 3</span><strong>' + escapeHtml(stage === 0 ? region.title : stage === 1 ? 'Choose a domain' : 'Choose a career style') + '</strong></div></section><div class="map-action-row"><p><strong>' + options.filter(function (node) { return !isRejected(node.id); }).length + '</strong> route' + (options.filter(function (node) { return !isRejected(node.id); }).length === 1 ? '' : 's') + ' open · a “no” closes that trail and returns you here.</p><button class="button button--quiet" data-action="restart">Restart journey</button></div></section>';
  }

  function renderWorldStop(entry) {
    var node = entry.node;
    var rejected = isRejected(node.id);
    var complete = isCompleted(node.id);
    var open = canOpen(node);
    return '<button class="world-stop world-stop--' + entry.kind + (rejected ? ' is-rejected' : '') + (complete ? ' is-complete' : '') + '" type="button" data-action="open-node" data-node-id="' + escapeAttr(node.id) + '" style="--x:' + entry.position.x + '%;--y:' + entry.position.y + '%;--node-color:' + escapeAttr(node.color || '#2f6fed') + '" ' + (open ? '' : 'disabled') + '><span class="stop-icon" aria-hidden="true">' + (rejected ? '×' : complete ? '✓' : entry.kind === 'region' ? '◆' : '●') + '</span><span class="stop-copy"><small>' + escapeHtml(rejected ? 'TRAIL CLOSED' : complete ? 'EXPLORED' : 'NEXT STOP') + '</small><strong>' + escapeHtml(node.title) + '</strong><em>' + escapeHtml(rejected ? 'You chose the other path' : node.subtitle) + '</em></span></button>';
  }

  function avatarMapPosition(stage, currentId, entries) {
    if (!currentId) return { x: 9, y: 64 };
    var current = entries.filter(function (entry) { return entry.node.id === currentId; })[0];
    if (current) return current.position;
    if (stage === 2) return { x: 31, y: 49 };
    if (stage === 1) return { x: 17, y: 49 };
    return { x: 9, y: 64 };
  }

  function mapPrompt(stage, region, domain) {
    if (stage === 0) return 'Your four starter skills brought you to ' + region.title + '. Move your explorer to the first challenge.';
    if (stage === 1) return 'The world shifts forward. Choose the kind of ' + region.title.toLowerCase() + ' work you want to try.';
    return 'You enjoyed ' + domain.title + '. Choose the work style that sounds most like you.';
  }

  function renderMiniGame(node) {
    if (!node) return renderMap();
    var skill = skillFor(node);
    var mini = node.miniGame || {};
    return '<section class="screen screen--challenge" aria-labelledby="challenge-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to map</button><span class="progress-chip">~60 SEC / PLANNED</span><button class="button button--quiet" data-action="restart">Restart</button></header><div class="challenge-layout"><div class="challenge-copy"><p class="eyebrow">' + escapeHtml(node.id) + ' / MINI-GAME STOP</p><h1 id="challenge-title" tabindex="-1">' + escapeHtml(mini.title) + '</h1><p class="lede">' + escapeHtml(mini.concept || mini.description) + '</p><div class="reward-callout"><span class="hex hex--small" style="--skill-color:' + escapeAttr(skill.color) + '" aria-hidden="true">✦</span><div><span class="eyebrow">POSSIBLE NEW SKILL</span><strong>' + escapeHtml(skill.name) + '</strong><p>You earn it only if you choose to keep following this trail.</p></div></div><div class="challenge-actions"><button class="button button--primary" data-action="finish-game">Skip game for now <span aria-hidden="true">→</span></button><button class="text-button" data-action="back-map">Return to map</button></div></div><div class="placeholder-stage" role="region" aria-label="Planned mini-game workspace"><div class="stage-grid" aria-hidden="true"></div><div class="placeholder-card"><span class="placeholder-icon" aria-hidden="true">⌁</span><span class="eyebrow">GAME SPACE / EDITABLE MODULE</span><h2>' + escapeHtml(mini.title) + '</h2><p>' + escapeHtml(mini.instructions || 'Placeholder ready for a future interactive build.') + '</p><div class="placeholder-meta"><span>~ ' + escapeHtml(mini.durationSeconds || 60) + ' sec</span><span>' + escapeHtml(mini.visualType || 'activity') + '</span></div></div></div></div></section>';
  }

  function renderReflection(node) {
    var skill = skillFor(node);
    var sibling = findAlternative(node);
    return '<section class="screen screen--reflection" aria-labelledby="reflection-title"><div class="reflection-scene"><div class="reflection-avatar avatar-' + escapeAttr(state.avatar) + '" aria-hidden="true">' + avatarGlyph(state.avatar) + '</div><div class="reflection-card"><p class="screen-kicker">TRAIL CHECKPOINT</p><h1 id="reflection-title" tabindex="-1">Did you enjoy that kind of activity?</h1><p>Your answer changes the map. There is no wrong response—this is about noticing what gives you energy.</p><div class="reflection-choice-grid"><button class="reflection-choice reflection-choice--yes" data-action="enjoy-yes"><span aria-hidden="true">✓</span><strong>Yes, keep going</strong><small>Add <b>' + escapeHtml(skill.name) + '</b> and reveal the next stage.</small></button><button class="reflection-choice reflection-choice--no" data-action="enjoy-no"><span aria-hidden="true">↶</span><strong>No, try another trail</strong><small>' + escapeHtml(sibling ? 'Return to the map and try ' + sibling.title + '.' : 'Return to the map for a different recommendation.') + '</small></button></div><button class="text-button" data-action="back-map">I’m not sure yet — return to map</button></div></div></section>';
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
    return '<section class="screen screen--career" aria-labelledby="career-title"><header class="topbar"><button class="button button--quiet" data-action="back-map">← Back to world</button><button class="button button--quiet" data-action="restart">Restart</button></header><div class="career-hero"><p class="eyebrow">' + escapeHtml(node.id) + ' / CAREER MATCH</p><h1 id="career-title" tabindex="-1">' + escapeHtml(career.title) + '</h1><p class="lede">' + escapeHtml(career.summary || career.whatTheyDo) + '</p><div class="career-hero-meta"><span>Starter skills: <strong>4</strong></span><span>Journey skills: <strong>' + state.earned.length + '</strong></span><span>Path complete ✓</span></div></div><div class="career-grid"><div class="career-facts">' + lists.map(function (pair) { return '<section class="fact"><h2>' + escapeHtml(pair[0]) + '</h2>' + renderFactList(pair[1]) + '</section>'; }).join('') + '</div><aside class="career-sidebar"><div class="career-stat"><span class="eyebrow">ENTRY RANGE</span><strong>' + escapeHtml(formatSalary(career.salary)) + '</strong><small>Research-backed salary data will be added in the content phase.</small></div><div class="career-stat"><span class="eyebrow">GROWTH</span><p>' + escapeHtml(formatList(career.careerGrowth || career.growth)) + '</p></div><button class="button button-coral button--wide" data-action="new-path">Start another path ↗</button><button class="text-button" data-action="back-map">View this world</button></aside></div></section>';
  }

  function renderFactList(value) {
    var items = Array.isArray(value) ? value : value ? [value] : ['Research pending'];
    return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(typeof item === 'object' ? formatList(item) : item) + '</li>'; }).join('') + '</ul>';
  }

  function formatSalary(value) {
    if (!value) return 'Research pending';
    if (typeof value === 'string') return value;
    return value.range || (value.status === 'research-pending' ? 'Research pending' : value.note) || 'Research pending';
  }

  function formatList(value) {
    if (Array.isArray(value)) return value.join(' · ');
    if (value && typeof value === 'object') return Object.keys(value).map(function (key) { return formatList(value[key]); }).filter(Boolean).join(' · ');
    return value || 'Research pending';
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
    if (!items.length) { dock.innerHTML = ''; return; }
    dock.innerHTML = '<div class="dock-inner"><div class="dock-label"><span class="dock-pip" aria-hidden="true"></span><div><h2>SKILL STACK</h2><p>' + items.length + ' total · ' + state.earned.length + ' earned</p></div></div><div class="hex-track" id="skill-dock-list" role="list" aria-label="Four starter skills plus skills earned during this journey">' + items.map(function (item, index) {
      return '<button class="hex-item' + (item.starter ? ' is-starter' : ' is-earned') + (index === items.length - 1 && state.lastAward ? ' skill-hex--new' : '') + '" type="button" data-action="inspect-skill" data-skill-id="' + escapeAttr(item.skill.id) + '" aria-label="' + escapeAttr(item.skill.name + ', ' + item.source) + '" style="--skill-color:' + escapeAttr(item.skill.color) + '"><span aria-hidden="true">' + escapeHtml(item.skill.glyph || '✦') + '</span><strong>' + escapeHtml(item.skill.shortName || item.skill.name) + '</strong><small>' + escapeHtml(item.starter ? 'starter' : 'earned') + '</small></button>';
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
    if (dock) dock.querySelectorAll('[data-action]').forEach(function (element) { element.addEventListener('click', handleAction); });
    var form = document.getElementById('start-form');
    if (form) form.addEventListener('submit', handleStart);
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
    if (action === 'choose-avatar') { state.avatar = element.getAttribute('data-avatar') || 'comet'; saveState(); render(); return; }
    if (action === 'toggle-starter') { toggleStarterSkill(element.getAttribute('data-skill-id')); return; }
    if (action === 'confirm-skills') { confirmStarterSkills(); return; }
    if (action === 'back-landing') { state.screen = 'landing'; saveState(); render(); return; }
    if (action === 'resume') { state.screen = state.starterSkills.length === 4 ? 'map' : 'skill-select'; saveState(); render(); return; }
    if (action === 'edit-skills') { editStarterSkills(); return; }
    if (action === 'open-node') { openNode(element.getAttribute('data-node-id')); return; }
    if (action === 'finish-game') { state.screen = 'reflection'; saveState(); render(); return; }
    if (action === 'enjoy-yes') { completeNode(state.selectedNodeId); return; }
    if (action === 'enjoy-no') { rejectNode(state.selectedNodeId); return; }
    if (action === 'back-map') { state.screen = 'map'; state.travelTargetId = null; saveState(); render(); return; }
    if (action === 'new-path') { startAnotherPath(); return; }
    if (action === 'restart') { modalReturnFocus = element; showRestartModal(); return; }
    if (action === 'inspect-skill') { modalReturnFocus = element; showSkillModal(element.getAttribute('data-skill-id')); }
  }

  function toggleStarterSkill(skillId) {
    var index = state.starterSkills.indexOf(skillId);
    if (index !== -1) state.starterSkills.splice(index, 1);
    else if (state.starterSkills.length < 4 && model.skills[skillId]) state.starterSkills.push(skillId);
    saveState(); render();
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
    state.activeDomainId = null; state.selectedNodeId = null; saveState(); render();
  }

  function openNode(id) {
    var node = findNode(id);
    if (!canOpen(node)) return;
    var current = currentJourneyNode();
    state.selectedNodeId = id; state.travelFromId = current ? current.id : null; state.travelTargetId = id;
    if (nodeDepth(node) === 1) state.activeDomainId = id;
    state.screen = 'travel'; saveState(); render();
    if (travelTimer) window.clearTimeout(travelTimer);
    travelTimer = window.setTimeout(function () {
      state.screen = 'mini'; state.travelTargetId = null; state.travelFromId = null; saveState(); render();
      announce(node.title + ' challenge opened.');
    }, prefersReducedMotion ? 70 : 900);
  }

  function completeNode(id) {
    var node = findNode(id);
    if (!node) return;
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
    if (!node) return;
    if (!isRejected(id)) state.rejected.push(id);
    var depth = nodeDepth(node);
    if (depth === 0) {
      var nextRegion = recommendRegion(state.starterSkills, state.rejected);
      state.activeRegionId = nextRegion.id; state.activeDomainId = null;
    } else if (depth === 1) state.activeDomainId = null;
    state.selectedNodeId = null; state.travelTargetId = null; state.screen = 'map'; saveState(); render();
    var alternative = findAlternative(node);
    announce(alternative ? node.title + ' closed. Try ' + alternative.title + '.' : 'That trail closed. Your compass found another route.');
  }

  function findAlternative(node) {
    if (!node) return null;
    if (!node.parentId) return recommendRegion(state.starterSkills, state.rejected.concat([node.id]));
    var parent = findNode(node.parentId);
    return parent && parent.children.filter(function (candidate) { return candidate.id !== node.id && !isRejected(candidate.id); })[0] || null;
  }

  function startAnotherPath() {
    state.screen = 'skill-select'; state.completed = []; state.earned = []; state.rejected = [];
    state.activeRegionId = null; state.activeDomainId = null; state.selectedNodeId = null; state.lastCareerId = null;
    saveState(); render();
  }

  // ---------------------------------------------------------------------------
  // Feedback, motion, and dialogs
  // ---------------------------------------------------------------------------

  function showToast(message, skill) {
    if (!toastRegion) return;
    toastRegion.innerHTML = '<div class="toast toast--reward" role="status"><span class="toast-mark" style="--skill-color:' + escapeAttr(skill.color) + '" aria-hidden="true">✦</span><span>' + escapeHtml(message) + '</span></div>';
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
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--skill" role="dialog" aria-modal="true" aria-labelledby="skill-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="hex hex--modal" style="--skill-color:' + escapeAttr(skill.color) + '" aria-hidden="true">' + escapeHtml(skill.glyph || '✦') + '</span><p class="eyebrow">' + (skill.category === 'starter' ? 'STARTER SKILL' : 'SKILL EARNED') + '</p><h2 id="skill-title">' + escapeHtml(skill.name) + '</h2><p>' + escapeHtml(node ? 'You earned this by enjoying “' + node.title + '.”' : 'One of the four strengths that set your initial direction.') + '</p><button class="button button--primary button--wide" data-action="close-modal">Back to journey</button></section></div>';
    wireModalEvents(); modalRoot.querySelector('.modal-close').focus();
  }

  function wireModalEvents() {
    modalRoot.querySelectorAll('[data-action]').forEach(function (element) {
      element.addEventListener('click', function (event) {
        var action = element.getAttribute('data-action');
        if (action === 'confirm-restart') resetState();
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
    window.setTimeout(function () { if (document.body.contains(target) && target.focus) target.focus(); }, prefersReducedMotion ? 0 : 35);
  }

  function avatarGlyph(avatar) { return { comet: '✦', pixel: '▦', sprout: '✿', orbit: '◉' }[avatar] || '✦'; }
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
