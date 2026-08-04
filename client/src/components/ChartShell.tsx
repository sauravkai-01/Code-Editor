export function ChartShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

