/* ========== VOICE AGENT - Tapicascos Barranquilla ========== */
/* Agente de voz con Web Speech API (STT) + VibeVoice via Gradio API (TTS) */

(function () {
  'use strict';

  // ========== CONFIG ==========
  const TAPICASCOS_CONTEXT = {
    nombre: 'Tapicascos Barranquilla',
    slogan: 'Destaca en la carretera con nuestra tapicería única y duradera',
    direccion: 'Calle 44 #21b 15, Barranquilla 080003',
    whatsapp: 'https://wa.link/kvw8rr',
    horarios: 'Lunes a Sábado: 8:00 AM - 6:00 PM. Domingos cerrado.',
    productos: [
      { nombre: 'Casco Sport T10', precio: '$75.000 COP', nota: 'Trae tu casco viejo para descuento' },
      { nombre: 'Casco Sport KRM 707', precio: '$110.000 COP', nota: 'Gama alta, el más popular' },
      { nombre: 'Accesorios', precio: 'Variados', nota: 'Visores, forros, repuestos' }
    ],
    servicios: [
      'Tapizado de cascos con materiales premium',
      'Programa de intercambio: trae tu casco viejo',
      'Venta de cascos nuevos desde $75.000',
      'Accesorios y repuestos'
    ],
    redes: {
      instagram: '@tapicascosbq',
      tiktok: '@tapicascosbq',
      facebook: 'Tapizados Barranquilla'
    }
  };

  // ========== VIBEVOICE TTS CONFIG ==========
  // HuggingFace Gradio Space for VibeVoice TTS
  const VIBEVOICE_SPACE = 'https://anycoderapps-vibevoice-realtime-0-5b.hf.space';
  let useVibeVoice = true; // Try VibeVoice first, fallback to browser TTS

  // ========== ELEMENTS ==========
  const voiceToggle = document.getElementById('voice-toggle');
  const voicePanel = document.getElementById('voice-panel');
  const voiceMessages = document.getElementById('voice-messages');
  const voiceInput = document.getElementById('voice-input');
  const voiceMicBtn = document.getElementById('voice-mic-btn');
  const voiceSendBtn = document.getElementById('voice-send-btn');
  const voiceStatus = document.getElementById('voice-status');
  const iconDefault = voiceToggle.querySelector('.voice-icon-default');
  const iconClose = voiceToggle.querySelector('.voice-icon-close');

  let isOpen = false;
  let isListening = false;
  let recognition = null;

  // ========== TOGGLE PANEL ==========
  voiceToggle.addEventListener('click', () => {
    isOpen = !isOpen;
    voicePanel.classList.toggle('hidden', !isOpen);
    iconDefault.classList.toggle('hidden', isOpen);
    iconClose.classList.toggle('hidden', !isOpen);

    if (isOpen) {
      voiceInput.focus();
    } else if (isListening) {
      stopListening();
    }
  });

  // ========== SEND MESSAGE ==========
  voiceSendBtn.addEventListener('click', sendTextMessage);
  voiceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendTextMessage();
  });

  function sendTextMessage() {
    const text = voiceInput.value.trim();
    if (!text) return;
    voiceInput.value = '';
    addMessage(text, 'user');
    processQuery(text);
  }

  // ========== MICROPHONE (Web Speech API STT) ==========
  voiceMicBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addMessage('Tu navegador no soporta reconocimiento de voz. Intenta con Chrome.', 'agent');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      voiceMicBtn.classList.add('voice-listening');
      voiceStatus.textContent = 'Escuchando...';
      voiceMicBtn.innerHTML = '<div class="voice-wave"><span></span><span></span><span></span><span></span></div>';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage(transcript, 'user');
      processQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        addMessage('Necesito permiso para usar el micrófono. Habilítalo en tu navegador.', 'agent');
      }
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.start();
  }

  function stopListening() {
    isListening = false;
    voiceMicBtn.classList.remove('voice-listening');
    voiceStatus.textContent = 'Listo para ayudarte';
    voiceMicBtn.innerHTML = '';
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'mic');
    icon.className = 'w-5 h-5 text-coral';
    voiceMicBtn.appendChild(icon);
    lucide.createIcons();

    if (recognition) {
      recognition.abort();
      recognition = null;
    }
  }

  // ========== PROCESS QUERY (AI Brain) ==========
  function processQuery(query) {
    showTyping();
    voiceStatus.textContent = 'Procesando...';

    // Simulate processing delay for natural feel
    setTimeout(() => {
      const response = generateResponse(query);
      removeTyping();
      addMessage(response, 'agent');
      voiceStatus.textContent = 'Listo para ayudarte';

      // TTS: Speak the response
      speakResponse(response);
    }, 800 + Math.random() * 700);
  }

  // ========== RESPONSE GENERATION (Local Knowledge Base) ==========
  function generateResponse(query) {
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Greetings
    if (/^(hola|hey|buenas|buenos|saludos|que tal|ey|alo)/i.test(q)) {
      return '¡Hola! Bienvenido a Tapicascos Barranquilla. ¿Te interesa conocer nuestros cascos, servicios de tapizado o quieres cotizar algo? Estoy aquí para ayudarte.';
    }

    // Prices
    if (q.includes('precio') || q.includes('cuanto') || q.includes('cuesta') || q.includes('valor') || q.includes('costo')) {
      return 'Nuestros precios son:\n• Casco Sport T10: $75.000 COP\n• Casco Sport KRM 707: $110.000 COP (el más popular)\n• Accesorios: precios variados\n\nRecuerda que si traes tu casco viejo, obtienes un descuento. ¿Quieres cotizar por WhatsApp?';
    }

    // Products / Catalog
    if (q.includes('producto') || q.includes('catalogo') || q.includes('casco') || q.includes('modelo') || q.includes('que venden') || q.includes('que tienen')) {
      return 'Tenemos cascos Sport con diseño deportivo y tapicería premium:\n\n• Casco Sport T10 por $75.000 — ideal para uso diario\n• Casco Sport KRM 707 por $110.000 — gama alta, nuestro más popular\n• Accesorios: visores, forros y repuestos\n\n¿Quieres más detalles de alguno?';
    }

    // Exchange program
    if (q.includes('intercambio') || q.includes('viejo') || q.includes('cambio') || q.includes('cambiar') || q.includes('usado')) {
      return '¡Sí! Tenemos programa de intercambio. Trae tu casco viejo o maltratado y te damos un descuento en la compra de uno nuevo. Es una forma genial de renovarte sin gastar de más. Escríbenos por WhatsApp para coordinar.';
    }

    // Tapizado
    if (q.includes('tapiz') || q.includes('tapiceria') || q.includes('forrar') || q.includes('renovar')) {
      return 'Nuestro servicio estrella es el tapizado de cascos. Usamos materiales de primera calidad para darle nueva vida a tu casco con diseños únicos y duraderos. El resultado es como tener un casco nuevo. ¿Te gustaría cotizar tu tapizado?';
    }

    // Location
    if (q.includes('donde') || q.includes('ubicacion') || q.includes('direccion') || q.includes('llegar') || q.includes('mapa')) {
      return 'Estamos en la Calle 44 #21b 15, Barranquilla 080003. Puedes ver nuestra ubicación en la sección de mapa aquí abajo en la página. Te esperamos de lunes a sábado de 8AM a 6PM.';
    }

    // Hours
    if (q.includes('horario') || q.includes('hora') || q.includes('abren') || q.includes('cierran') || q.includes('atencion')) {
      return 'Nuestro horario es de lunes a sábado de 8:00 AM a 6:00 PM. Los domingos estamos cerrados. ¡Te esperamos!';
    }

    // WhatsApp / Contact
    if (q.includes('whatsapp') || q.includes('contacto') || q.includes('numero') || q.includes('telefono') || q.includes('escribir') || q.includes('llamar')) {
      return 'Puedes escribirnos directamente por WhatsApp haciendo clic en el botón verde que está abajo a la izquierda, o en cualquier botón de "Escríbenos" en la página. ¡Te respondemos rápido!';
    }

    // Social media
    if (q.includes('instagram') || q.includes('red') || q.includes('tiktok') || q.includes('facebook') || q.includes('seguir')) {
      return 'Síguenos en nuestras redes:\n• Instagram: @tapicascosbq\n• TikTok: @tapicascosbq\n• Facebook: Tapizados Barranquilla\n\nAhí publicamos videos de nuestros trabajos y promociones.';
    }

    // Promo / Discount
    if (q.includes('promo') || q.includes('descuento') || q.includes('oferta') || q.includes('rebaja')) {
      return 'Actualmente tenemos promoción en cascos Sport. Además, si traes tu casco viejo obtienes un descuento especial. Escríbenos por WhatsApp para conocer las ofertas vigentes.';
    }

    // Thanks
    if (q.includes('gracias') || q.includes('genial') || q.includes('perfecto') || q.includes('chevere') || q.includes('bacano')) {
      return '¡Con mucho gusto! Si necesitas algo más, aquí estoy. También puedes escribirnos por WhatsApp para una atención más personalizada. ¡Que tengas un excelente día!';
    }

    // Bye
    if (q.includes('adios') || q.includes('chao') || q.includes('bye') || q.includes('hasta luego')) {
      return '¡Hasta luego! Fue un placer ayudarte. Recuerda que puedes escribirnos por WhatsApp en cualquier momento. ¡Que te vaya bien!';
    }

    // Default / Fallback
    return 'Gracias por tu pregunta. Para darte la mejor atención, te recomiendo escribirnos por WhatsApp donde nuestro equipo puede ayudarte con más detalle. ¿Hay algo más que quieras saber sobre nuestros cascos, tapizados o accesorios?';
  }

  // ========== TTS: VibeVoice via Gradio + Fallback Browser TTS ==========
  async function speakResponse(text) {
    // Clean text for speech
    const cleanText = text.replace(/[•\n]/g, '. ').replace(/\s+/g, ' ').trim();

    if (useVibeVoice) {
      try {
        voiceStatus.textContent = 'Generando voz...';
        await speakWithVibeVoice(cleanText);
        return;
      } catch (err) {
        console.warn('VibeVoice fallback to browser TTS:', err.message);
        useVibeVoice = false; // Disable for rest of session
      }
    }

    // Fallback: Browser SpeechSynthesis
    speakWithBrowserTTS(cleanText);
  }

  async function speakWithVibeVoice(text) {
    // Call VibeVoice Gradio Space API
    const response = await fetch(VIBEVOICE_SPACE + '/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text, 'es'],
        fn_index: 0
      })
    });

    if (!response.ok) throw new Error('VibeVoice API unavailable');

    const result = await response.json();

    if (result.data && result.data[0]) {
      // The response should be an audio file URL or base64
      const audioData = result.data[0];
      let audioUrl;

      if (typeof audioData === 'string' && audioData.startsWith('data:')) {
        audioUrl = audioData;
      } else if (typeof audioData === 'object' && audioData.url) {
        audioUrl = audioData.url;
      } else if (typeof audioData === 'string') {
        audioUrl = VIBEVOICE_SPACE + '/file=' + audioData;
      } else {
        throw new Error('Unexpected audio format');
      }

      const audio = new Audio(audioUrl);
      voiceStatus.textContent = 'Hablando...';
      audio.onended = () => { voiceStatus.textContent = 'Listo para ayudarte'; };
      audio.onerror = () => {
        voiceStatus.textContent = 'Listo para ayudarte';
        speakWithBrowserTTS(text);
      };
      await audio.play();
    } else {
      throw new Error('No audio in response');
    }
  }

  function speakWithBrowserTTS(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;

    voiceStatus.textContent = 'Hablando...';
    utterance.onend = () => { voiceStatus.textContent = 'Listo para ayudarte'; };
    window.speechSynthesis.speak(utterance);
  }

  // Pre-load voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // ========== UI HELPERS ==========
  function addMessage(text, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex gap-2' + (sender === 'user' ? ' flex-row-reverse' : '');

    if (sender === 'agent') {
      const avatar = document.createElement('div');
      avatar.className = 'w-7 h-7 bg-coral/20 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5';
      avatar.innerHTML = '<span class="text-coral text-xs font-bold">TC</span>';
      wrapper.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    const bgClass = sender === 'user' ? 'bg-coral/20 rounded-xl rounded-tr-none' : 'bg-white/5 rounded-xl rounded-tl-none';
    bubble.className = `${bgClass} px-4 py-2.5 text-sm text-white/70 max-w-[85%]`;
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = text;
    wrapper.appendChild(bubble);

    voiceMessages.appendChild(wrapper);
    voiceMessages.scrollTop = voiceMessages.scrollHeight;
  }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex gap-2 typing-indicator';
    wrapper.innerHTML = `
      <div class="w-7 h-7 bg-coral/20 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
        <span class="text-coral text-xs font-bold">TC</span>
      </div>
      <div class="bg-white/5 rounded-xl rounded-tl-none px-4 py-3">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    voiceMessages.appendChild(wrapper);
    voiceMessages.scrollTop = voiceMessages.scrollHeight;
  }

  function removeTyping() {
    const typing = voiceMessages.querySelector('.typing-indicator');
    if (typing) typing.remove();
  }

})();
