/* ============================================================
   CONTEÚDO — o único arquivo que você precisa editar.

   Tudo que aparece escrito no site sai daqui: nome, a seção de IA,
   bio, lista de projetos e links de contato.

   IA (seção logo depois da capa):
     kicker   linha pequena acima do título
     heading  título da seção
     lede     parágrafo de abertura
     items    o que você faz: { title, text }, numerados na ordem da lista
     tools    ferramentas, separadas por "/"

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
  name: 'JoaoByss · AI engineering', // título da aba do navegador
  bootTag: '#JOAOBYSS',                // palavra grande na tela de carregamento
  hero: ['joao', 'byss.'],          // as duas palavras em volta do disquete
  role: 'ai engineering · automação · integração',

  ai: {
    kicker: '// ia local desde 2023',
    heading: 'AI engineering',
    lede: 'Rodo modelos de linguagem na minha própria máquina desde 2023. Hoje meu foco é automação e integração inteligente: ligar modelos a ferramentas e sistemas para que o trabalho repetitivo se resolva sozinho.',
    items: [
      { title: 'IA local',              text: 'Ollama, LM Studio e llama.cpp, com modelos GGUF do Hugging Face rodando no meu hardware.' },
      { title: 'Nuvem',                 text: 'Servidores no Google Cloud quando o modelo não cabe na máquina de casa.' },
      { title: 'MCP',                   text: 'Model Context Protocol para ligar modelos a ferramentas, arquivos e APIs.' },
      { title: 'Contexto e parâmetros', text: 'Monto o contexto que o modelo recebe e ajusto temperatura, top-p e janela de contexto para cada tarefa.' },
      { title: 'Automação',             text: 'Fluxos em que a IA faz o trabalho repetitivo e conversa com outros sistemas.' }
    ],
    tools: ['Ollama', 'LM Studio', 'llama.cpp', 'GGUF', 'Hugging Face', 'Google Cloud', 'MCP', 'Python']
  },

  about: {
    heading: 'sobre',
    bio: [
      'Sou o João, estudante de Ciência da Computação na UFJ e técnico em informática pelo IFG.',
      'Comecei a rodar IA local em 2023 e não parei mais. Hoje trabalho com AI engineering, com foco em automação e integração inteligente.',
      'Antes da IA vieram os jogos, que faço desde 2019: sigo com projetos em Unreal Engine 5, mods e apps em Python, Swift e SQL.'
    ],
    stack: ['Python', 'TypeScript', 'SQL', 'C#', 'Swift', 'Unreal Engine 5']
  },

  contact: ['fale', 'comigo.'],     // as duas palavras em volta do @
  links: [
    { label: 'github',   href: 'https://github.com/exgde' },
    { label: 'linkedin', href: 'https://www.linkedin.com/in/joao-bernardes-478749415/' }
    // para mostrar mais contatos, adicione linhas como:
    // { label: 'email',    href: 'mailto:voce@exemplo.com' }
  ],

  projects: [
    {
      title: 'Casa Acessível',
      sub: 'Casa e banheiro para cadeira de rodas, em realidade virtual',
      stack: 'Unreal Engine 5.8 · Blender · Python',
      year: '2026',
      link: '',                     // repositório privado: sem link
      img: 'assets/projects/casa-acessivel.jpg',
      vid: 'assets/projects/casa-acessivel.mp4'
    },
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
