(function () {
    var LANG_KEY = 'lang';
    function getLang() { return localStorage.getItem(LANG_KEY) || 'zh'; }

    function applyLang(lang) {
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-TW';
        document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
            el.textContent = lang === 'en' ? el.dataset.en : el.dataset.zh;
        });
        var btn = document.getElementById('langToggle');
        if (btn) btn.textContent = lang === 'en' ? '中' : 'EN';
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }

    window.__applyLang = applyLang;

    function init() {
        applyLang(getLang());
        var btn = document.getElementById('langToggle');
        if (btn) {
            btn.onclick = function () {
                applyLang(getLang() === 'en' ? 'zh' : 'en');
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
