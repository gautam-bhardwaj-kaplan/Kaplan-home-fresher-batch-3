import { type MetricCardProps } from "../types";

export const MetricCard = ({ label, value }: MetricCardProps) => (
  <div className="admin-dashboard-card">
    <div className="admin-dashboard-card-label">{label}</div>
    <div className="admin-dashboard-card-value">{value}</div>
  </div>
);
