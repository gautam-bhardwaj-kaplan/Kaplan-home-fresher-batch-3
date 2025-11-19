import { type ErrorAlertProps } from "../types";

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <div style={{ color: '#8a1a1a' }}>
    {message}
  </div>
);
