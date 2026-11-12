/* ============================================================
   CONTEÚDO — o único arquivo que você precisa editar.

   Tudo que aparece escrito no site sai daqui: nome, bio, lista de
   projetos e links de contato.

   Projetos:
     title  nome do projeto (aparece na tela do PSP e no rodapé)
     sub    uma linha dizendo o que é
     stack  tecnologias, separadas por " · "
     year   ano
     link   para onde o botão ↗ leva (GitHub, demo...). Deixe '' para esconder
            (repositório privado não deve ter link: quem visita cai num 404).
     img    captura de tela, ex.: 'assets/projects/meu-app.jpg' (ideal 960×544)
     vid    gravação curta em loop, ex.: 'assets/projects/meu-app.mp4'
            (se tiver vid, ele é usado no lugar de img)
   Sem img nem vid, o PSP mostra uma tela gerada com o título.
   ============================================================ */
window.PF = {
  name: 'JoaoByss',                 // título da aba do navegador
  bootTag: '#BYSS',                 // palavra grande na tela de carregamento
  hero: ['joao', 'byss.'],          // as duas palavras em volta do disquete
  role: 'jogos · mods · código',

  about: {
    heading: 'sobre',
    bio: [
      // RASCUNHO escrito a partir dos seus repositórios — reescreva com as suas palavras.
      'Faço jogos e mods. No momento estou desenvolvendo o WW1-Thriller, um jogo de terror em terceira pessoa na Unreal Engine 5.8, todo em Blueprint.',
      'Também faço mods e pequenos projetos em Python, Swift e SQL.'
    ],
    stack: ['Unreal Engine 5', 'Blueprint', 'Python', 'C#', 'Swift', 'SQL']
  },

  contact: ['fale', 'comigo.'],     // as duas palavras em volta do @
  links: [
    { label: 'github', href: 'https://github.com/exgde' }
    // para mostrar mais contatos, adicione linhas como:
    // { label: 'email',    href: 'mailto:voce@exemplo.com' },
    // { label: 'linkedin', href: 'https://www.linkedin.com/in/seu-usuario' }
  ],

  projects: [
    {
      title: 'WW1-Thriller',
      sub: 'Terror em terceira pessoa, em desenvolvimento',
      stack: 'Unreal Engine 5.8 · Blueprint',
      year: '2026',
      link: '',                     // repositório privado: sem link
      img: '',
      vid: ''                       // quando a gravação chegar: 'assets/projects/ww1-thriller.mp4'
    },
    {
      title: 'oot-switch2-button-prompts',
      sub: 'Ícones de botão PlayStation, Xbox e Steam Deck para OOT (Switch 2)',
      stack: 'Mod · 43 estrelas',
      year: '2026',
      link: 'https://github.com/exgde/oot-switch2-button-prompts',
      img: '', vid: ''
    },
    {
      title: 'oot-lichii-keyboard-mouse',
      sub: 'OOT (Switch 2) no Lichii com teclado e mouse',
      stack: 'Python · Mod',
      year: '2026',
      link: 'https://github.com/exgde/oot-lichii-keyboard-mouse',
      img: '', vid: ''
    },
    {
      title: 'adega',
      sub: 'Meu crossover pessoal',
      stack: 'Swift',
      year: '2026',
      link: 'https://github.com/exgde/adega',
      img: '', vid: ''
    },
    {
      title: 'biblioteca-sql',
      sub: 'Modelagem MySQL para um sistema de biblioteca',
      stack: 'MySQL',
      year: '2026',
      link: 'https://github.com/exgde/biblioteca-sql',
      img: '', vid: ''
    }
  ]
};
