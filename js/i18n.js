/* ============================================================
   IDIOMA — português (Brasil) ou inglês.

   · Quem está no Brasil vê pt-BR; o resto do mundo vê inglês. "Estar no
     Brasil" é medido pelo fuso horário do aparelho (sem pedir localização
     e sem chamar serviço externo). Sem fuso, vale o idioma do navegador.
   · O botão ao lado de "inverter" troca na hora, sem recarregar, e a
     escolha fica guardada (localStorage 'pf-lang').
   · O conteúdo em inglês fica em js/data.js (window.PF_EN). Aqui ficam só
     os rótulos fixos da interface (botões, aria-labels...).

   Precisa carregar depois de data.js e antes de main.js.
   ============================================================ */
(function () {
  'use strict';

  var PF = window.PF || {};
  var EN = window.PF_EN || {};

  /* ---- rótulos da interface ---- */
  var UI = {
    pt: {
      loading: 'Carregando',
      invert: 'inverter',
      pspLabel: 'PSP mostrando o projeto selecionado',
      infoLabel: 'Sobre o projeto na tela',
      how: 'como fiz',
      why: 'pra quê',
      keysLabel: 'Navegar pelos projetos',
      prev: 'Projeto anterior',
      next: 'Próximo projeto',
      open: 'Abrir este projeto',
      noLink: 'Sem link público',
      cue: 'Ir para o sobre',
      gallery: 'Desenhos',
      moreLinks: 'Onde ver mais',
      copy: 'copiar',
      copied: 'copiado ✓',
      hubs: 'Onde me encontrar',
      by: 'por',
      lbLabel: 'Desenho em tela cheia',
      lbLink: 'ver no artstation',
      lbPrev: 'Desenho anterior',
      lbNext: 'Próximo desenho',
      lbClose: 'Fechar',
      tileView: 'Ver em tela cheia: ',
      drawing: 'desenho',
      description: 'Portfolio de projetos de código.',
      switchTo: 'Mudar o idioma para inglês'
    },
    en: {
      loading: 'Loading',
      invert: 'invert',
      pspLabel: 'PSP showing the selected project',
      infoLabel: 'About the project on screen',
      how: 'how i made it',
      why: 'what for',
      keysLabel: 'Browse projects',
      prev: 'Previous project',
      next: 'Next project',
      open: 'Open this project',
      noLink: 'No public link',
      cue: 'Go to about',
      gallery: 'Drawings',
      moreLinks: 'Where to see more',
      copy: 'copy',
      copied: 'copied ✓',
      hubs: 'Where to find me',
      by: 'by',
      lbLabel: 'Full-screen drawing',
      lbLink: 'view on artstation',
      lbPrev: 'Previous drawing',
      lbNext: 'Next drawing',
      lbClose: 'Close',
      tileView: 'View full screen: ',
      drawing: 'drawing',
      description: 'Portfolio of code projects.',
      switchTo: 'Switch language to Brazilian Portuguese'
    }
  };

  /* ---- bandeiras em preto e branco (cor = currentColor) ----
     O botão mostra o idioma para o qual ele troca. */
  var FLAG = {
    // EUA: listras alternadas e o cantão cheio com as "estrelas" vazadas
    us: '<svg class="flag" viewBox="0 0 26 14" aria-hidden="true">' +
          '<path d="M0 0h26v2H0zM0 4h26v2H0zM0 8h26v2H0zM0 12h26v2H0z"/>' +
          '<path fill-rule="evenodd" d="M0 0h12v8H0z' +
            'M2 1.5h1v1H2zM5.5 1.5h1v1h-1zM9 1.5h1v1H9z' +
            'M3.75 3.5h1v1h-1zM7.25 3.5h1v1h-1z' +
            'M2 5.5h1v1H2zM5.5 5.5h1v1h-1zM9 5.5h1v1H9z"/>' +
          '<rect class="flag__o" x=".5" y=".5" width="25" height="13"/>' +
        '</svg>',
    // Brasil: losango cheio, globo vazado e a faixa atravessando
    br: '<svg class="flag" viewBox="0 0 20 14" aria-hidden="true">' +
          '<path fill-rule="evenodd" d="M10 2 18 7 10 12 2 7z' +
            'M13.2 7a3.2 3.2 0 1 0-6.4 0 3.2 3.2 0 1 0 6.4 0z"/>' +
          '<path class="flag__o" d="M7 7.9Q10 5.7 13 7.1"/>' +
          '<rect class="flag__o" x=".5" y=".5" width="19" height="13"/>' +
        '</svg>'
  };
  var SWITCH = {                    // o que o botão mostra em cada idioma
    pt: { flag: FLAG.us, label: 'english' },
    en: { flag: FLAG.br, label: 'pt-br' }
  };

  /* ---- Brasil ou não ---- */
  var BR_TZ = [
    'America/Sao_Paulo', 'America/Araguaina', 'America/Bahia', 'America/Belem',
    'America/Boa_Vista', 'America/Campo_Grande', 'America/Cuiaba', 'America/Eirunepe',
    'America/Fortaleza', 'America/Maceio', 'America/Manaus', 'America/Noronha',
    'America/Porto_Velho', 'America/Recife', 'America/Rio_Branco', 'America/Santarem',
    'America/Porto_Acre', 'Brazil/Acre', 'Brazil/DeNoronha', 'Brazil/East', 'Brazil/West'
  ];
  function inBrazil() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return BR_TZ.indexOf(tz) >= 0;
    } catch (e) { /* sem Intl: cai no idioma do navegador */ }
    return /^pt-br/i.test(navigator.language || '');
  }

  /* ---- troca de conteúdo ----
     Os textos são trocados dentro dos mesmos objetos de PF (sem criar novos),
     porque main.js, gallery.js e psp.js guardam referências a eles. */
  function isObj(v) { return v && typeof v === 'object'; }
  function pick(src, shape) {       // cópia de src só nas chaves que existem em shape
    var out = Array.isArray(shape) ? [] : {};
    Object.keys(shape).forEach(function (k) {
      if (!(k in src)) return;
      out[k] = isObj(shape[k]) && isObj(src[k]) ? pick(src[k], shape[k]) : src[k];
    });
    return out;
  }
  function apply(dst, src) {
    Object.keys(src).forEach(function (k) {
      if (isObj(src[k]) && isObj(dst[k])) apply(dst[k], src[k]);
      else dst[k] = src[k];
    });
  }
  var PT = pick(PF, EN);            // o português original, antes de qualquer troca

  var lang = 'pt';
  function t(key) { return (UI[lang] || UI.pt)[key] || UI.pt[key] || ''; }

  function paintStatic() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = t('description');
    [].forEach.call(document.querySelectorAll('[data-t]'), function (el) {
      el.textContent = t(el.getAttribute('data-t'));
    });
    [].forEach.call(document.querySelectorAll('[data-t-aria]'), function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-t-aria')));
    });
    var btn = document.getElementById('langToggle');
    if (btn) {
      var s = SWITCH[lang];
      btn.innerHTML = s.flag + '<span>' + s.label + '</span>';
      btn.setAttribute('aria-label', t('switchTo'));
      btn.setAttribute('lang', lang === 'en' ? 'pt-BR' : 'en');
    }
  }

  function set(next, save) {
    lang = next === 'en' ? 'en' : 'pt';
    apply(PF, lang === 'en' ? EN : PT);
    I18N.lang = lang;
    if (save) { try { localStorage.setItem('pf-lang', lang); } catch (e) { /* sem storage, sem problema */ } }
    paintStatic();
  }

  var I18N = window.PF_I18N = { lang: lang, t: t, set: set };

  var saved = null;
  try { saved = localStorage.getItem('pf-lang'); } catch (e) { /* idem */ }
  set(saved === 'en' || saved === 'pt' ? saved : (inBrazil() ? 'pt' : 'en'), false);

  var btn = document.getElementById('langToggle');
  if (btn) btn.addEventListener('click', function () {
    set(lang === 'en' ? 'pt' : 'en', true);
    document.dispatchEvent(new CustomEvent('pf:lang', { detail: { lang: lang } }));
  });
})();
