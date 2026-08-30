(() => {
  'use strict';

  const STORAGE_KEY = 'holidayTimerSelectedEvent';
  const EVENTS_KEY = 'holidayTimerSavedEvents';

  const presetTemplates = {
    'new-year': { name: 'Новый год', date: getNextDate(1, 1) },
    vacation: { name: 'Каникулы', date: getNextDate(6, 15) },
    birthday: { name: 'День рождения', date: '2027-05-03' }
  };

  const dailyFacts = [
    'Солнце светит для всех, даже когда настроение в запасе.',
    'Одна хорошая привычка может изменить целый день к лучшему.',
    'Самое удивительное — это то, что мы ещё успеваем учиться и расти.',
    'Пауза иногда помогает увидеть решение быстрее, чем спешка.',
    'У каждого нового дня есть маленькая возможность начать заново.',
    'Даже короткий шаг вперёд важнее, чем полный отказ от движения.',
    'Смех может сделать трудный день легче, даже если всё кажется сложным.'
  ];

  const dailyImages = [
    {
      src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      alt: 'Пейзаж с заходом солнца'
    },
    {
      src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      alt: 'Красивая природа и горы'
    },
    {
      src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
      alt: 'Горы и туман'
    },
    {
      src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
      alt: 'Осенний лес'
    },
    {
      src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
      alt: 'Озеро в горах'
    }
  ];

  const dailyQuotes = [
    { text: 'Не бойся идти медленно — бойся стоять на месте.', author: 'Питайся малым шагом' },
    { text: 'Твоя цель не должна быть идеальной, она должна быть важной.', author: 'Достижение' },
    { text: 'Всякий день — хороший день для роста и новых начинаний.', author: 'Успех' },
    { text: 'Лучшая мотивация — это уверенность в себе и привычка действовать.', author: 'Терпение' },
    { text: 'Счастье приходит тем, кто умеет радоваться даже маленьким успехам.', author: 'Вдохновение' }
  ];

  const elements = {
    eventPreset: document.getElementById('eventPreset'),
    customPanel: document.getElementById('customPanel'),
    customEventName: document.getElementById('customEventName'),
    customEventDate: document.getElementById('customEventDate'),
    applyCustomBtn: document.getElementById('applyCustomBtn'),
    saveEventBtn: document.getElementById('saveEventBtn'),
    resetEventsBtn: document.getElementById('resetEventsBtn'),
    eventList: document.getElementById('eventList'),
    statusMessage: document.getElementById('statusMessage'),
    eventTitle: document.getElementById('eventTitle'),
    eventDateText: document.getElementById('eventDateText'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    factText: document.getElementById('factText'),
    dayImage: document.getElementById('dayImage'),
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor')
  };

  const themePalettes = [
    { hue: 220, glow: 'rgba(94, 130, 255, 0.32)' },
    { hue: 200, glow: 'rgba(71, 193, 255, 0.32)' },
    { hue: 260, glow: 'rgba(167, 118, 255, 0.30)' },
    { hue: 180, glow: 'rgba(84, 221, 217, 0.28)' },
    { hue: 325, glow: 'rgba(255, 125, 175, 0.24)' }
  ];

  let themeIndex = 0;
  let eventList = loadEventList();

  function bindThemeControls() {
    const swatches = document.querySelectorAll('.theme-swatch');
    const toggles = document.querySelectorAll('.mode-toggle');

    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const selectedIndex = Number(swatch.dataset.theme);
        themeIndex = selectedIndex;
        applyTheme(themePalettes[selectedIndex]);

        swatches.forEach((item) => {
          item.classList.toggle('is-active', Number(item.dataset.theme) === selectedIndex);
        });
      });
    });

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        applyThemeMode(toggle.dataset.mode);
      });
    });
  }
  let appState = loadSelectedEvent();
  let lastPointerPosition = null;
  const popLayer = document.createElement('div');
  popLayer.className = 'bubble-pop-layer';
  document.body.appendChild(popLayer);

  function init() {
    syncExpiredEvents();
    const savedMode = localStorage.getItem('holidayTimerThemeMode') || 'light';
    applyThemeMode(savedMode);
    applyTheme(themePalettes[themeIndex]);
    renderSavedState();
    renderEventList();
    renderDailyContent();
    bindEvents();
    bindThemeControls();
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  function applyThemeMode(mode) {
    const value = mode === 'dark' ? 'dark' : 'light';
    document.body.setAttribute('data-theme-mode', value);
    document.querySelectorAll('.mode-toggle').forEach((toggle) => {
      toggle.classList.toggle('is-active', toggle.dataset.mode === value);
    });
    localStorage.setItem('holidayTimerThemeMode', value);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--hue', String(theme.hue));
    root.style.setProperty('--shadow-soft', `0 30px 110px ${theme.glow}`);
    root.style.setProperty('--shadow-card', `0 20px 48px ${theme.glow}`);
  }

  function getNextDate(month, day) {
    const today = new Date();
    const candidate = new Date(today.getFullYear(), month - 1, day);

    if (candidate < today) {
      candidate.setFullYear(today.getFullYear() + 1);
    }

    return formatDateForInput(candidate);
  }

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function normalizeEvent(event) {
    if (!event || !event.name || !event.date) {
      return null;
    }

    return {
      id: event.id || slugify(event.name),
      mode: event.mode || 'custom',
      name: String(event.name),
      date: String(event.date)
    };
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'event';
  }

  function createDefaultEvents() {
    return [
      { id: 'birthday', mode: 'birthday', name: 'День рождения', date: '2027-05-03' },
      { id: 'new-year', mode: 'new-year', name: 'Новый год', date: getNextDate(1, 1) },
      { id: 'vacation', mode: 'vacation', name: 'Каникулы', date: getNextDate(6, 15) }
    ];
  }

  function loadEventList() {
    try {
      const raw = localStorage.getItem(EVENTS_KEY);
      if (!raw) {
        const defaults = createDefaultEvents();
        localStorage.setItem(EVENTS_KEY, JSON.stringify(defaults));
        return defaults;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaults = createDefaultEvents();
        localStorage.setItem(EVENTS_KEY, JSON.stringify(defaults));
        return defaults;
      }

      return parsed
        .map(normalizeEvent)
        .filter(Boolean)
        .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index);
    } catch (error) {
      return createDefaultEvents();
    }
  }

  function loadSelectedEvent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return eventList[0] || createDefaultEvents()[0];
      }

      const parsed = JSON.parse(raw);
      const legacyName = parsed && parsed.eventName;
      const legacyDate = parsed && parsed.eventDate;
      const candidate = parsed && (parsed.name || legacyName)
        ? {
            id: parsed.id || parsed.mode || slugify(parsed.name || legacyName),
            mode: parsed.mode || (legacyName === 'День рождения' ? 'birthday' : 'custom'),
            name: parsed.name || legacyName,
            date: parsed.date || legacyDate
          }
        : null;

      if (!candidate || !candidate.name || !candidate.date) {
        return eventList[0] || createDefaultEvents()[0];
      }

      if (candidate.mode === 'birthday') {
        candidate.name = 'День рождения';
        candidate.date = '2027-05-03';
      }

      return candidate;
    } catch (error) {
      return eventList[0] || createDefaultEvents()[0];
    }
  }

  function saveSelectedEvent(event) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
  }

  function saveEventList() {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(eventList));
  }

  function renderSavedState() {
    const mode = appState.mode || 'new-year';
    elements.eventPreset.value = mode;
    elements.customPanel.classList.toggle('hidden', mode !== 'custom');

    if (mode === 'custom') {
      elements.customEventName.value = appState.name || '';
      elements.customEventDate.value = appState.date || '';
    }

    renderSelectedEvent();
  }

  function triggerBubblePop(target, pointerPosition = null) {
    if (!target || !popLayer) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const x = pointerPosition && typeof pointerPosition.x === 'number'
      ? pointerPosition.x
      : rect.left + rect.width / 2;
    const y = pointerPosition && typeof pointerPosition.y === 'number'
      ? pointerPosition.y
      : rect.top + rect.height / 2;
    const bubbleCount = 16;

    for (let index = 0; index < bubbleCount; index += 1) {
      const bubble = document.createElement('span');
      const angle = (Math.PI * 2 * index) / bubbleCount;
      const distance = 18 + Math.random() * 62;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      bubble.className = 'bubble-pop';
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.setProperty('--dx', `${dx}px`);
      bubble.style.setProperty('--dy', `${dy}px`);
      bubble.style.setProperty('--size', `${6 + Math.random() * 12}px`);
      bubble.style.animationDelay = `${Math.random() * 70}ms`;
      bubble.style.opacity = '0';

      popLayer.appendChild(bubble);
      setTimeout(() => bubble.remove(), 820);
    }
  }

  function bindEvents() {
    elements.eventPreset.addEventListener('pointerdown', (event) => {
      lastPointerPosition = { x: event.clientX, y: event.clientY };
    });

    elements.eventPreset.addEventListener('change', (event) => {
      const nextMode = event.target.value;

      if (nextMode === 'custom') {
        elements.customPanel.classList.remove('hidden');
        triggerBubblePop(event.target, lastPointerPosition);
        return;
      }

      const preset = presetTemplates[nextMode];
      const selectedEvent = {
        id: nextMode,
        mode: nextMode,
        name: preset.name,
        date: nextMode === 'birthday' ? '2027-05-03' : preset.date
      };

      appState = selectedEvent;
      addEventToList(selectedEvent);
      saveSelectedEvent(appState);
      elements.customPanel.classList.add('hidden');
      renderSelectedEvent();
      renderEventList();
      updateCountdown();
      triggerBubblePop(event.target, lastPointerPosition);
    });

    elements.applyCustomBtn.addEventListener('click', (event) => {
      const customName = elements.customEventName.value.trim();
      const customDate = elements.customEventDate.value;

      if (!customName || !customDate) {
        showStatus('Введите название и дату своего события.', true);
        return;
      }

      const customEvent = {
        id: `custom-${Date.now()}`,
        mode: 'custom',
        name: customName,
        date: customDate
      };

      appState = customEvent;
      addEventToList(customEvent);
      saveSelectedEvent(appState);
      elements.eventPreset.value = 'custom';
      elements.customPanel.classList.remove('hidden');
      renderSelectedEvent();
      renderEventList();
      updateCountdown();
      triggerBubblePop(elements.applyCustomBtn, { x: event.clientX, y: event.clientY });
      showStatus('Новое событие успешно сохранено.', false);
    });

    elements.saveEventBtn.addEventListener('click', () => {
      const currentEvent = {
        id: appState.id || slugify(appState.name || 'event'),
        mode: appState.mode || 'custom',
        name: appState.name,
        date: appState.date
      };

      if (!currentEvent.name || !currentEvent.date) {
        showStatus('Сначала выберите или создайте событие.', true);
        return;
      }

      addEventToList(currentEvent);
      renderEventList();
      showStatus('Событие добавлено в список.', false);
    });

    elements.resetEventsBtn.addEventListener('click', () => {
      if (!confirm('Сбросить список событий до стандартных?')) {
        return;
      }

      const defaults = createDefaultEvents();
      eventList = defaults;
      appState = defaults[0];
      saveSelectedEvent(appState);
      saveEventList();
      renderSavedState();
      renderEventList();
      updateCountdown();
      showStatus('Список событий сброшен.', false);
    });
  }

  function addEventToList(event) {
    const normalized = normalizeEvent(event);
    if (!normalized) {
      return;
    }

    const existingIndex = eventList.findIndex((item) => item.id === normalized.id);
    if (existingIndex >= 0) {
      eventList[existingIndex] = normalized;
    } else {
      eventList.unshift(normalized);
    }

    saveEventList();
  }

  function removeEventById(id) {
    if (!id) {
      return;
    }

    const filtered = eventList.filter((item) => item.id !== id);
    eventList = filtered.length ? filtered : createDefaultEvents();

    if (appState.id === id) {
      appState = eventList[0];
      saveSelectedEvent(appState);
    }

    saveEventList();
    renderSavedState();
    renderEventList();
    updateCountdown();
  }

  function renderEventList() {
    elements.eventList.innerHTML = '';

    if (!eventList.length) {
      elements.eventList.textContent = 'События ещё не добавлены.';
      return;
    }

    eventList.forEach((event) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'event-item' + (appState.id === event.id ? ' active' : '');

      const title = document.createElement('span');
      title.className = 'event-title';
      title.textContent = event.name;

      const dateLabel = document.createElement('span');
      dateLabel.className = 'event-date-mini';
      dateLabel.textContent = formatDateForView(event.date);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.setAttribute('aria-label', `Удалить событие ${event.name}`);

      removeBtn.addEventListener('click', (clickEvent) => {
        clickEvent.stopPropagation();
        removeEventById(event.id);
      });

      item.addEventListener('click', (clickEvent) => {
        appState = { ...event };
        saveSelectedEvent(appState);
        renderSavedState();
        renderEventList();
        updateCountdown();
        triggerBubblePop(item, { x: clickEvent.clientX, y: clickEvent.clientY });
      });

      item.appendChild(title);
      item.appendChild(dateLabel);
      item.appendChild(removeBtn);
      elements.eventList.appendChild(item);
    });
  }

  function renderSelectedEvent() {
    elements.eventTitle.textContent = appState.name || 'Событие';
    elements.eventDateText.textContent = `Дата события: ${formatDateForView(appState.date)}`;
  }

  function getDateNextYear(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    date.setFullYear(date.getFullYear() + 1);
    return formatDateForInput(date);
  }

  function syncExpiredEvents() {
    let changed = false;
    const now = Date.now();

    eventList = eventList.map((event) => {
      const eventTime = new Date(event.date + 'T00:00:00').getTime();
      if (eventTime <= now) {
        changed = true;
        return { ...event, date: getDateNextYear(event.date) };
      }
      return event;
    });

    if (appState && appState.date) {
      const activeTime = new Date(appState.date + 'T00:00:00').getTime();
      if (activeTime <= now) {
        appState = { ...appState, date: getDateNextYear(appState.date) };
        changed = true;
      }
    }

    if (changed) {
      saveEventList();
      saveSelectedEvent(appState);
      renderSavedState();
      renderEventList();
    }
  }

  function refreshEventToNextYear() {
    const nextYearDate = getDateNextYear(appState.date);
    appState.date = nextYearDate;
    saveSelectedEvent(appState);

    const eventIndex = eventList.findIndex((item) => item.id === appState.id);
    if (eventIndex >= 0) {
      eventList[eventIndex].date = nextYearDate;
      saveEventList();
    }

    renderSavedState();
    renderEventList();
    showStatus('Событие уже наступило! Таймер обновлён на следующий год.', true);
  }

  function showStatus(message, isError) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.toggle('error', Boolean(isError));
  }

  function formatDateForView(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  function updateCountdown() {
    syncExpiredEvents();

    const targetTime = new Date(appState.date + 'T00:00:00').getTime();
    const now = Date.now();
    const difference = targetTime - now;

    if (difference <= 0) {
      refreshEventToNextYear();
      return;
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');

    if (elements.statusMessage.classList.contains('error')) {
      showStatus('', false);
    }
  }

  function renderDailyContent() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const factIndex = hashString(todayKey) % dailyFacts.length;
    const imageIndex = hashString(`${todayKey}-image`) % dailyImages.length;
    const quoteIndex = hashString(`${todayKey}-quote`) % dailyQuotes.length;

    elements.factText.textContent = dailyFacts[factIndex];
    const image = dailyImages[imageIndex];
    elements.dayImage.src = image.src;
    elements.dayImage.alt = image.alt;

    const quote = dailyQuotes[quoteIndex];
    elements.quoteText.textContent = `“${quote.text}”`;
    elements.quoteAuthor.textContent = `— ${quote.author}`;
  }

  function hashString(value) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }

    return hash;
  }

  init();
})();
