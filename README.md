# Pedro Dall’Agnol · Portfólio

Portfólio profissional estático, inspirado em Yggdrasil e no cartão pessoal preto e dourado. Publicado no [GitHub Pages](https://neroprdo.github.io/PORTIFOLIO_PEDRO/).

## Executar e atualizar

Requer Node.js 22 ou superior. Não há etapa de instalação. Matter.js 0.20.0 é servido localmente, com licença MIT em `assets/vendor/MATTER-LICENSE.txt`.

```sh
npm run build
npm test
npm run dev
```

Prévia: `http://127.0.0.1:4185/PORTIFOLIO_PEDRO/`.

- `src/template.html`: estrutura semântica das páginas.
- `src/en.json`, `pt-BR.json`, `pt-PT.json`, `fr.json`, `es.json`, `de.json`, `pl.json`, `it.json`, `kea-CV.json`: traduções completas.
- `src/projects.json`: seleção, links e tecnologias dos projetos.
- `scripts/build.mjs`: gera `index.html`, as oito traduções e `sitemap.xml`.
- `assets/styles.css`: composição, responsividade, contraste, impressão e movimento reduzido.
- `assets/app.js`: navegação, filtros, preferências e consentimento de estatísticas.
- `tests/site.test.mjs`: integridade das páginas, conteúdo, links e comportamento do Analytics.

Após editar fontes ou traduções, execute o build e os testes. Versione também as páginas HTML geradas. O site funciona na raiz ou em `/PORTIFOLIO_PEDRO/`. A versão de entrada é inglesa, com escolha explícita de idioma e preferência salva no navegador. Links de idioma preservam a seção atual.

## Experiência e acessibilidade

- Conteúdo de todas as páginas pré-renderizado e legível sem JavaScript.
- Navegação da árvore e menu com destinos equivalentes; links de salto, foco visível, diálogos nativos e títulos hierárquicos.
- Tamanhos de texto 100%, 125% e 150%; zoom nativo do navegador permanece liberado.
- Contraste ampliado e preferência de movimento reduzido; o sistema define o padrão e o visitante pode escolher outra opção explicitamente.
- Animação da copa limitada a 80 partículas e pausada fora da tela ou com aba inativa.
- Filtros acessíveis com anúncio de resultados e contatos diretos por email/WhatsApp.
- Preferências de acessibilidade e idioma são locais. Tradução de crioulo cabo-verdiano usa Santiago como referência e deve ser revista por falantes antes de ser tratada como tradução certificada.

Os testes automatizados e a revisão visual não equivalem a uma certificação WCAG. Recomenda-se complementar com testes de leitores de tela e usuários reais.

## Projetos e informações

Curadoria baseada em repositórios públicos consultados em 03/11/2026: ajuda.cantina, BANTADS, Divisão de Despesas, DIEGÉTIKA + HUB, Manutenção de Equipamentos, Compactação e Busca, Shell Backup e Tetris. As descrições não atribuem clientes, métricas comerciais, autoria exclusiva em equipes ou recursos não verificados. Datas são anos dos repositórios/projetos, não declarações de experiência empregatícia.

Formação informada pelo titular: TADS/UFPR 2024–2027, conclusão prevista ao final de 2027; mobilidade em Engenharia Informática no IPB, Bragança, Portugal, em 2026–2027. Não é apresentada como dupla diplomação.

## Imagens

Árvore, retrato atual e capturas BANTADS, Compactação e Busca, Shell Backup e Tetris: arquivos fornecidos pelo titular em `FOTOS` e `FOTOS/NEW`. O GIF do Tetris tem uma alternativa estática para movimento reduzido. Prévias ajuda.cantina e DIEGÉTIKA mantidas. Divisão de Despesas e Manutenção de Equipamentos usam composições ilustrativas. Ilustrações narrativas e cursor são SVGs originais da interface. Logotipo UFPR identifica a instituição acadêmica. Não foram utilizadas fotos extraídas do Instagram.

## Google Analytics

Propriedade original preservada: `G-XWFKEVEDM5`. Uma escolha discreta aparece na primeira visita. O script do Google só é carregado após aceite, e a decisão pode ser alterada em “Privacidade e estatísticas” no rodapé. A recusa impede o carregamento; a revogação desativa o identificador e remove cookies `_ga` acessíveis ao site. Isso significa que visitantes sem consentimento não aparecem no Analytics.

## Publicação

As páginas estáticas geradas ficam na raiz da branch `main`, compatíveis com GitHub Pages configurado para publicar dessa branch. A branch `Backup` não faz parte do fluxo e não deve ser modificada. O workflow de CI verifica testes e se os HTMLs estão sincronizados com as fontes; não altera a configuração de hospedagem.

## Interações e narrativa

`assets/experience.js` e `assets/experience.css` implementam o conto autoral de Varnor em seis capítulos traduzidos, com fio SVG desenhado pela posição de rolagem, zoom da árvore, círculo rúnico horário, cursor e rastros luminosos. A rolagem permanece nativa, sem bloquear roda, toque ou teclado. A jornada usa deslocamento horizontal em telas com espaço suficiente e cartões verticais em telas pequenas, texto ampliado ou movimento reduzido.

O laboratório de tecnologias usa Matter.js para colisões, gravidade e arraste. Inclui impulso, reorganização e pausa por botões. Efeitos param quando a aba está inativa; física e GIF param fora da área visível. Movimento reduzido mantém a história e o conteúdo acessíveis sem animação. Os rastros do fundo são partículas Canvas 2D, não uma simulação de fluidos WebGL.
