/* ============================================================
   CONTEÚDO — o único arquivo que você precisa editar.

   Tudo que aparece escrito no site sai daqui: nome, bio, lista de
   projetos e links de contato.

   Projetos:
     title  nome do projeto (aparece na tela do PSP e no rodapé)
     sub    uma linha dizendo o que é
     how    "como fiz": um parágrafo curto sobre o processo
     why    "pra quê": para que serve / por que existe
            (how e why aparecem na descrição ao lado do PSP; vazio = some)
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
  bootTag: '#JOAOBYSS',                // palavra grande na tela de carregamento
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
      title: 'Casa Acessível',
      sub: 'Casa e banheiro para cadeira de rodas, em realidade virtual',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Modelei a casa e o banheiro no Blender, montei a cena e a interação em VR na Unreal Engine 5.8 e usei Python para automatizar etapas do processo.',
      why: 'Para experimentar, em escala real e de dentro, como uma casa precisa ser para quem usa cadeira de rodas: passagens, alturas e espaço de giro.',
      stack: 'Unreal Engine 5.8 · Blender · Python',
      year: '2026',
      link: '',                     // repositório privado: sem link
      img: 'assets/projects/casa-acessivel.jpg',
      vid: 'assets/projects/casa-acessivel.mp4'
    },
    {
      title: 'WW1-Thriller',
      sub: 'Terror em terceira pessoa, em desenvolvimento',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Feito na Unreal Engine 5.8, com toda a lógica em Blueprint: personagem, câmera em terceira pessoa e os sistemas de tensão do jogo.',
      why: 'Um jogo de terror ambientado na Primeira Guerra, o meu projeto principal no momento.',
      stack: 'Unreal Engine 5.8 · Blueprint',
      year: '2026',
      link: '',                     // repositório privado: sem link
      img: '',
      vid: ''                       // quando a gravação chegar: 'assets/projects/ww1-thriller.mp4'
    },
    {
      title: 'oot-switch2-button-prompts',
      sub: 'Ícones de botão PlayStation, Xbox e Steam Deck para OOT (Switch 2)',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Substituí os ícones de botão do jogo por versões de cada controle, mantendo o estilo visual original.',
      why: 'Para quem joga com controle de PlayStation, Xbox ou Steam Deck ver na tela os botões que tem na mão.',
      stack: 'Mod · 43 estrelas',
      year: '2026',
      link: 'https://github.com/exgde/oot-switch2-button-prompts',
      img: '', vid: ''
    },
    {
      title: 'oot-lichii-keyboard-mouse',
      sub: 'OOT (Switch 2) no Lichii com teclado e mouse',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Um script em Python que traduz teclado e mouse para os comandos do controle.',
      why: 'Para jogar OOT (Switch 2) no Lichii com teclado e mouse, sem precisar de controle.',
      stack: 'Python · Mod',
      year: '2026',
      link: 'https://github.com/exgde/oot-lichii-keyboard-mouse',
      img: '', vid: ''
    },
    {
      title: 'adega',
      sub: 'Meu crossover pessoal',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Escrito em Swift.',
      why: 'Um projeto pessoal, feito para o meu próprio uso.',
      stack: 'Swift',
      year: '2026',
      link: 'https://github.com/exgde/adega',
      img: '', vid: ''
    },
    {
      title: 'biblioteca-sql',
      sub: 'Modelagem MySQL para um sistema de biblioteca',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Modelei as tabelas, relações e chaves em MySQL, com consultas para o dia a dia de uma biblioteca.',
      why: 'Para praticar modelagem de banco de dados num caso real: livros, leitores e empréstimos.',
      stack: 'MySQL',
      year: '2026',
      link: 'https://github.com/exgde/biblioteca-sql',
      img: '', vid: ''
    }
  ]
};
