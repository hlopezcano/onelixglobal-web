(function () {
  var KEY = 'onelix_consent_v1';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function setConsent(c) {
    c.ts = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    window.onelixConsent = c;
    document.dispatchEvent(new CustomEvent('onelix-consent-updated', { detail: c }));
    hideBanner();
  }
  window.getOnelixConsent = getConsent;
  window.setOnelixConsent = setConsent;

  // Ayuda para el futuro: cargar un script de analítica/marketing SOLO si hay consentimiento
  // de esa categoría. Ejemplo cuando se active Google Analytics:
  //   window.onelixLoadIfConsent('analytics', 'https://www.googletagmanager.com/gtag/js?id=XXXX');
  window.onelixLoadIfConsent = function (category, src, attrs) {
    var c = getConsent();
    if (c && c[category]) {
      var s = document.createElement('script');
      s.src = src;
      if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      document.head.appendChild(s);
    }
  };

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.classList.remove('show');
    var m = document.getElementById('cookie-modal');
    if (m) m.classList.remove('show');
  }
  function openModal() {
    var m = document.getElementById('cookie-modal');
    if (m) m.classList.add('show');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var existing = getConsent();
    if (existing) { window.onelixConsent = existing; }
    else {
      var b = document.getElementById('cookie-banner');
      if (b) b.classList.add('show');
    }

    var btnAccept = document.getElementById('cookie-accept-all');
    var btnReject = document.getElementById('cookie-reject-all');
    var btnRejectModal = document.getElementById('cookie-reject-all-modal');
    var btnCustomize = document.getElementById('cookie-customize');
    var btnSavePrefs = document.getElementById('cookie-save-prefs');
    var reopenLink = document.getElementById('cookie-reopen');

    if (btnAccept) btnAccept.addEventListener('click', function () { setConsent({ necessary: true, analytics: true, marketing: true }); });
    if (btnReject) btnReject.addEventListener('click', function () { setConsent({ necessary: true, analytics: false, marketing: false }); });
    if (btnRejectModal) btnRejectModal.addEventListener('click', function () { setConsent({ necessary: true, analytics: false, marketing: false }); });
    if (btnCustomize) btnCustomize.addEventListener('click', openModal);
    if (btnSavePrefs) btnSavePrefs.addEventListener('click', function () {
      var an = document.getElementById('cookie-toggle-analytics');
      var mk = document.getElementById('cookie-toggle-marketing');
      setConsent({ necessary: true, analytics: !!(an && an.checked), marketing: !!(mk && mk.checked) });
    });
    if (reopenLink) reopenLink.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
})();
