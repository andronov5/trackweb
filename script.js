'use strict';

// Pure calculations are shared by the page and the lightweight Node checks.
const TrackTools = (() => {
  const events = Object.freeze({
    '100': { label: '100m', kind: 'time' }, '200': { label: '200m', kind: 'time' },
    '400': { label: '400m', kind: 'time' }, '800': { label: '800m', kind: 'time' },
    '1600': { label: '1600m', kind: 'time' }, '3200': { label: '3200m', kind: 'time' },
    xc5k: { label: 'Cross country 5K', kind: 'time' },
    '100h': { label: '100m hurdles', kind: 'time' }, '110h': { label: '110m hurdles', kind: 'time' },
    '300h': { label: '300m hurdles', kind: 'time' },
    long: { label: 'Long jump', kind: 'distance' }, triple: { label: 'Triple jump', kind: 'distance' },
    high: { label: 'High jump', kind: 'distance' }, vault: { label: 'Pole vault', kind: 'distance' },
    shot: { label: 'Shot put', kind: 'distance' }, discus: { label: 'Discus', kind: 'distance' }
  });

  function parseTime(input) {
    const text = String(input).trim();
    let value;
    if (/^\d{1,4}(?:\.\d{1,2})?$/.test(text)) value = Number(text);
    else if (/^\d{1,2}:[0-5]\d(?:\.\d{1,2})?$/.test(text)) {
      const [minutes, seconds] = text.split(':').map(Number);
      value = minutes * 60 + seconds;
    } else return null;
    return Number.isFinite(value) && value > 0 && value <= 3600 ? Math.round(value * 100) / 100 : null;
  }

  function formatTime(value) {
    const hundredths = Math.round(value * 100);
    const minutes = Math.floor(hundredths / 6000);
    const seconds = Math.floor(hundredths % 6000 / 100);
    const fraction = String(hundredths % 100).padStart(2, '0');
    return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}.${fraction}` : `${seconds}.${fraction}`;
  }

  function buildSplits(distance, seconds, interval) {
    if (![100, 200, 400, 800, 1600, 3200, 5000].includes(distance) || ![100, 200, 400, 1000].includes(interval) || interval > distance || !Number.isFinite(seconds) || seconds <= 0 || seconds > 3600) return [];
    const splits = [];
    for (let point = interval; point < distance; point += interval) splits.push({ distance: point, time: seconds * point / distance });
    splits.push({ distance, time: seconds });
    return splits;
  }

  function parseMark(event, input) {
    if (!Object.hasOwn(events, event)) return null;
    if (events[event].kind === 'time') return parseTime(input);
    const text = String(input).trim();
    if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(text)) return null;
    const value = Number(text);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function validDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  }

  function validMarks(value) {
    return Array.isArray(value) && value.length <= 2000 && value.every(mark => mark &&
      typeof mark.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(mark.id) && Object.hasOwn(events, mark.event) &&
      typeof mark.value === 'number' && Number.isFinite(mark.value) && mark.value > 0 &&
      mark.value <= (events[mark.event].kind === 'time' ? 3600 : 999.99) && validDate(mark.date)) &&
      new Set(value.map(mark => mark.id)).size === value.length;
  }

  function bests(marks) {
    return marks.reduce((best, mark) => {
      if (!Object.hasOwn(events, mark.event)) return best;
      const previous = best[mark.event];
      if (previous === undefined || (events[mark.event].kind === 'time' ? mark.value < previous : mark.value > previous)) best[mark.event] = mark.value;
      return best;
    }, {});
  }

  function formatMark(mark) {
    return events[mark.event].kind === 'time' ? formatTime(mark.value) : `${mark.value.toFixed(2)} m`;
  }

  function marksCSV(marks) {
    const rows = [['Date', 'Event', 'Mark', 'Unit', 'Personal best']];
    const best = bests(marks);
    [...marks].sort((a, b) => b.date.localeCompare(a.date)).forEach(mark => {
      rows.push([mark.date, events[mark.event].label, mark.value.toFixed(2), events[mark.event].kind === 'time' ? 'seconds' : 'meters', mark.value === best[mark.event] ? 'Yes' : '']);
    });
    return rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  }

  return Object.freeze({ events, parseTime, formatTime, buildSplits, parseMark, validDate, validMarks, bests, formatMark, marksCSV });
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TrackTools;

if (typeof document !== 'undefined') {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const storageKeys = { marks: 'northfield.track.marks.v1', packing: 'northfield.track.packing.v1', reaction: 'northfield.track.reaction.v1' };
  const blockedKeys = new Set();
  let toastTimer;

  function toast(message, undo) {
    const element = $('#toast');
    if (!element) return;
    clearTimeout(toastTimer);
    element.replaceChildren(document.createTextNode(message));
    if (undo) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'undo-button';
      button.textContent = 'Undo';
      button.addEventListener('click', () => { undo(); element.hidden = true; }, { once: true });
      element.append(button);
    }
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, undo ? 12000 : 5000);
  }

  function storageNotice(message) {
    const status = $('#storageStatus');
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
  }

  function loadSaved(key, fallback, validate) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      if (!validate(parsed)) throw new Error('Invalid saved data');
      return parsed;
    } catch {
      blockedKeys.add(key);
      storageNotice('Saved data could not be read on this device. Your existing data has not been changed. New changes will last for this visit only; export your marks to keep a copy.');
      return fallback;
    }
  }

  function saveLocal(key, value) {
    if (blockedKeys.has(key)) return false;
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch {
      storageNotice('Your browser could not save these changes. They will last for this visit only. Export your marks to keep a copy.');
      return false;
    }
  }

  async function copyText(text, message) {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch {
      const input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('aria-label', 'Text to copy');
      input.style.cssText = 'position:fixed;inset:0 auto auto 0;width:1px;height:1px;opacity:0';
      document.body.append(input);
      const previousFocus = document.activeElement;
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Manual selection remains available below. */ }
      input.remove();
      previousFocus?.focus({ preventScroll: true });
      if (copied) toast(message);
      else toast('Copy is unavailable. Select the visible text to copy it manually.');
    }
  }

  function setupNavigation() {
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    if (!toggle || !menu) return;
    const close = (returnFocus = false) => {
      const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      if (returnFocus && wasOpen) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
    document.addEventListener('pointerdown', event => { if (!event.target.closest('.site-header')) close(); });
    const desktop = window.matchMedia('(min-width: 1101px)');
    desktop.addEventListener('change', () => close());
    // Current-page state is authored in each page so it works without JavaScript.
  }

  function followLegacyBookmark() {
    if (document.body?.dataset.page !== 'home') return;
    const routes = {
      '#news': 'news.html', '#accomplishments': 'accomplishments.html',
      '#athlete-lab': 'athlete-lab.html', '#meetday': 'meet-day.html',
      '#new': 'join.html', '#coaches': 'team.html#coaches',
      '#links': 'team.html#links', '#contact': 'team.html#contact'
    };
    const route = routes[window.location.hash];
    if (route) window.location.replace(route);
  }

  let cancelReaction = () => {};
  function setupTabs() {
    const tabs = $$('.lab-tabs [role="tab"]');
    function activate(tab) {
      tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
      });
      if (tab.id !== 'tab-reaction') cancelReaction();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
  }

  function setupPace() {
    const distanceInput = $('#paceDistance');
    const timeInput = $('#paceTime');
    const intervalInput = $('#paceInterval');
    let currentCopy = '';
    function calculate() {
      const distance = Number(distanceInput.value);
      const seconds = TrackTools.parseTime(timeInput.value);
      if (seconds === null) {
        timeInput.setAttribute('aria-invalid', 'true');
        $('#paceError').textContent = 'Enter a positive time up to 60 minutes, like 65.00 or 1:05.00. Use up to two decimal places.';
        $('#paceResults').hidden = true;
        return false;
      }
      $('#paceError').textContent = '';
      timeInput.removeAttribute('aria-invalid');
      $('#paceResults').hidden = false;
      const splits = TrackTools.buildSplits(distance, seconds, Number(intervalInput.value));
      $('#targetTime').textContent = TrackTools.formatTime(seconds);
      $('#paceEventLabel').textContent = `${distance} M`;
      $('#paceSummary').textContent = distance === 5000 ? `${TrackTools.formatTime(seconds / 5)} per kilometer` : `${(seconds / distance * 100).toFixed(2)} seconds per 100m`;
      $('#splitBody').innerHTML = splits.map((split, index) => `<tr><th scope="row">${split.distance}m${index === splits.length - 1 ? ' <span>FINISH</span>' : ''}</th><td>${TrackTools.formatTime(split.time)}</td></tr>`).join('');
      currentCopy = `${distance}m goal: ${TrackTools.formatTime(seconds)}\nEven-pace cumulative splits\n${splits.map(split => `${split.distance}m: ${TrackTools.formatTime(split.time)}`).join('\n')}`;
      return true;
    }
    $('#paceForm').addEventListener('submit', event => { event.preventDefault(); if (!calculate()) timeInput.focus(); });
    distanceInput.addEventListener('change', () => {
      const distance = Number(distanceInput.value);
      if (distance === 5000) intervalInput.value = '1000';
      [...intervalInput.options].forEach(option => { option.disabled = Number(option.value) > distance; });
      if (Number(intervalInput.value) > distance) intervalInput.value = String(distance);
      calculate();
    });
    intervalInput.addEventListener('change', calculate);
    timeInput.addEventListener('input', () => { $('#paceResults').hidden = true; $('#paceError').textContent = ''; timeInput.removeAttribute('aria-invalid'); });
    $('#copySplits').addEventListener('click', () => copyText(currentCopy, 'Race splits copied.'));
    calculate();
  }

  function todayLocal() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function setupMarks() {
    let marks = loadSaved(storageKeys.marks, [], TrackTools.validMarks);
    const eventInput = $('#markEvent');
    const valueInput = $('#markValue');
    const dateInput = $('#markDate');
    dateInput.value = todayLocal();
    dateInput.max = todayLocal();

    function render() {
      const list = $('#marksList');
      list.replaceChildren();
      $('#exportMarks').disabled = marks.length === 0;
      if (!marks.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-marks';
        const heading = document.createElement('strong');
        heading.textContent = 'YOUR FIRST MARK STARTS THE STORY.';
        const text = document.createElement('p');
        text.textContent = 'Log a race, jump, or throw above. Your best in each event will stand out here.';
        empty.append(heading, text);
        list.append(empty);
        return;
      }
      const best = TrackTools.bests(marks);
      [...marks].sort((a, b) => b.date.localeCompare(a.date)).forEach(mark => {
        const row = document.createElement('article'); row.className = 'mark-row';
        const name = document.createElement('h4'); name.textContent = TrackTools.events[mark.event].label;
        const result = document.createElement('p'); result.className = 'mark-result'; result.textContent = TrackTools.formatMark(mark);
        if (mark.value === best[mark.event]) { const badge = document.createElement('span'); badge.className = 'pb-badge'; badge.textContent = 'PERSONAL BEST'; result.append(badge); }
        const date = document.createElement('time'); date.dateTime = mark.date;
        date.textContent = new Date(`${mark.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-mark'; remove.textContent = 'Remove';
        remove.setAttribute('aria-label', `Remove ${TrackTools.events[mark.event].label} mark ${TrackTools.formatMark(mark)} from ${date.textContent}`);
        remove.addEventListener('click', () => {
          const index = marks.findIndex(item => item.id === mark.id);
          marks = marks.filter(item => item.id !== mark.id);
          saveLocal(storageKeys.marks, marks);
          render();
          toast('Mark removed.', () => {
            if (marks.some(item => item.id === mark.id) || marks.length >= 2000) return;
            marks.splice(Math.min(index, marks.length), 0, mark);
            saveLocal(storageKeys.marks, marks);
            render();
          });
          $('#markValue').focus({ preventScroll: true });
        });
        row.append(name, result, date, remove); list.append(row);
      });
    }
    eventInput.addEventListener('change', () => {
      const field = TrackTools.events[eventInput.value].kind === 'distance';
      $('#markValueLabel').textContent = field ? 'Distance (meters)' : 'Time';
      valueInput.placeholder = field ? '5.42' : '1:05.00';
      valueInput.value = '';
      valueInput.removeAttribute('aria-invalid');
      $('#markHelp').textContent = field ? 'Enter meters, such as 5.42. Use the same event to compare your marks.' : 'Enter seconds or minutes:seconds. Bests are compared within the same event. Cross country courses and conditions vary.';
      $('#markError').textContent = '';
    });
    $('#markForm').addEventListener('submit', event => {
      event.preventDefault();
      const value = TrackTools.parseMark(eventInput.value, valueInput.value);
      valueInput.removeAttribute('aria-invalid');
      dateInput.removeAttribute('aria-invalid');
      if (value === null) {
        $('#markError').textContent = TrackTools.events[eventInput.value].kind === 'time' ? 'Enter a positive time, like 65.00 or 1:05.00 (up to 60 minutes).' : 'Enter a positive distance in meters, like 5.42. Use up to two decimal places.';
        valueInput.setAttribute('aria-invalid', 'true'); valueInput.focus(); return;
      }
      if (!TrackTools.validDate(dateInput.value) || dateInput.value > todayLocal()) {
        $('#markError').textContent = 'Choose today or a past date for a completed performance.';
        dateInput.setAttribute('aria-invalid', 'true'); dateInput.focus(); return;
      }
      if (marks.length >= 2000) { $('#markError').textContent = 'This log has 2,000 marks. Export a copy, then remove older entries to make room.'; return; }
      const previous = TrackTools.bests(marks)[eventInput.value];
      const isBest = previous === undefined || (TrackTools.events[eventInput.value].kind === 'time' ? value < previous : value > previous);
      const id = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `mark-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      marks.unshift({ id, event: eventInput.value, value, date: dateInput.value });
      const saved = saveLocal(storageKeys.marks, marks);
      render();
      valueInput.value = '';
      $('#markError').textContent = '';
      toast(saved ? (isBest ? 'A new personal best. Let’s go, Nighthawk!' : 'Mark saved. Keep showing up.') : 'Mark added for this visit. Export a copy to keep it.');
      valueInput.focus();
    });
    $('#exportMarks').addEventListener('click', () => {
      if (!marks.length) return;
      const url = URL.createObjectURL(new Blob(['\uFEFF' + TrackTools.marksCSV(marks)], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a'); link.href = url; link.download = `nighthawks-personal-bests-${todayLocal()}.csv`;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast('Your marks are ready to download.');
    });
    render();
  }

  function setupPacking() {
    const boxes = $$('#packingList input');
    const keys = boxes.map(box => box.value);
    const saved = loadSaved(storageKeys.packing, [], value => Array.isArray(value) && value.every(key => keys.includes(key)));
    boxes.forEach(box => { box.checked = saved.includes(box.value); });
    function render(persist = false) {
      const selected = boxes.filter(box => box.checked).map(box => box.value);
      const stored = persist ? saveLocal(storageKeys.packing, selected) : !blockedKeys.has(storageKeys.packing);
      $('#packingCount').textContent = `${selected.length}/${boxes.length}`;
      $('#packingProgress').value = selected.length;
      $('#packingProgress').textContent = `${selected.length} of ${boxes.length}`;
      $('#packingStatus').textContent = selected.length === boxes.length ? (stored ? 'All packed. Go Nighthawks!' : 'All packed for this visit.') : (stored ? 'Saved on this device.' : 'Kept for this visit only.');
    }
    boxes.forEach(box => box.addEventListener('change', () => render(true)));
    $('#resetPacking').addEventListener('click', () => {
      const previous = boxes.map(box => box.checked);
      boxes.forEach(box => { box.checked = false; }); render(true);
      toast('Packing list reset.', () => { boxes.forEach((box, index) => { box.checked = previous[index]; }); render(true); });
    });
    render();
  }

  function setupReaction() {
    const pad = $('#reactionPad');
    const title = $('#reactionTitle');
    const help = $('#reactionHelp');
    let state = 'idle';
    let timer;
    let frame;
    let goTime = 0;
    let round = 0;
    let best = loadSaved(storageKeys.reaction, null, value => value === null || (Number.isInteger(value) && value > 0 && value < 60000));
    const renderBest = () => { $('#reactionBest').innerHTML = `${best === null ? '—' : best} <small>ms</small>`; };
    function setState(next, label, instruction) {
      state = next; pad.dataset.state = next; title.textContent = label; help.textContent = instruction;
    }
    function stopPending() { clearTimeout(timer); cancelAnimationFrame(frame); round += 1; }
    function act() {
      if ($('#panel-reaction').hidden) return;
      if (state === 'waiting') {
        stopPending();
        setState('early', 'TOO SOON!', 'Wait for GO. Tap to try again.');
        $('#reactionStatus').textContent = 'Too soon. Wait for GO next time.';
      } else if (state === 'go') {
        const elapsed = Math.max(1, Math.round(performance.now() - goTime));
        stopPending();
        if (elapsed >= 60000) { setState('idle', 'TRY AGAIN', 'That round timed out. Tap for a fresh start.'); return; }
        const newBest = best === null || elapsed < best;
        if (newBest) { best = elapsed; saveLocal(storageKeys.reaction, best); renderBest(); }
        setState('result', `${elapsed} MS`, newBest ? 'New best! Tap to go again.' : 'Nice start. Tap to go again.');
        $('#reactionStatus').textContent = `${elapsed} milliseconds.${newBest ? ' New personal best.' : ''}`;
      } else {
        stopPending();
        const thisRound = round;
        setState('waiting', 'HOLD…', 'Wait for GO. Don’t jump the gun.');
        $('#reactionStatus').textContent = 'Wait for GO.';
        timer = setTimeout(() => {
          if (thisRound !== round || document.hidden || $('#panel-reaction').hidden) return;
          frame = requestAnimationFrame(() => {
            if (thisRound !== round) return;
            goTime = performance.now();
            setState('go', 'GO!', 'Tap now!');
            $('#reactionStatus').textContent = 'GO!';
          });
        }, 1800 + Math.random() * 2600);
      }
    }
    // Pointer-down avoids release-time delay. Prevent the synthetic click from recording twice.
    pad.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.preventDefault(); pad.focus({ preventScroll: true }); act();
    });
    pad.addEventListener('keydown', event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault(); if (!event.repeat) act();
    });
    pad.addEventListener('click', event => { if (event.detail === 0 && !event.defaultPrevented) act(); });
    cancelReaction = () => {
      stopPending();
      if (state === 'waiting' || state === 'go') {
        setState('idle', 'READY?', 'Round paused. Tap for a fresh start.');
        $('#reactionStatus').textContent = 'Round paused.';
      }
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelReaction(); });
    window.addEventListener('blur', cancelReaction);
    window.addEventListener('pagehide', cancelReaction);
    renderBest();
  }

  followLegacyBookmark();
  window.addEventListener('hashchange', followLegacyBookmark);
  setupNavigation();
  if ($('.lab-tabs')) setupTabs();
  if ($('#paceForm')) setupPace();
  if ($('#markForm')) setupMarks();
  if ($('#packingList')) setupPacking();
  if ($('#reactionPad')) setupReaction();
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  $('#copyContact')?.addEventListener('click', () => copyText('Northfield High School\n5500 Central Park Blvd.\nDenver, CO 80238\n720-423-8000\nnhscommunications@dpsk12.org', 'School contact info copied.'));
}
