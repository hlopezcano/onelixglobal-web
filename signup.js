/* Envío de «Sé el primero en saberlo» sin salir de la página.
   Brevo responde en JSON ({"success":true,...}) y el navegador lo mostraba en crudo
   sobre una pantalla negra. Aquí se envía por AJAX y se muestra el mensaje de la web.
   Si algo falla (navegador antiguo, sin JS), se deja el envío normal del formulario. */
(function () {
  var form = document.querySelector('form.signup-form');
  if (!form) return;
  var ok = document.querySelector('.signup-ok');

  form.addEventListener('submit', function (ev) {
    var soporta = window.fetch && window.FormData;
    if (!ok || !soporta) return;          // plan B: envío normal del formulario
    ev.preventDefault();

    fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' })
      .then(function () {
        form.hidden = true;
        ok.hidden = false;
        if (ok.focus) ok.focus();
      })
      .catch(function () {
        form.submit();                    // si el envío por AJAX falla, no se pierde el alta
      });
  });
})();
