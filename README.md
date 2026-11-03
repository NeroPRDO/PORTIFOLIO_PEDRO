# Pedro Dall’Agnol · Portfólio

Portfólio profissional estático, inspirado em Yggdrasil e no cartão pessoal preto e dourado. Publicado no [GitHub Pages](https://neroprdo.github.io/PORTIFOLIO_PEDRO/).

## Executar e atualizar

Requer Node.js 22 ou superior. Não há dependências de produção nem etapa de instalação.

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
- Contraste ampliado e preferência de movimento reduzido; configuração do sistema tem prioridade.
- Animação da copa limitada a 36 partículas e pausada fora da tela ou com aba inativa.
- Filtros acessíveis com anúncio de resultados e contatos diretos por email/WhatsApp.
- Preferências de acessibilidade e idioma são locais. Tradução de crioulo cabo-verdiano usa Santiago como referência e deve ser revista por falantes antes de ser tratada como tradução certificada.

Os testes automatizados e a revisão visual não equivalem a uma certificação WCAG. Recomenda-se complementar com testes de leitores de tela e usuários reais.

## Projetos e informações

Curadoria baseada em repositórios públicos consultados em 03/11/2026: ajuda.cantina, BANTADS, Divisão de Despesas, DIEGÉTIKA + HUB, Manutenção de Equipamentos, Compactação e Busca e Shell Backup. As descrições não atribuem clientes, métricas comerciais, autoria exclusiva em equipes ou recursos não verificados. Datas são anos dos repositórios/projetos, não declarações de experiência empregatícia.

Formação informada pelo titular: TADS/UFPR 2024–2027, conclusão prevista ao final de 2027; mobilidade em Engenharia Informática no IPB, Bragança, Portugal, em 2026–2027. Não é apresentada como dupla diplomação.

## Imagens

Árvore e raízes: materiais fornecidos na pasta `FOTOS`. Retrato: imagem já utilizada no portfólio anterior. Marca vetorial: criada para esta interface. Logotipo UFPR: arquivo fornecido pelo titular, usado na identificação acadêmica. Prévias ajuda.cantina e DIEGÉTIKA: capturas dos projetos públicos. Os gráficos de BANTADS e Divisão de Despesas são composições ilustrativas, não capturas de interfaces. Não foram utilizadas fotos extraídas do Instagram.

## Google Analytics

Propriedade original preservada: `G-XWFKEVEDM5`. Uma escolha discreta aparece na primeira visita. O script do Google só é carregado após aceite, e a decisão pode ser alterada em “Privacidade e estatísticas” no rodapé. A recusa impede o carregamento; a revogação desativa o identificador e remove cookies `_ga` acessíveis ao site. Isso significa que visitantes sem consentimento não aparecem no Analytics.

## Publicação

As páginas estáticas geradas ficam na raiz da branch `main`, compatíveis com GitHub Pages configurado para publicar dessa branch. A branch `Backup` não faz parte do fluxo e não deve ser modificada. O workflow de CI verifica testes e se os HTMLs estão sincronizados com as fontes; não altera a configuração de hospedagem.
