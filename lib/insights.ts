import type { AnalyticsOverview, Insight, LinkClickData } from "@/types";

export function generateInsights(
  overview: AnalyticsOverview,
  clicksByLink: LinkClickData[],
  hasEnoughData: boolean
): Insight[] {
  if (!hasEnoughData) {
    return [];
  }

  const insights: Insight[] = [];

  if (overview.totalViews >= 20 && overview.avgCTR < 15) {
    insights.push({
      id: "low-ctr",
      type: "recommendation",
      icon: "lightbulb",
      title: "Seus links podem render mais",
      description:
        "Sua taxa de cliques está em " +
        Math.round(overview.avgCTR) +
        "%. Tente usar títulos mais diretos, adicionar thumbnails ou reordenar links mais populares para o topo.",
      value: Math.round(overview.avgCTR),
      generatedAt: new Date(),
    });
  }

  if (overview.avgCTR > 0 && overview.avgCTRPrevious > 0) {
    const ctrDelta = overview.avgCTR - overview.avgCTRPrevious;
    if (ctrDelta >= 8) {
      insights.push({
        id: "ctr-improving",
        type: "growth",
        icon: "trending-up",
        title: "Engajamento em alta",
        description: `Seus visitantes estão clicando mais. Algo mudou pro melhor — mantenha a estratégia atual.`,
        value: Math.round(ctrDelta),
        generatedAt: new Date(),
      });
    }
  }

  if (clicksByLink.length >= 3) {
    const totalClicks = clicksByLink.reduce((acc, l) => acc + l.clicks, 0);
    const bottomLinks = clicksByLink.filter(
      (l) => l.clicks === 0 || (totalClicks > 0 && l.clicks / totalClicks < 0.03)
    );

    if (bottomLinks.length >= 2) {
      insights.push({
        id: "dead-links",
        type: "recommendation",
        icon: "lightbulb",
        title: "Links ignorados pelo público",
        description: `${bottomLinks.length} links quase não recebem cliques. Considere removê-los, melhorar os títulos ou destacá-los com prioridade.`,
        value: bottomLinks.length,
        generatedAt: new Date(),
      });
    }
  }

  if (clicksByLink.length >= 3 && overview.totalClicks >= 10) {
    const topLink = clicksByLink[0];
    const topShare = topLink.clicks / overview.totalClicks;
    if (topShare >= 0.7) {
      insights.push({
        id: "link-concentration",
        type: "recommendation",
        icon: "lightbulb",
        title: "Tráfego concentrado",
        description: `"${topLink.label}" concentra ${Math.round(topShare * 100)}% dos cliques. Se esse link sair do ar, você perde quase toda conversão. Diversifique.`,
        value: Math.round(topShare * 100),
        generatedAt: new Date(),
      });
    }
  }

  if (clicksByLink.length > 0) {
    const growingLinks = clicksByLink.filter(
      (l) => l.clicksPrevious >= 3 && l.clicks >= l.clicksPrevious * 2
    );
    if (growingLinks.length > 0) {
      const best = growingLinks[0];
      const growth = Math.round(
        ((best.clicks - best.clicksPrevious) / best.clicksPrevious) * 100
      );
      insights.push({
        id: "link-trending",
        type: "growth",
        icon: "zap",
        title: `"${best.label}" está bombando`,
        description: `+${growth}% de cliques vs período anterior. Considere destacar este link com prioridade ou compartilhá-lo separadamente.`,
        value: growth,
        generatedAt: new Date(),
      });
    }
  }

  if (overview.totalViews >= 15 && overview.totalClicks === 0) {
    insights.push({
      id: "zero-clicks",
      type: "recommendation",
      icon: "lightbulb",
      title: "Visitantes não estão clicando",
      description:
        "Pessoas visitam sua página mas não clicam em nada. Revise a ordem dos links, use descrições mais claras ou adicione um link de destaque.",
      value: 0,
      generatedAt: new Date(),
    });
  }

  if (
    overview.totalViewsPrevious >= 10 &&
    overview.totalViews < overview.totalViewsPrevious * 0.5
  ) {
    insights.push({
      id: "traffic-drop",
      type: "decline",
      icon: "trending-down",
      title: "Tráfego caiu bastante",
      description:
        "Suas visitas caíram mais de 50%. Compartilhe sua árvore novamente nas redes ou atualize sua bio com o link.",
      value: Math.round(
        ((overview.totalViews - overview.totalViewsPrevious) /
          overview.totalViewsPrevious) *
          100
      ),
      generatedAt: new Date(),
    });
  }

  if (overview.uniqueVisitors >= 100 && overview.uniqueVisitorsPrevious < 100) {
    insights.push({
      id: "milestone-visitors",
      type: "peak",
      icon: "party-popper",
      title: "100+ visitantes únicos!",
      description:
        "Sua árvore alcançou mais de 100 pessoas diferentes neste período. Bom momento para adicionar novos links ou uma promoção.",
      value: overview.uniqueVisitors,
      generatedAt: new Date(),
    });
  }

  return insights.slice(0, 3);
}
