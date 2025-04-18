// cookie-consent.js

(function() {
    'use strict';
  
    // — Helpers per set/get cookie —
    function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = 
        `${name}=${encodeURIComponent(value)}` +
        `;path=/;expires=${d.toUTCString()};Secure;SameSite=Lax`;
    }
  
    function getCookie(name) {
      const match = document.cookie.match(
        new RegExp('(^|; )' + name + '=([^;]+)')
      );
      return match ? decodeURIComponent(match[2]) : null;
    }
  
    // — Riferimenti agli elementi del DOM —
    const banner      = document.getElementById('cookie-banner');
    const modal       = document.getElementById('cookie-modal');
    const btnAccept   = document.getElementById('accept-all');
    const btnDecline  = document.getElementById('decline-all');
    const btnSettings = document.getElementById('cookie-settings');
    const btnSave     = document.getElementById('save-settings');
    const btnClose    = document.getElementById('close-modal');
    const chkPref     = document.getElementById('toggle-preferences');
    const chkStat     = document.getElementById('toggle-statistics');
    const chkMark     = document.getElementById('toggle-marketing');
    const footerLinks = document.querySelectorAll('.cookie-settings-link');
  
    // — Focus trap nella modal —
    let focusableEls, firstFocusable, lastFocusable;
    const focusableSelectors = 
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
    function updateFocusable() {
      focusableEls    = modal.querySelectorAll(focusableSelectors);
      firstFocusable  = focusableEls[0];
      lastFocusable   = focusableEls[focusableEls.length - 1];
    }
  
    function trapFocus(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    }
  
    function openModal() {
      // Ricarico le checkbox dal cookie, se esiste
      const saved = getCookie('cookie_consent');
      if (saved) {
        const consent = JSON.parse(saved);
        chkPref.checked = consent.preferences;
        chkStat.checked = consent.statistics;
        chkMark.checked = consent.marketing;
      }
      updateFocusable();
      modal.style.display = 'block';
      firstFocusable.focus();
      document.addEventListener('keydown', trapFocus);
    }
  
    function closeModal() {
      modal.style.display = 'none';
      document.removeEventListener('keydown', trapFocus);
      btnSettings.focus();
    }
  
    // — Caricamento script esterni SOLO dopo consenso —
    function loadAnalytics() {
      const s = document.createElement('script');
      s.src   = 'https://www.googletagmanager.com/gtag/js?id=G-R83ENCYEQN';
      s.async = true;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-R83ENCYEQN', { anonymize_ip: true });
    }
  
    function loadMarketing() {
      // Inserisci qui eventuale codice per Facebook Pixel, Google Ads, ecc.
    }
  
    // — Applica le preferenze e salva il cookie —
    function applyConsent(consent) {
      setCookie('cookie_consent', JSON.stringify(consent), 365);
      // Aggiorno le checkbox
      chkPref.checked = consent.preferences;
      chkStat.checked = consent.statistics;
      chkMark.checked = consent.marketing;
      // Nascondo banner e modal
      banner.style.display = 'none';
      closeModal();
      // (Opzionale) log al server
      fetch('/api/log-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          consent
        })
      });
      // Carico solo gli script consentiti
      if (consent.statistics) loadAnalytics();
      if (consent.marketing)   loadMarketing();
    }
  
    // — Inizializzazione al caricamento pagina —
    function initConsent() {
      const saved = getCookie('cookie_consent');
      if (saved) {
        const consent = JSON.parse(saved);
        chkPref.checked = consent.preferences;
        chkStat.checked = consent.statistics;
        chkMark.checked = consent.marketing;
        banner.style.display = 'none';
        if (consent.statistics) loadAnalytics();
        if (consent.marketing)   loadMarketing();
      }
    }
  
    // — Event listeners —
    btnAccept.addEventListener('click', () => applyConsent({
      preferences: true, statistics: true, marketing: true
    }));
    btnDecline.addEventListener('click', () => applyConsent({
      preferences: false, statistics: false, marketing: false
    }));
    btnSettings.addEventListener('click', openModal);
    btnSave.addEventListener('click', () => applyConsent({
      preferences: chkPref.checked,
      statistics: chkStat.checked,
      marketing:   chkMark.checked
    }));
    btnClose.addEventListener('click', closeModal);
    footerLinks.forEach(el =>
      el.addEventListener('click', e => {
        e.preventDefault();
        openModal();
      })
    );
  
    // — Avvio —
    document.addEventListener('DOMContentLoaded', initConsent);
  
  })();
  