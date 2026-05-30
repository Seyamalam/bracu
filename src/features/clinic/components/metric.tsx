export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-center">
      <p className="font-semibold text-xl capitalize">{value}</p>
      <p className="text-white/70 text-xs">{label}</p>
    </div>
  );
}
