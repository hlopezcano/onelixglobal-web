/* ============================================================
   Asistente virtual de OnelixGlobal — para la web de marca
   ------------------------------------------------------------
   - No usa servicios externos, ni cookies, ni guarda datos del visitante.
   - Responde solo con los textos aprobados de la tienda (misma política
     de envíos, devoluciones y pagos). Si algo se sale de ahí, deriva al
     comercial por WhatsApp, con el contexto de lo que estaba mirando.
   - Fuera del horario de atención (Lun-Vie 9:00-17:00, hora de Colombia)
     lo dice y ofrece dejar el correo.
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP = '34604802583';
  var GUMROAD = 'https://onelixglobal.gumroad.com/l/cuello-hombros-sin-tension';
  var HORARIO = { dias: [1, 2, 3, 4, 5], desde: 9, hasta: 17 }; // Lun-Vie, 9:00-17:00 Colombia

  /* ---------- ¿estamos en horario? (Colombia = UTC-5 todo el año, sin cambio horario) ---------- */
  function enHorario() {
    var ahora = new Date(Date.now() - 5 * 3600 * 1000); // hora de Colombia
    var dia = ahora.getUTCDay();   // 0 domingo … 6 sábado
    var h = ahora.getUTCHours();
    return HORARIO.dias.indexOf(dia) !== -1 && h >= HORARIO.desde && h < HORARIO.hasta;
  }

  /* ---------- respuestas (copiadas de los textos aprobados) ---------- */
  var RESPUESTAS = {
    envios: {
      texto: 'Entregamos en toda Colombia y se paga contra entrega. El plazo es de <strong>2 a 5 días hábiles</strong> según la ciudad. Antes de despachar te escribimos por WhatsApp para confirmar la dirección y que puedas recibirlo. El costo del envío aparece en el checkout antes de confirmar la compra: sin cargos ocultos.',
      botones: ['fuera', 'devoluciones', 'persona']
    },
    pago: {
      texto: 'El pago es <strong>contra entrega</strong>: pagas al mensajero cuando recibes el producto, en efectivo o por los medios que acepte la transportadora. <strong>No se paga nada por adelantado</strong> y no hace falta tarjeta. El precio que ves en la ficha es el precio final.',
      botones: ['envios', 'devoluciones', 'persona']
    },
    devoluciones: {
      texto: 'Tienes <strong>5 días hábiles</strong> desde la entrega para devolverlo sin dar explicaciones (Ley 1480 de 2011); el producto debe estar sin usar y en su empaque original. Si llega dañado o no funciona, escríbenos dentro de los 5 días siguientes con fotos o un vídeo y lo resolvemos: te lo reponemos o te devolvemos el importe.',
      botones: ['envios', 'productos', 'persona']
    },
    productos: {
      texto: 'Estamos abriendo la tienda de Colombia con el primer producto de bienestar para <strong>cuello y hombros</strong> — lo probamos nosotros antes de venderlo. Muy pronto en <a href="https://tienda.onelixglobal.com" target="_blank" rel="noopener">tienda.onelixglobal.com</a>.<br><br>La guía digital «Cuello y hombros sin tensión» ya está a la venta y se descarga al momento.',
      botones: ['aviso', 'envios', 'persona']
    },
    fuera: {
      texto: 'De momento el catálogo físico se entrega <strong>solo en Colombia</strong>. La guía digital sí puedes comprarla y descargarla desde cualquier país.',
      botones: ['productos', 'persona']
    },
    aviso: {
      texto: 'Perfecto: te llevo al formulario de la web para que dejes tu correo. Te avisamos en cuanto abramos el catálogo físico (y solo para eso).',
      accion: 'irAFormulario',
      botones: ['persona']
    },
    persona: {
      texto: 'Te paso con el comercial por WhatsApp. Le llega tu mensaje con lo que estabas consultando y te contesta lo antes posible.',
      accion: 'abrirWhatsApp',
      botones: []
    }
  };

  var ETIQUETAS = {
    envios: '🚚 Envíos y entrega',
    pago: '💵 Cómo se paga',
    devoluciones: '↩️ Devoluciones y garantía',
    productos: '📦 Productos y precios',
    fuera: '🌎 ¿Fuera de Colombia?',
    aviso: '🔔 Que me avisen',
    persona: '💬 Hablar con una persona'
  };

  var INICIO = ['envios', 'pago', 'devoluciones', 'productos', 'aviso', 'persona'];

  /* ---------- montaje ---------- */
  var historial = [];       // títulos de los temas ya consultados
  var ultimoTema = null;

  var raiz, panel, mensajes, acciones, pie;

  function crear() {
    raiz = document.createElement('div');
    raiz.className = 'asis';
    raiz.innerHTML =
      '<button type="button" class="asis-lanzador" aria-expanded="false" aria-controls="asis-panel">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
        '</svg><span>¿Te ayudo?</span></button>' +
      '<section class="asis-panel" id="asis-panel" hidden aria-label="Asistente de OnelixGlobal">' +
        '<header class="asis-cabecera">' +
          '<div><strong>Asistente OnelixGlobal</strong><span class="asis-horario"></span></div>' +
          '<button type="button" class="asis-cerrar" aria-label="Cerrar el asistente">&times;</button>' +
        '</header>' +
        '<div class="asis-mensajes" role="log" aria-live="polite"></div>' +
        '<div class="asis-acciones"></div>' +
        '<div class="asis-pie"><a class="asis-wa" href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
          'Hablar con el comercial</a></div>' +
      '</section>';
    document.body.appendChild(raiz);

    panel = raiz.querySelector('.asis-panel');
    mensajes = raiz.querySelector('.asis-mensajes');
    acciones = raiz.querySelector('.asis-acciones');
    pie = raiz.querySelector('.asis-pie');

    var horario = raiz.querySelector('.asis-horario');
    horario.textContent = enHorario() ? '🟢 En horario de atención' : '🕘 Fuera de horario (9:00-17:00, Colombia)';

    raiz.querySelector('.asis-lanzador').addEventListener('click', alternar);
    raiz.querySelector('.asis-cerrar').addEventListener('click', alternar);

    // si hay JS, el botón de WhatsApp de la web se integra en el asistente
    var flotante = document.querySelector('.wa-float');
    if (flotante) flotante.style.display = 'none';
  }

  function alternar() {
    var abierto = !panel.hidden;
    if (abierto) { panel.hidden = true; raiz.querySelector('.asis-lanzador').setAttribute('aria-expanded', 'false'); return; }
    panel.hidden = false;
    raiz.querySelector('.asis-lanzador').setAttribute('aria-expanded', 'true');
    if (!mensajes.children.length) { saludo(); }
    mensajes.scrollTop = mensajes.scrollHeight;
  }

  function burbuja(html, quien) {
    var d = document.createElement('div');
    d.className = 'asis-msg asis-' + quien;
    d.innerHTML = html;
    mensajes.appendChild(d);
    mensajes.scrollTop = mensajes.scrollHeight;
    return d;
  }

  function saludo() {
    burbuja('¡Hola! 👋 Soy el asistente de OnelixGlobal — <strong>automático</strong>, no una persona. ¿En qué te ayudo?', 'bot');
    if (!enHorario()) {
      burbuja('Ahora estamos <strong>fuera de horario</strong> (lun-vie, 9:00-17:00, hora de Colombia). Consulta lo que quieras y, si necesitas a alguien, escríbenos por WhatsApp: te contestamos al abrir.', 'bot');
    }
    pintarBotones(INICIO);
  }

  function pintarBotones(claves) {
    acciones.innerHTML = '';
    claves.forEach(function (clave) {
      var r = RESPUESTAS[clave];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'asis-boton';
      b.textContent = ETIQUETAS[clave];
      b.addEventListener('click', function () { elegir(clave); });
      acciones.appendChild(b);
    });
  }

  function elegir(clave) {
    var r = RESPUESTAS[clave];
    if (!r) return;
    burbuja(ETIQUETAS[clave], 'yo');
    var esPasoAlComercial = (clave === 'persona');
    var tema = ETIQUETAS[clave].replace(/^[^ ]+ /, '');
    if (!esPasoAlComercial) {          // «Hablar con una persona» no es un tema consultado
      historial.push(tema);
      ultimoTema = tema;
    }

    if (r.accion === 'abrirWhatsApp') return abrirWhatsApp();
    if (r.accion === 'irAFormulario') return irAFormulario();

    burbuja(r.texto, 'bot');

    if (clave === 'productos') {
      var a = document.createElement('a');
      a.className = 'asis-boton asis-boton-link';
      a.href = GUMROAD; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = '📘 Ver la guía digital (8,90 $)';
      acciones.innerHTML = '';
      acciones.appendChild(a);
    }
    var extra = r.botones || [];
    var cont = document.createElement('div');
    cont.className = 'asis-acciones-fila';
    extra.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'asis-boton';
      b.textContent = ETIQUETAS[k];
      b.addEventListener('click', function () { elegir(k); });
      cont.appendChild(b);
    });
    if (extra.length) { if (clave === 'productos') { acciones.appendChild(cont); } else { acciones.innerHTML = ''; acciones.appendChild(cont); } }
  }

  function abrirWhatsApp() {
    var texto = 'Hola, vengo del asistente de la web de OnelixGlobal.';
    if (ultimoTema) texto += ' Estaba consultando: ' + ultimoTema + '.';
    if (historial.length > 1) texto += ' (También miré: ' + historial.slice(0, -1).join(', ') + ').';
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
    burbuja('Te abro WhatsApp con el mensaje ya escrito. Si no se abre, <a href="' + url + '" target="_blank" rel="noopener">pulsa aquí</a>.', 'bot');
    window.open(url, '_blank', 'noopener');
  }

  function irAFormulario() {
    var aviso = document.getElementById('aviso');
    if (aviso) {
      aviso.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var campo = aviso.querySelector('input[type=email]');
      if (campo) setTimeout(function () { campo.focus({ preventScroll: true }); }, 700);
    }
    burbuja('Te he llevado al formulario: escribe tu correo ahí y listo.', 'bot');
    pintarBotones(['persona', 'envios']);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crear);
  else crear();
})();
