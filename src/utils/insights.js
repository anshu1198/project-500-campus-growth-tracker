/**
 * Project 500 — Campus Growth Tracker
 * Rule-based analytical insights generator.
 */

export function generateInsights(registrations = [], ambassadors = [], channels = [], settings = {}) {
  const insights = [];
  const regs = Array.isArray(registrations) ? registrations : [];
  const ambs = Array.isArray(ambassadors) ? ambassadors : [];
  const total = regs.length;
  const target = settings?.registrationTarget || 500;

  if (total === 0) {
    insights.push('No registrations have been recorded yet. Add demo records or import a dataset to begin analysing performance.');
    return insights;
  }

  // Progress insight
  const pct = ((total / target) * 100).toFixed(0);
  insights.push(`The campaign has reached ${pct}% of its ${target}-registration target (${total} registrations).`);

  // Channel analysis
  const channelCounts = {};
  regs.forEach(r => {
    const ch = r?.discoveryChannel || 'other';
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });

  const channelNames = {
    'college-club': 'College ambassador referrals',
    'whatsapp': 'WhatsApp communities',
    'linkedin': 'LinkedIn and organic referrals',
    'other': 'Other sources'
  };

  const sortedChannels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  if (sortedChannels.length > 0) {
    const [topChannel, topCount] = sortedChannels[0];
    const topPct = ((topCount / total) * 100).toFixed(0);
    const topName = channelNames[topChannel] || topChannel;
    insights.push(`${topName} account for the largest share of registrations (${topPct}%, ${topCount} registrations).`);
  }

  if (sortedChannels.length > 1) {
    const [bottomChannel, bottomCount] = sortedChannels[sortedChannels.length - 1];
    const bottomName = channelNames[bottomChannel] || bottomChannel;
    if (bottomCount < total * 0.15) {
      insights.push(`${bottomName} is contributing fewer registrations than the other channels (${bottomCount} registrations).`);
    }
  }

  // Ambassador insights
  const ambassadorReg = regs.filter(r => r && r.ambassadorId).length;
  if (ambassadorReg > 0) {
    const ambPct = ((ambassadorReg / total) * 100).toFixed(0);
    insights.push(`${ambassadorReg} registrations (${ambPct}%) are attributed to specific ambassadors via referral codes.`);
  }

  // Active ambassadors without registrations
  const activeAmbs = ambs.filter(a => a && a.status === 'active');
  const ambsWithoutRegs = activeAmbs.filter(a => !regs.some(r => r && r.ambassadorId === a.id));
  if (ambsWithoutRegs.length > 0 && activeAmbs.length > 1) {
    insights.push(`${ambsWithoutRegs.length} active ambassador(s) have no attributed registrations yet.`);
  }

  // Small sample caveat
  if (total < 20) {
    insights.push('Note: These findings are preliminary due to the small sample size of simulated data.');
  }

  return insights;
}
