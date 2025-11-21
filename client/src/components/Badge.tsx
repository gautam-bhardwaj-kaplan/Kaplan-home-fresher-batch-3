import {type BadgeProps } from "../types";

export const Badge = ({ label, variant = 'blue' }: BadgeProps) => (
  <span className={`admin-badge admin-badge-${variant}`}>{label}</span>
);
