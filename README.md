# portfolio

Portfolio de uma página em HTML, CSS e JavaScript puros, sem build. No ar em https://exgde.github.io/

- Todo o conteúdo (nome, bio, projetos, links) fica em `js/data.js`.
- O site tem pt-BR (quem está no Brasil, pelo fuso horário) e inglês (resto do mundo); o botão com a bandeira, ao lado de "inverter", troca. Os textos em inglês ficam em `window.PF_EN`, no fim de `js/data.js`; os rótulos fixos da interface, em `js/i18n.js`.
- Para rodar localmente: `python3 -m http.server 8765` e abrir `http://localhost:8765`.
- Capturas e gravações dos projetos vão em `assets/projects/`.

## Créditos

- Modelo 3D: ["Sony PSP"](https://sketchfab.com/3d-models/sony-psp-dca89d10ec304d0cab76837750df7761) por [Ilya Ostrovsky](https://sketchfab.com/strov), licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- [three.js](https://threejs.org/) (MIT) e a fonte [VT323](https://fonts.google.com/specimen/VT323) (OFL).
