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

   Inglês: a versão em inglês fica em window.PF_EN, no fim deste arquivo.
   Ela tem o mesmo formato, mas só com os textos (links, imagens e vídeos
   vêm daqui de cima). Mudou um texto aqui? Mude o equivalente lá também.
   Quem vê qual idioma: js/i18n.js.
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
      sub: 'mangá e preto e branco · pixel art · modelagem 3D'
    },
    // retrato ao lado do cartão (gerado por tools/portrait.py)
    photo: { src: 'assets/portrait.webp', light: 'assets/portrait-light.webp', alt: 'Retrato de João em preto e branco' },
    heading: 'sobre mim',
    lead: 'Estudo Ciência da Computação na UFJ e sou técnico em Informática pelo IFG. Meu foco é AI engineering: ligar modelos de linguagem a ferramentas, dados e rotinas reais.',
    bio: [
      'Rodo LLMs na minha própria máquina desde 2023 e uso o Claude Code ligado via MCP à Unity, à Unreal e ao Blender. Sei quando não usar IA, e consigo explicar cada decisão do código que publico.',
      'Antes de programar, eu já desenhava. Minha especialidade é arte em preto e branco, com foco em mangá, e na galeria e no ArtStation tem trabalhos meus em outros estilos e em cor. Também faço pixel art e modelagem 3D, e faço jogos desde 2019. Com 10 anos, meu segundo jogo publicado foi pra Game Jaaj 2, a jam do youtuber Andre Young, e ficou entre os 3 cotados pra vencer no vídeo de premiação.'
    ],
    // uma linha cada, embaixo da bio
    built: [
      'CUTSCENE-LOADER — animação 3D de um vídeo comum, sem mocap',
      'Ferramentas variadas dedicadas ao desenvolvimento de jogos indie'
    ],
    now: 'Procuro vaga júnior em AI engineering ou automação · topo freela · inglês fluente',
    links: [
      { label: 'artstation', href: 'https://joaobyss.artstation.com' },
      { label: 'itch.io',    href: 'https://joaobyss.itch.io' },
      { label: 'github',     href: 'https://github.com/joaobyss' },
      { label: 'ko-fi',      href: 'https://ko-fi.com/joaobyss' }
    ]
  },

  /* Desenhos da galeria em perspectiva, ao lado do "sobre mim".
     rows: as três fileiras, de cima para baixo (cada uma repete os seus
     desenhos até encher a largura). alt descreve o desenho para leitor de tela.
     Clicar num desenho abre ele em tela cheia (js/gallery.js); "link" é o
     botão "ver no artstation" que aparece lá. */
  art: {
    link: 'https://joaobyss.artstation.com',
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
  contactKicker: 'contato · links',
  contactNote: 'Vaga júnior, freela ou collab em jogos e IA: é só chamar.',
  email: 'jbmidiasxboy@gmail.com',
  // links da seção de contato, em grupos (uma coluna cada).
  // icon: nome em js/icons.js · handle: como você aparece lá · note: o que tem lá
  linkGroups: [
    { title: 'carreira & código', links: [
      { icon: 'linkedin', label: 'LinkedIn', handle: 'joao-bernardes', note: 'currículo e experiência', href: 'https://www.linkedin.com/in/joao-bernardes-478749415/' },
      { icon: 'github',   label: 'GitHub',   handle: '@joaobyss',         note: 'código e projetos',      href: 'https://github.com/joaobyss' }
    ] },
    { title: 'arte & vídeo', links: [
      { icon: 'artstation', label: 'ArtStation', handle: 'joaobyss',          note: 'ilustração e 3D',    href: 'https://joaobyss.artstation.com/' },
      { icon: 'youtube',    label: 'YouTube',    handle: '@joaobernardes4169', note: 'vídeos', href: 'https://www.youtube.com/@joaobernardes4169' },
      { icon: 'kofi',       label: 'Ko-fi',      handle: 'joaobyss',          note: 'apoie meu trabalho', href: 'https://ko-fi.com/joaobyss' }
    ] },
    { title: 'jogos', links: [
      { icon: 'itch',     label: 'itch.io',   handle: 'joaobyss',  note: 'jogos publicados', href: 'https://joaobyss.itch.io/' },
      { icon: 'gamejolt', label: 'Game Jolt', handle: '@joaobyss', note: 'perfil e jogos',             href: 'https://gamejolt.com/@joaobyss' }
    ] }
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
      title: 'WW1-Thriller',
      sub: 'Terror em terceira pessoa, em desenvolvimento',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Feito na Unreal Engine 5.8, com toda a lógica em Blueprint: personagem, câmera em terceira pessoa e os sistemas de tensão do jogo.',
      why: 'Um jogo de terror ambientado na Primeira Guerra, o meu projeto principal no momento.',
      stack: 'Unreal Engine 5.8 · Blueprint',
      year: '2026',
      link: '',                     // repositório privado: sem link
      img: 'assets/projects/ww1-thriller.jpg',
      // 1: demonstração de movimentação e tiro · 2: sistema de luz com isqueiro
      vids: ['assets/projects/ww1-thriller-1.mp4', 'assets/projects/ww1-thriller-2.mp4']
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
      title: 'oot-switch2-button-prompts',
      sub: 'Ícones de botão PlayStation, Xbox e Steam Deck para OOT (Switch 2)',
      // RASCUNHO — reescreva "how" e "why" com as suas palavras.
      how: 'Substituí os ícones de botão do jogo por versões de cada controle, mantendo o estilo visual original.',
      why: 'Para quem joga com controle de PlayStation, Xbox ou Steam Deck ver na tela os botões que tem na mão.',
      stack: 'Mod · 43 estrelas',
      year: '2026',
      link: 'https://github.com/joaobyss/oot-switch2-button-prompts',
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
      link: 'https://github.com/joaobyss/oot-lichii-keyboard-mouse',
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
      link: 'https://github.com/joaobyss/adega',
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
      link: 'https://github.com/joaobyss/biblioteca-sql',
      img: '', vid: ''
    }
  ]
};

