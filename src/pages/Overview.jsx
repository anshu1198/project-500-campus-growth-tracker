import React from 'react';
import {
  Users,
  Target,
  School,
  Award,
  IndianRupee,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useCampaign } from '../context/CampaignContext';
import {
  calcTotalRegistrations,
  calcProgressPercent,
  calcUniqueColleges,
  calcActiveAmbassadors,
  calcBudgetSummary,
  calcDailyRegistrations,
  calcChannelBreakdown,
  calcCostPerRegistration
} from '../utils/metrics';
import { generateInsights } from '../utils/insights';
import KPICard from '../components/KPICard';
import ProgressBar from '../components/ProgressBar';

export default function Overview() {
  const { registrations, ambassadors, channels, budget, settings } = useCampaign();

  const totalRegs = calcTotalRegistrations(registrations);
  const target = settings?.registrationTarget || 500;
  const progressPct = calcProgressPercent(registrations, target);
  const uniqueColleges = calcUniqueColleges(registrations);
  const activeAmbs = calcActiveAmbassadors(ambassadors);
  const { totalPlanned, totalSpent, remaining } = calcBudgetSummary(budget);
  const costPerReg = calcCostPerRegistration(totalSpent, totalRegs);

  // Daily registrations (7 days)
  const dailyData = calcDailyRegistrations(
    registrations,
    settings?.startDate,
    settings?.campaignDuration || 7
  );

  // Add illustrative daily benchmark target (e.g. 71/day to reach 500 in 7 days)
  const dailyTargetPace = Math.round(target / (settings?.campaignDuration || 7));
  const trendChartData = dailyData.map((d) => ({
    ...d,
    targetBenchmark: dailyTargetPace * d.day // illustrative cumulative benchmark
  }));

  // Channel breakdown
  const channelBreakdown = calcChannelBreakdown(registrations, channels);
  const channelChartData = channelBreakdown.map((ch) => ({
    name: ch.channelName,
    Actual: ch.actual,
    Target: ch.target,
    id: ch.channelId
  }));

  // Insights
  const insights = generateInsights(registrations, ambassadors, channels, settings);

  return (
    <div className="overview-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Overview</h1>
          <p className="page-subtitle">
            Executive performance metrics for &ldquo;{settings?.campaignName}&rdquo;
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="badge badge-simulation">Simulated Environment</span>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Registrations"
          value={totalRegs}
          subtext={`Target: ${target} students`}
          icon={Users}
          variant="accent"
        />

        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', marginBottom: 'var(--space-2)' }}>
            <div className="kpi-icon info" style={{ width: 36, height: 36 }}>
              <Target size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="kpi-label">Target Progress</div>
              <div className="kpi-value">{progressPct.toFixed(1)}%</div>
            </div>
          </div>
          <ProgressBar value={totalRegs} max={target} variant="accent" size="default" />
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {totalRegs} of {target} goal
          </div>
        </div>

        <KPICard
          label="Campuses Reached"
          value={uniqueColleges}
          subtext="Participating engineering colleges"
          icon={School}
          variant="info"
        />

        <KPICard
          label="Active Ambassadors"
          value={activeAmbs}
          subtext={`Total roster: ${ambassadors.length}`}
          icon={Award}
          variant="warning"
        />

        <KPICard
          label="Budget Overview"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          subtext={`Remaining: ₹${remaining.toLocaleString('en-IN')} of ₹${totalPlanned.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          variant="primary"
          changeText={costPerReg !== null ? `₹${costPerReg.toFixed(1)} / reg` : 'No spend recorded'}
          isPositive={remaining >= 0}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Registration Trend Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Registration Pace & Cumulative Growth</h2>
              <p className="card-subtitle">
                Daily new registrations vs cumulative progress towards {target}
              </p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={290}>
              <ComposedChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                  label={{ value: 'Daily Registrations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--color-text-secondary)', fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                  label={{ value: 'Cumulative Total', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'var(--color-text-secondary)', fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Daily Registrations (Actual)"
                  fill="var(--color-info)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative (Actual)"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-accent)' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="targetBenchmark"
                  name="Target Benchmark Pace"
                  stroke="var(--color-text-muted)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Performance Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Channel Registration Performance</h2>
              <p className="card-subtitle">
                Unique registrations attributed per discovery channel vs target
              </p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={channelChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={11} interval={0} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="Actual"
                  name="Actual Registrations"
                  fill="var(--color-accent)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Target"
                  name="Planned Target"
                  fill="var(--color-border)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rule-Based Growth Insights Panel */}
      <div className="card insights-panel">
        <div className="card-header" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Lightbulb size={20} style={{ color: 'var(--color-accent-hover)' }} />
            <h2 className="card-title">Growth Insights & Observations</h2>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Deterministic rule-based analysis (No AI/ML inference)
          </span>
        </div>
        <div className="insights-list">
          {insights.map((insight, idx) => {
            const isWarning = insight.includes('fewer') || insight.includes('no attributed') || insight.includes('preliminary');
            const isSuccess = insight.includes('largest share') || insight.includes('reached');
            return (
              <div key={idx} className="insight-item">
                {isSuccess && <CheckCircle className="insight-icon" />}
                {isWarning && <AlertTriangle className="insight-icon warning" />}
                {!isSuccess && !isWarning && <Info className="insight-icon info" />}
                <span>{insight}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
