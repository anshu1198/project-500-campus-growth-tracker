/**
 * Project 500 — Campus Growth Tracker
 * Derived metrics calculation engine.
 */

export function calcTotalRegistrations(registrations) {
  const list = Array.isArray(registrations) ? registrations : [];
  return list.length;
}

export function calcProgressPercent(registrations, target) {
  const list = Array.isArray(registrations) ? registrations : [];
  if (!target || target <= 0) return 0;
  return Math.min(100, (list.length / target) * 100);
}

export function calcUniqueColleges(registrations) {
  const list = Array.isArray(registrations) ? registrations : [];
  const colleges = new Set(list.map(r => r?.college?.toLowerCase().trim()).filter(Boolean));
  return colleges.size;
}

export function calcActiveAmbassadors(ambassadors) {
  const list = Array.isArray(ambassadors) ? ambassadors : [];
  return list.filter(a => a && a.status === 'active').length;
}

export function calcAmbassadorRegistrations(ambassadorId, registrations) {
  if (!ambassadorId) return 0;
  const list = Array.isArray(registrations) ? registrations : [];
  return list.filter(r => r && r.ambassadorId === ambassadorId).length;
}

export function calcAmbassadorShare(ambassadorId, registrations) {
  const list = Array.isArray(registrations) ? registrations : [];
  const total = list.length;
  if (total === 0) return 0;
  const count = calcAmbassadorRegistrations(ambassadorId, list);
  return (count / total) * 100;
}

export function calcChannelBreakdown(registrations, channels) {
  const chList = Array.isArray(channels) ? channels : [];
  const regList = Array.isArray(registrations) ? registrations : [];

  const breakdown = {};
  chList.forEach(ch => {
    breakdown[ch.id] = {
      channelId: ch.id,
      channelName: ch.name || ch.id,
      target: ch.target || 0,
      actual: 0,
      percentage: 0
    };
  });

  regList.forEach(r => {
    const channel = r?.discoveryChannel || 'other';
    if (breakdown[channel]) {
      breakdown[channel].actual += 1;
    } else {
      breakdown[channel] = {
        channelId: channel,
        channelName: channel === 'other' ? 'Other / Direct' : channel,
        target: 0,
        actual: 1,
        percentage: 0
      };
    }
  });

  Object.values(breakdown).forEach(ch => {
    ch.percentage = ch.target > 0 ? (ch.actual / ch.target) * 100 : 0;
  });

  return Object.values(breakdown);
}

export function calcDailyRegistrations(registrations, startDate, durationDays) {
  const regList = Array.isArray(registrations) ? registrations : [];
  const start = startDate ? new Date(startDate) : new Date();
  const duration = Number(durationDays) > 0 ? Number(durationDays) : 7;
  const days = [];

  for (let i = 0; i < duration; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = regList.filter(r => {
      if (!r || !r.registeredAt) return false;
      const d = new Date(r.registeredAt);
      return !isNaN(d.getTime()) && d >= dayStart && d <= dayEnd;
    }).length;

    days.push({
      day: i + 1,
      label: `Day ${i + 1}`,
      date: dayStart.toISOString().slice(0, 10),
      count,
      cumulative: 0
    });
  }

  let total = 0;
  days.forEach(d => {
    total += d.count;
    d.cumulative = total;
  });

  return days;
}

export function calcBudgetSummary(budgetEntries) {
  const entries = Array.isArray(budgetEntries) ? budgetEntries : [];
  const totalPlanned = entries.reduce((sum, e) => sum + (Number(e?.plannedAmount) || 0), 0);
  const totalSpent = entries.reduce((sum, e) => sum + (Number(e?.actualSpent) || 0), 0);
  const remaining = totalPlanned - totalSpent;
  return { totalPlanned, totalSpent, remaining };
}

export function calcCostPerRegistration(totalSpent, registrationCount) {
  const count = Number(registrationCount) || 0;
  if (count <= 0) return null;
  return (Number(totalSpent) || 0) / count;
}

export function calcAmbassadorLeaderboard(ambassadors, registrations) {
  const ambList = Array.isArray(ambassadors) ? ambassadors : [];
  const regList = Array.isArray(registrations) ? registrations : [];

  return ambList
    .map(a => ({
      ...a,
      registrationCount: calcAmbassadorRegistrations(a.id, regList),
      share: calcAmbassadorShare(a.id, regList)
    }))
    .sort((a, b) => b.registrationCount - a.registrationCount);
}
