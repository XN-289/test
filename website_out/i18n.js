/**
 * ViaSurg i18n Engine
 * Client-side language switching for all pages.
 * Usage: add data-i18n="key" to any LEAF element, define translations in window.I18N_DATA.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'viasurg_lang';
  var SUPPORTED = ['en', 'zh'];

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = navigator.language || navigator.userLanguage || '';
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    var dict = (window.I18N_DATA && window.I18N_DATA[lang]) || {};
    if (!Object.keys(dict).length) return;
    document.documentElement.lang = lang;

    // Translate all elements with data-i18n
    // Only update LEAF elements (those without data-i18n children)
    var all = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      // Skip if this element contains other data-i18n children (it's a container, not a leaf)
      if (el.querySelector('[data-i18n]')) continue;
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    }

    // Translate elements with data-i18n-attr (for title, alt, aria-label, etc.)
    var attrEls = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrEls.length; j++) {
      var el2 = attrEls[j];
      var spec = el2.getAttribute('data-i18n-attr');
      var pairs = spec.split(',');
      for (var k = 0; k < pairs.length; k++) {
        var parts = pairs[k].split(':');
        if (parts.length === 2) {
          var attr = parts[0].trim();
          var key2 = parts[1].trim();
          if (dict[key2] !== undefined) {
            el2.setAttribute(attr, dict[key2]);
          }
        }
      }
    }

    // Update page title
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      var titleKey = titleEl.getAttribute('data-i18n');
      if (dict[titleKey]) {
        document.title = dict[titleKey];
      }
    }

    // Update toggle button text
    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.textContent = lang === 'en' ? '中文' : 'EN';
      toggle.setAttribute('data-current-lang', lang);
    }

    // Update body class for font switching
    if (lang === 'zh') {
      document.body.classList.add('lang-zh');
      document.body.classList.remove('lang-en');
    } else {
      document.body.classList.add('lang-en');
      document.body.classList.remove('lang-zh');
    }
  }

  function toggleLang() {
    var current = getLang();
    var next = current === 'en' ? 'zh' : 'en';
    setLang(next);
  }

  // Expose globally
  window.i18n = {
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    applyLang: applyLang
  };

  // Auto-apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang(getLang());
    });
  } else {
    applyLang(getLang());
  }
})();
