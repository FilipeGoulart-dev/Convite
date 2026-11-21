(() => {
  const config = window.CONVITE_CONFIG || {};
  const playground = document.getElementById('playground');
  const noButton = document.getElementById('no-button');
  const yesButton = document.getElementById('yes-button');
  const declineButton = document.getElementById('decline-button');
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
    playfulMessage.textContent = `✧ ${phrases[phraseIndex % phrases.length]}`;
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
  declineButton.addEventListener('click', () => {
    showResult('Tudo bem, de verdade.', 'Que bom que você passou por aqui. Sem pressão e com carinho.');
  });
})();
