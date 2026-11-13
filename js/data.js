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
     vids   vários clipes, ex.: ['assets/projects/a-1.mp4', 'assets/projects/a-2.mp4']:
            o PSP toca um depois do outro, em ciclo, com um chuvisco na troca
            (se tiver vids, ele é usado no lugar de vid)
   Sem img nem vid, o PSP mostra uma tela gerada com o título.
   ============================================================ */
window.PF = {
  name: 'JoaoByss',                 // título da aba do navegador
  bootTag: '#JOAOBYSS',                // palavra grande na tela de carregamento
  hero: ['joao', 'byss.'],          // as duas palavras em volta do disquete
  role: 'jogos · mods · código',

  about: {
    // título que surge em cima da galeria de desenhos
    art: {
      kicker: 'arte · 2019—hoje',
      title: ['trabalhos', 'como artista'],
      sub: 'ilustração · pixel art · modelagem 3D'
    },
    // retrato ao lado do cartão (gerado por tools/portrait.py)
    photo: { src: 'assets/portrait.webp', alt: 'Retrato de João em preto e branco' },
    heading: 'sobre mim',
    lead: 'Estudo Ciência da Computação na UFJ e sou técnico em Informática pelo IFG. Meu foco é AI engineering: ligar modelos de linguagem a ferramentas, dados e rotinas reais.',
    bio: [
      'Rodo LLMs na minha própria máquina desde 2023 e uso o Claude Code ligado via MCP à Unity, à Unreal e ao Blender. Sei quando não usar IA, e consigo explicar cada decisão do código que publico.',
      'Antes de programar, eu já desenhava: faço ilustração, pixel art e modelagem 3D, e faço jogos desde 2019.'
    ],
    // uma linha cada, embaixo da bio
    built: [
      'CUTSCENE-LOADER — animação 3D de um vídeo comum, sem mocap',
      'Painel com servidor MCP próprio e segundo parecer de um Qwen local',
      'Fábrica de vídeos com IA, com aprovação humana antes de publicar'
    ],
    now: 'Procuro vaga júnior em AI engineering ou automação · topo freela · inglês fluente',
    links: [
      { label: 'artstation', href: 'https://www.artstation.com/joaobyss' },
      { label: 'itch.io',    href: 'https://joaobyss.itch.io' },
      { label: 'github',     href: 'https://github.com/exgde' }
    ]
  },

  /* Desenhos da galeria em perspectiva, ao lado do "sobre mim".
     rows: as três fileiras, de cima para baixo (cada uma repete os seus
     desenhos até encher a largura). alt descreve o desenho para leitor de tela.
     Clicar num desenho abre ele em tela cheia (js/gallery.js); "link" é o
     botão "ver no artstation" que aparece lá. */
  art: {
    link: 'https://www.artstation.com/joaobyss',
    rows: [
      [
        { img: 'assets/art/art-01.webp', alt: 'Soldado com máscara de gás e coração azul brilhando no peito' },
        { img: 'assets/art/art-03.webp', alt: 'Garota de cabelo curto se abraçando' },
        { img: 'assets/art/art-06.webp', alt: 'Gigante com tentáculos saindo do mar, perto de um navio' },
        { img: 'assets/art/art-10.webp', alt: 'Cena em pixel art do jogo Goldspotting com a personagem Sofia' }
      ],
      [
        { img: 'assets/art/art-05.webp', alt: 'Perfil de garota de franja, de olhos fechados' },
        { img: 'assets/art/art-09.webp', alt: 'Garota sentada à mesa de um café' },
        { img: 'assets/art/art-02.webp', alt: 'Homem com o rosto enfaixado apontando uma arma' },
        { img: 'assets/art/art-11.webp', alt: 'Capa do jogo Goldspotting' }
      ],
      [
        { img: 'assets/art/art-04.webp', alt: 'Esboço de rosto de garota de cabelo claro' },
        { img: 'assets/art/art-07.webp', alt: 'Garota correndo numa praia com coqueiros' },
        { img: 'assets/art/art-08.webp', alt: 'Folha de estudos de personagem' }
      ]
    ]
  },

  contact: ['fale', 'comigo.'],     // as duas palavras em volta do @
  links: [
    { label: 'github', href: 'https://github.com/exgde' },
    { label: 'artstation', href: 'https://www.artstation.com/joaobyss' },
    { label: 'itch.io', href: 'https://joaobyss.itch.io' },
    { label: 'email',  href: 'mailto:jbmidiasxboy@gmail.com' }
    // para mostrar mais contatos, adicione linhas como:
    // { label: 'linkedin', href: 'https://www.linkedin.com/in/seu-usuario' }
  ],

  projects: [
    {
      title: 'Goldspotting',
      sub: 'Um jogo 3D com cara de Game Boy, publicado no itch.io',
      how: 'Para a GBJAM 14, me desafiei a encaixar um jogo totalmente 3D na paleta de quatro cores e na resolução baixa do Game Boy, sem deixar de ser divertido.',
      why: 'É o projeto que mais mostra como eu termino um jogo: do zero ao publicado, dentro do prazo da jam.',
      stack: 'Jogo 3D · GBJAM 14',
      year: '2026',
      link: 'https://joaobyss.itch.io/goldspotting',
      img: 'assets/projects/goldspotting.jpg',
      // trechos de uma partida completa, 6–9 s cada
      vids: [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return 'assets/projects/goldspotting-' + n + '.mp4'; })
    },
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
