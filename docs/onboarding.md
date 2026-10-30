# Tour guiado do app

O tour destaca os controles reais com um recorte no fundo escurecido e uma explicação próxima ao elemento. Próximo e Voltar percorrem as páginas da conta. O fundo fica bloqueado durante o percurso para evitar alterações acidentais; o guia não cria árvores, links ou dados de exemplo.

## Dois momentos após o cadastro

1. **Boas-vindas (`welcome`)**: novas contas começam no dashboard com seis passos — visão geral, criação de árvore, criação e busca de links curtos, preferências e conclusão. Essa fase não precisa de árvore e ignora qualquer slug recebido. O último passo explica que o guia continuará depois da primeira criação real.
2. **Primeira árvore (`first-tree`)**: depois de concluir as boas-vindas, criar uma árvore com sucesso agenda a continuação para aquele slug. O guia começa quando o editor dessa árvore está aberto. São sete passos: título, adição de conteúdo, aparência, preview, compartilhamento, indicadores de analytics e período. A conclusão acontece na tela de analytics, sem retornar ao dashboard.

Concluir as boas-vindas agenda a segunda fase; não cria a árvore nem abre seu formulário automaticamente. Pular, fechar ou usar Escape cancela todo o guia automático, incluindo a continuação. Concluir ou encerrar a fase da primeira árvore também impede novas aberturas automáticas. O tour continua disponível manualmente no menu do perfil.

A continuação só é emitida pelo sucesso da criação real. Não começa ao abrir um editor existente, ao receber uma resposta de erro ou ao cancelar o formulário. Seu estado é isolado por usuário: aguardando criação, árvore criada com seu slug e concluído.

## Percurso manual

Reabrir pelo menu do perfil em **Tour do app** começa pela página atual. No editor ou analytics, o guia usa a árvore que está aberta; nas outras páginas, usa a primeira árvore ativa.

- Sem árvore disponível, o percurso manual tem seis passos básicos.
- Com árvore, inclui seu card, os cinco passos do editor e os dois de analytics: quatorze passos no total.
- O percurso manual termina no controle de criação do dashboard e mantém sua própria mensagem de conclusão.

`buildTourPlan(path, slug, copy, mode = "manual")` recebe os textos de `onboarding.guided.steps`. O modo `welcome` usa `welcomeFinish` na conclusão; `first-tree` retorna um plano vazio enquanto não há slug. Slugs são codificados nas rotas do editor e de analytics.

## Destaque e acessibilidade

Os alvos são identificados pelos atributos `data-tour`. O destaque acompanha scroll, redimensionamento e mudanças de layout, escolhendo o controle visível nos layouts mobile e desktop. Elementos fora da tela são trazidos para a área visível. Se um alvo não aparecer em cinco segundos, o guia permite avançar ou voltar e informa a indisponibilidade.

O dialog usa o Radix existente para foco, Escape e isolamento da interface para tecnologias assistivas, sem escurecer o elemento destacado. O scroll respeita a preferência de movimento reduzido.

## Abertura e persistência

- O callback JWT do Auth.js habilita `showWelcomeTour` somente quando `trigger === "signUp"`, após criar um usuário. Um login comum não oferece novamente as boas-vindas.
- O layout autenticado entrega essa flag e o ID do usuário ao `TourProvider`.
- A conclusão das boas-vindas e o progresso da continuação usam chaves versionadas por usuário no navegador. A persistência sincroniza abas; se o armazenamento estiver bloqueado, a escolha permanece em memória na sessão atual.
- Concluir ou encerrar as boas-vindas limpa a flag da sessão autenticada por uma Server Action. Atualizações enviadas pelo cliente só podem desabilitar essa flag.

Não há migração de banco nem dependência nova. Textos estão nos dicionários PT/EN; estilos usam Tailwind e os tokens da área logada.

## Validação

`node --import tsx --test lib/onboarding.test.ts components/onboarding/tour-plan.test.ts components/onboarding/position.test.ts` cobre cadastro/login, conclusão e cancelamento, isolamento por conta, armazenamento bloqueado, os três modos de percurso, retomada na página atual, slugs e posicionamento responsivo. A validação de UI não executa criação ou edição de dados reais.
