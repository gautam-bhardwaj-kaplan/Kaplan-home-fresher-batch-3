import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getAnalyticsOverview,
  type AnalyticsOverviewResponse,
} from '../services/admin.analytics';
import { MetricCard } from '../components/MetricCard';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getHeatmapColor, CHART_COLORS, formatDateShort } from '../components/helpers/dateUtils';
import '../styles/AdminDashboard.css';

export const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getAnalyticsOverview(
          dateFrom || undefined,
          dateTo || undefined
        );
        setData(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dateFrom, dateTo]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={`Error: ${error}`} />;
  }

  if (!data) {
    return null;
  }

  const { overview, dailyStats, categoryBreakdown, streakDistribution, weeklyHeatmap } = data;

  const metricCards = [
    { label: 'Total Users', value: overview.totalUsers.toLocaleString() },
    { label: 'Participation Rate', value: `${overview.participationRate.toFixed(1)}%` },
    { label: 'Questions Live', value: overview.totalQuestions.toLocaleString() },
    { label: 'Avg Accuracy', value: `${overview.averageAccuracy.toFixed(1)}%` },
    { label: 'Total Attempts', value: overview.totalAttempts.toLocaleString() },
    { label: 'Badges Awarded', value: overview.badgesAwarded.toLocaleString() },
  ];

  const firstRowCards = metricCards.slice(0, 3);
  const secondRowCards = metricCards.slice(3);

  const dailyEngagementData = dailyStats.map((stat) => ({
    date: formatDateShort(stat.date),
    'Active Users': stat.activeUsers,
    'Total Attempts': stat.totalAttempts,
    'Accuracy %': stat.accuracy,
  }));

  const categoryData = categoryBreakdown.map((cat) => ({
    category: cat.category,
    accuracy: cat.accuracy,
    attempts: cat.totalAttempts,
  }));

  const streakData = streakDistribution.map((item) => ({
    range: item.range,
    count: item.count,
  }));

  const heatmapData = weeklyHeatmap.map((week) => ({
    week: formatDateShort(week.week),
    accuracy: Number(week.accuracy.toFixed(1)),
    attempts: week.totalAttempts,
    questions: week.totalQuestions,
  }));

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      </div>

      <div className="admin-dashboard-filters">
        <div className="admin-dashboard-filter-group">
          <label>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="admin-dashboard-filter-group">
          <label>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="admin-dashboard-filter-actions">
          <button
            className="admin-secondary"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            disabled={!dateFrom && !dateTo}
          >
            Clear Range
          </button>
        </div>
      </div>

      <div className="admin-dashboard-cards">
        <div className="admin-dashboard-cards-row">
          {firstRowCards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} />
          ))}
        </div>
        <div className="admin-dashboard-cards-row">
          {secondRowCards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} />
          ))}
        </div>
      </div>

      <div className="admin-dashboard-charts">
        <div className="admin-dashboard-chart-container">
          <h2 className="admin-dashboard-chart-title">Daily Engagement Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Active Users"
                stroke="#4F75FE"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Total Attempts"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Accuracy %"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-dashboard-chart-container">
          <h2 className="admin-dashboard-chart-title">Category Performance Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="accuracy" fill="#4F75FE" name="Accuracy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-dashboard-chart-container">
          <h2 className="admin-dashboard-chart-title">User Streak Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#4F75FE" name="Users">
                {streakData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-dashboard-chart-container">
          <h2 className="admin-dashboard-chart-title">Weekly Question Performance Heatmap</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={heatmapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="week" type="category" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
              />
              <Bar dataKey="accuracy" name="Accuracy %">
                {heatmapData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={getHeatmapColor(item.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
