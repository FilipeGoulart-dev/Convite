(() => {
  const config = window.CONVITE_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.getElementById('letter-intro');
  const openLetter = document.getElementById('open-letter');
  const page = document.querySelector('.page-shell');
  const music = document.getElementById('background-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  // Esta página fica em versao-animada/, então o MP3 da raiz é resolvido a partir de ../
  const musicSrc = new URL(config.musica || 'musica%20de%20fundo.mp3', new URL('../', window.location.href)).href;
  let opening = false;
  music.volume = 0.35;

  function setMusicLabel(text, label, pressed) {
    musicLabel.textContent = text;
    musicToggle.setAttribute('aria-label', label);
    musicToggle.setAttribute('aria-pressed', pressed);
  }

  function updateMusicButton() {
    const playing = !music.paused;
    musicToggle.classList.toggle('is-playing', playing);
    if (playing) setMusicLabel('Pausar música ♫', 'Pausar música de fundo', 'true');
    else setMusicLabel('Tocar música ♫', 'Tocar música de fundo', 'false');
  }

  function playMusic() {
    if (!music.getAttribute('src')) music.src = musicSrc;
    music.play().then(updateMusicButton).catch(() => {
      musicToggle.classList.remove('is-playing');
      setMusicLabel('Música indisponível · tentar de novo', 'Música indisponível. Tentar reproduzir novamente', 'false');
    });
  }
  music.addEventListener('play', updateMusicButton);
  music.addEventListener('pause', updateMusicButton);
  musicToggle.addEventListener('click', () => {
    if (music.paused) playMusic();
    else music.pause();
  });

  // Corações ao fundo (decorativos, ocultos com movimento reduzido).
  function createHearts(count) {
    const layer = document.createElement('div');
    layer.className = 'hearts';
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = i % 3 === 0 ? '✦' : '♡';
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${10 + Math.random() * 16}px`;
      heart.style.animationDuration = `${14 + Math.random() * 12}s`;
      heart.style.animationDelay = `${-Math.random() * 20}s`;
      heart.style.setProperty('--sway', `${(Math.random() - 0.5) * 160}px`);
      layer.append(heart);
    }
    document.body.prepend(layer);
  }

  // Explosão de corações quando a carta abre.
  function burst(origin) {
    if (reducedMotion.matches) return;
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('span');
      el.className = 'burst';
      el.textContent = i % 4 === 0 ? '✦' : '♡';
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      document.body.append(el);
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 150;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 40;
      // Browsers without the Web Animations API skip the burst instead of breaking the opening.
      if (typeof el.animate !== 'function') { el.remove(); continue; }
      const anim = el.animate([
        { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      anim.onfinish = () => el.remove();
    }
  }

  // Progressive enhancement: without JavaScript the invitation stays accessible.
  intro.hidden = false;
  page.hidden = true;
  document.body.classList.add('letter-closed');
  if (!reducedMotion.matches) createHearts(14);

  openLetter.addEventListener('click', () => {
    if (opening) return;
    opening = true;
    openLetter.disabled = true;
    playMusic(); // Must run directly in the user's gesture for mobile browsers.
    intro.classList.add('is-opening');
    burst(openLetter);
    const delay = reducedMotion.matches ? 0 : 1600;
    window.setTimeout(() => {
      intro.hidden = true;
      page.hidden = false;
      page.classList.add('invitation-revealed');
      document.body.classList.remove('letter-closed');
      musicToggle.hidden = false;
      document.getElementById('title').focus({ preventScroll: true });
    }, delay);
  });

  const playground = document.getElementById('playground');
  const noButton = document.getElementById('no-button');
  const yesButton = document.getElementById('yes-button');
  const responseArea = document.getElementById('response-area');
  const result = document.getElementById('result');
  const playfulMessage = document.getElementById('playful-message');
  const phrases = [
    'Tem certeza? Vai ser legal!',
    'Opa! Esse botão é meio tímido...',
    'E se a gente colecionar uma boa memória?',
    'Acho que o botão quer te dar mais uma chance!',
    'Prometo caprichar na escolha do lugar.',
    'Vai ter assunto, risada e boa companhia!',
    'O destino está dando uma ajudinha, talvez?'
  ];
  let phraseIndex = 0;
  let sending = false;

  function showPhrase(text) {
    playfulMessage.textContent = text;
    // Reinicia a animação de entrada da frase a cada troca.
    playfulMessage.classList.remove('bump');
    void playfulMessage.offsetWidth;
    playfulMessage.classList.add('bump');
  }

  function moveNoButton() {
    const area = playground.getBoundingClientRect();
    const yes = yesButton.getBoundingClientRect();
    const no = noButton.getBoundingClientRect();
    const maxX = Math.max(0, area.width - no.width);
    const maxY = Math.max(0, area.height - no.height);
    const oldX = no.left - area.left;
    const oldY = no.top - area.top;
    let best = null;
    let bestDistance = -1;

    // Keep the runaway button inside its own area and away from the yes button.
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      const overlapsYes = x < yes.right - area.left + 10 && x + no.width > yes.left - area.left - 10 &&
        y < yes.bottom - area.top + 10 && y + no.height > yes.top - area.top - 10;
      if (overlapsYes) continue;
      const distance = Math.hypot(x - oldX, y - oldY);
      if (distance > bestDistance) { best = { x, y }; bestDistance = distance; }
    }
    if (best) {
      noButton.style.left = `${best.x}px`;
      noButton.style.top = `${best.y}px`;
    }
    showPhrase(`✧ ${phrases[phraseIndex % phrases.length]}`);
    phraseIndex++;
  }

  noButton.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') moveNoButton();
  });
  noButton.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    moveNoButton();
  });
  noButton.addEventListener('click', (event) => {
    event.preventDefault();
    // Keyboard activation has no pointerdown event.
    if (event.detail === 0) moveNoButton();
  });

  // Reposition within the available space after an orientation/viewport change.
  window.addEventListener('resize', () => {
    const maxX = Math.max(0, playground.clientWidth - noButton.offsetWidth);
    const maxY = Math.max(0, playground.clientHeight - noButton.offsetHeight);
    if (noButton.style.left) noButton.style.left = `${Math.min(parseFloat(noButton.style.left), maxX)}px`;
    if (noButton.style.top) noButton.style.top = `${Math.min(parseFloat(noButton.style.top), maxY)}px`;
  });

  function showResult(title, message, allowRetry = false) {
    responseArea.hidden = true;
    result.hidden = false;
    result.replaceChildren();
    const icon = document.createElement('span');
    icon.className = 'result-icon';
    icon.textContent = '♡';
    const heading = document.createElement('h2');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = message;
    result.append(icon, heading, text);
    if (allowRetry) {
      const retry = document.createElement('button');
      retry.className = 'button button-yes retry-button';
      retry.type = 'button';
      retry.textContent = 'Tentar enviar novamente ↗';
      retry.addEventListener('click', sendResponse);
      result.append(retry);
    }
    result.focus();
  }

  async function sendResponse() {
    if (sending) return;
    const endpoint = (config.formspreeEndpoint || '').trim();
    if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+\/?$/.test(endpoint)) {
      showResult('Que bom que você aceitou!', 'Mas o aviso ainda não foi configurado. Por favor, conte sua resposta para quem enviou o convite.');
      return;
    }
    sending = true;
    result.hidden = true;
    responseArea.hidden = false;
    yesButton.disabled = true;
    yesButton.textContent = 'Enviando com carinho…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Alguém aceitou seu convite! ♡',
          resposta: 'Sim, eu aceito!',
          destinataria: config.destinataria || 'Pessoa convidada',
          remetente: config.remetente || 'Quem fez o convite',
          origem: window.location.href
        })
      });
      if (!response.ok) throw new Error('Falha no envio');
      showResult('Você disse sim! ♡', 'Que alegria! Sua resposta foi enviada. Agora é só esperar pelos próximos detalhes.');
    } catch (error) {
      showResult('Que bom que você aceitou!', 'Não foi possível enviar sua resposta agora. Tente novamente ou conte para quem enviou o convite.', true);
    } finally {
      sending = false;
      yesButton.disabled = false;
      yesButton.innerHTML = 'Sim, eu aceito! <span aria-hidden="true">↗</span>';
    }
  }

  yesButton.addEventListener('click', sendResponse);
})();
