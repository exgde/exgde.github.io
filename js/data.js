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
    // abre a seção, em letra maior
    lead: 'Estudo Ciência da Computação na UFJ e sou técnico em Informática pelo IFG. Rodo modelos de linguagem na minha própria máquina desde 2023, e hoje meu foco é AI engineering: ligar modelos a ferramentas, dados e rotinas reais.',
    ai: 'Já lidei com o que costuma quebrar na prática: janela de contexto, parâmetros de inferência, custo de GPU e a ligação entre modelo e ferramentas via MCP. Uso o Claude Code conectado à Unity, à Unreal e ao Blender. Também sei quando não usar IA, e consigo explicar cada decisão do código que publico.',
    art: 'Antes de programar, eu já desenhava. Faço ilustração, pixel art e modelagem 3D, e sou autor e ilustrador de um livro infantil. Faço jogos desde 2019, em Unity e Unreal.',
    // os três recortes ao lado do texto de arte (o nome em "art" é o desenho de js/art.js)
    crafts: [
      { label: 'ilustração',    art: 'pencil' },
      { label: 'pixel art',     art: 'sprite' },
      { label: 'modelagem 3d',  art: 'cube' }
    ],
    built: [
      { title: 'CUTSCENE-LOADER', text: 'Tira a animação 3D das pessoas de um vídeo comum, sem roupa de mocap, e exporta um BVH por pessoa para o Blender. Pre-alpha.' },
      { title: 'Painel com MCP próprio', text: 'O Claude lê o estado real dos meus projetos antes de opinar, e um Qwen local dá um segundo parecer.' },
      { title: 'Fábrica de vídeos', text: 'O Claude escreve o roteiro, a narração roda na minha GPU, a animação 3D sai de código e eu aprovo antes de publicar.' },
      { title: 'Pipeline de prospecção', text: 'Busca negócios locais e monta a fila de mensagens, com limite de custo e aprovação humana antes de qualquer envio.' }
    ],
    now: 'Estudo SQL e Next.js e cuido da comunicação do projeto de extensão Tibira (UFJ). Procuro vaga júnior em AI engineering ou automação, e topo freela e colaboração. Falo inglês fluentemente.',
    stack: ['Python', 'Claude Code', 'MCP', 'LLMs locais', 'Unreal Engine', 'Unity', 'Blender', 'SQL']
  },

  contact: ['fale', 'comigo.'],     // as duas palavras em volta do @
  links: [
    { label: 'github', href: 'https://github.com/exgde' },
    { label: 'itch.io', href: 'https://joaobyss.itch.io' },
    { label: 'email',  href: 'mailto:jbmidiasxboy@gmail.com' }
    // para mostrar mais contatos, adicione linhas como:
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
