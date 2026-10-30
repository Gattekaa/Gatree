# Área logada

A área logada usa a identidade aprovada da landing, com densidade apropriada a uma ferramenta de edição. Os estilos vivem nos componentes Tailwind; `app/globals.css` mantém somente os tokens compartilhados e estilos base/vendor.

## Base visual

- Outfit variável, carregada localmente por `next/font/local` no layout do dashboard.
- Canvas escuro `#111210`, superfícies `#191a17` e `#20211d`, texto `#f3f4ed`, texto secundário `#b5b8ab`, borda `#34362e` e destaque `#f0cf56`.
- Tema claro: canvas `#f7f8f2`, painéis brancos, superfície secundária `#eef0e7`, texto `#20231a` e destaque textual `#706014` para contraste.
- Tokens de raio específicos de `.product-route`: `rounded-xl` 12px, `rounded-2xl` 16px, `rounded-3xl` 24px. Os valores fora da área logada são preservados.

## Componentes

- Títulos de página semibold, 30px no mobile e 40px no desktop, tracking próximo de `-.04em`. Números de métricas usam `tabular-nums`.
- Cards de conteúdo com borda de 1px e raio de 16–24px. Ações principais pill em amarelo, ações secundárias neutras e destrutivas com cor de erro.
- Inputs com 48px de altura e uma única borda de foco no wrapper. Inputs internos não recebem um segundo outline.
- Modais, menus, calendários e toasts usam os mesmos tokens, inclusive quando renderizados em portais sob `body`.
- Navegação desktop em painel flutuante, menu móvel em sheet e topbar pill. Não usar pinning, parallax ou movimentos de card ao passar o mouse na área de trabalho.

O conteúdo de páginas públicas, temas escolhidos pelo usuário e iframes do preview seguem seus próprios estilos. Mudanças na moldura e nos controles do editor não devem alterar esses temas.

O login compartilha a tipografia e os tokens da área logada. O seletor de idioma compacto leva sua classe de fonte e os tokens visuais para o portal Radix, que não herda os estilos do container da landing. Nas páginas públicas, a fonte padrão é Outfit quando nenhuma fonte foi escolhida; uma escolha explícita continua prevalecendo.
