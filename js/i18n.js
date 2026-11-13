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
      invert: 'Inverter cores',
      pspLabel: 'PSP mostrando o projeto selecionado',
      infoLabel: 'Sobre o projeto na tela',
      how: 'como fiz',
      why: 'pra quê',
      keysLabel: 'Navegar pelos projetos',
      prev: 'Projeto anterior',
      next: 'Próximo projeto',
      open: 'Abrir este projeto',
      sound: 'Som do vídeo (ligar/desligar)',
      noLink: 'Sem link público',
      cue: 'Ir para o sobre',
      gallery: 'Desenhos',
      moreLinks: 'Onde ver mais',
      copy: 'copiar',
      copied: 'copiado ✓',
      hubs: 'Onde me encontrar',
      by: 'por',
      origRepo: 'portfolio original',
      pspModel: 'modelo do PSP',
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
      invert: 'Invert colors',
      pspLabel: 'PSP showing the selected project',
      infoLabel: 'About the project on screen',
      how: 'how i made it',
      why: 'what for',
      keysLabel: 'Browse projects',
      prev: 'Previous project',
      next: 'Next project',
      open: 'Open this project',
      sound: 'Video sound (on/off)',
      noLink: 'No public link',
      cue: 'Go to about',
      gallery: 'Drawings',
      moreLinks: 'Where to see more',
      copy: 'copy',
      copied: 'copied ✓',
      hubs: 'Where to find me',
      by: 'by',
      origRepo: 'original portfolio',
      pspModel: 'PSP model',
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
     O botão mostra o idioma atual (bandeira + sigla); clicar troca para o outro. */
  function stars() {                // 3 + 2 + 3 pontos, em quincôncio, dentro do cantão
    var d = '', rows = [[1.6, [1.9, 4.5, 7.1]], [4, [3.2, 5.8]], [6.4, [1.9, 4.5, 7.1]]];
    rows.forEach(function (r) {
      r[1].forEach(function (x) {
        d += 'M' + (x + .62) + ' ' + r[0] + 'a.62 .62 0 1 0-1.24 0 .62 .62 0 1 0 1.24 0z';
      });
    });
    return d;
  }
  var FLAG = {
    // EUA: sete listras (simplificado para o tamanho de ícone) e o cantão cheio
    // com as estrelas vazadas em pontos redondos
    us: '<svg class="flag" viewBox="0 0 20 14" aria-hidden="true">' +
          '<path d="M9 0h11v2H9zM9 4h11v2H9zM0 8h20v2H0zM0 12h20v2H0z"/>' +
          '<path fill-rule="evenodd" d="M0 0h9v8H0z' + stars() + '"/>' +
          '<rect class="flag__o" x=".5" y=".5" width="19" height="13"/>' +
        '</svg>',
    // Brasil: losango cheio, globo vazado e a faixa atravessando
    br: '<svg class="flag" viewBox="0 0 20 14" aria-hidden="true">' +
          '<path fill-rule="evenodd" d="M10 2 18 7 10 12 2 7z' +
            'M13.2 7a3.2 3.2 0 1 0-6.4 0 3.2 3.2 0 1 0 6.4 0z"/>' +
          '<path class="flag__o" d="M7 7.9Q10 5.7 13 7.1"/>' +
          '<rect class="flag__o" x=".5" y=".5" width="19" height="13"/>' +
        '</svg>'
  };
  var CURRENT = {                   // o que o botão mostra em cada idioma
    pt: { flag: FLAG.br, code: 'PT-BR' },
    en: { flag: FLAG.us, code: 'EN' }
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
    [].forEach.call(document.querySelectorAll('[data-t-title]'), function (el) {
      el.title = t(el.getAttribute('data-t-title'));
    });
    var btn = document.getElementById('langToggle');
    if (btn) {
      var s = CURRENT[lang];
      btn.innerHTML = s.flag + '<span class="ctl__code" aria-hidden="true">' + s.code + '</span>';
      btn.setAttribute('aria-label', t('switchTo'));   // leitor de tela: a ação, não a sigla
      btn.title = t('switchTo');
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