/* ============================================================
   ENGLISH — mesmo formato de window.PF, só com os textos.
   Listas (projetos, grupos de links, fileiras de desenhos) seguem a
   mesma ordem de cima. O que faltar aqui aparece em português.
   ============================================================ */
window.PF_EN = {
  role: 'games · mods · code',

  about: {
    art: {
      kicker: 'art · 2019—now',
      title: ['work', 'as an artist'],
      sub: 'manga and black & white · pixel art · 3D modeling'
    },
    photo: { alt: 'Black-and-white portrait of João' },
    heading: 'about me',
    lead: 'I study Computer Science at UFJ and hold a technical degree in IT from IFG. My focus is AI engineering: connecting language models to real tools, data and workflows.',
    bio: [
      'I have been running LLMs on my own machine since 2023, and I use Claude Code connected via MCP to Unity, Unreal and Blender. I know when not to use AI, and I can explain every decision in the code I publish.',
      'Before I coded, I drew. My specialty is black and white art, with a focus on manga, and you can see my work in other styles and in color in the gallery and on ArtStation. I also do pixel art and 3D modeling, and I have been making games since 2019. At 10, my second published game was for Game Jaaj 2, the jam run by YouTuber Andre Young, and it was one of the 3 shortlisted to win in the awards video.'
    ],
    built: [
      'CUTSCENE-LOADER — 3D animation from an ordinary video, no mocap',
      'A range of tools made for indie game development'
    ],
    now: 'Looking for a junior role in AI engineering or automation · open to freelance · fluent in English'
  },

  art: {
    rows: [
      [
        { alt: 'Soldier in a gas mask with a glowing blue heart on his chest' },
        { alt: 'Short-haired girl hugging herself' },
        { alt: 'Giant with tentacles rising from the sea, next to a ship' },
        { alt: 'Pixel art scene from the game Goldspotting with the character Sofia' }
      ],
      [
        { alt: 'Profile of a girl with bangs, eyes closed' },
        { alt: 'Girl sitting at a café table' },
        { alt: 'Man with a bandaged face pointing a gun' },
        { alt: 'Cover art for the game Goldspotting' }
      ],
      [
        { alt: 'Sketch of a fair-haired girl\'s face' },
        { alt: 'Girl running on a beach with palm trees' },
        { alt: 'Character study sheet' }
      ]
    ]
  },

  contact: ['get in', 'touch.'],
  contactKicker: 'contact · links',
  contactNote: 'Junior role, freelance or a collab on games and AI: just reach out.',
  linkGroups: [
    { title: 'career & code', links: [
      { note: 'résumé and experience' },
      { note: 'code and projects' }
    ] },
    { title: 'art & video', links: [
      { note: 'illustration and 3D' },
      { note: 'videos' },
      { note: 'support my work' }
    ] },
    { title: 'games', links: [
      { note: 'published games' },
      { note: 'profile and games' }
    ] }
  ],

  projects: [
    {
      sub: 'A 3D game that looks like a Game Boy game, published on itch.io',
      how: 'For GBJAM 14, I challenged myself to fit a fully 3D game into the Game Boy\'s four-color palette and low resolution, without it stopping being fun.',
      why: 'It is the project that best shows how I finish a game: from scratch to published, within the jam deadline.',
      stack: '3D game · GBJAM 14'
    },
    {
      sub: 'Third-person horror, in development',
      how: 'Made in Unreal Engine 5.8, with all the logic in Blueprint: the character, the third-person camera and the game\'s tension systems.',
      why: 'A horror game set in World War I, and my main project right now.'
    },
    {
      sub: 'A wheelchair-accessible house and bathroom, in virtual reality',
      how: 'I modeled the house and bathroom in Blender, built the scene and the VR interaction in Unreal Engine 5.8, and used Python to automate steps of the process.',
      why: 'To experience, at real scale and from the inside, what a house needs to be like for a wheelchair user: doorways, heights and turning space.'
    },
    {
      sub: 'PlayStation, Xbox and Steam Deck button icons for OOT (Switch 2)',
      how: 'I replaced the game\'s button icons with versions for each controller, keeping the original visual style.',
      why: 'So people playing with a PlayStation, Xbox or Steam Deck controller see on screen the buttons they are holding.',
      stack: 'Mod · 43 stars'
    },
    {
      sub: 'OOT (Switch 2) on Lichii with keyboard and mouse',
      how: 'A Python script that translates keyboard and mouse input into controller commands.',
      why: 'To play OOT (Switch 2) on Lichii with keyboard and mouse, no controller needed.'
    },
    {
      sub: 'My personal crossover',
      how: 'Written in Swift.',
      why: 'A personal project, made for my own use.'
    },
    {
      sub: 'MySQL modeling for a library system',
      how: 'I modeled the tables, relationships and keys in MySQL, with queries for the day-to-day of a library.',
      why: 'To practice database modeling on a real case: books, readers and loans.'
    }
  ]
};
