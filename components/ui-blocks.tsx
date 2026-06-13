export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black text-orange-700">{title}</h1>{subtitle && <p className="mt-1 muted">{subtitle}</p>}</div>{action}</div>;
}
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="card p-8 text-center muted">{children}</div>;
}
