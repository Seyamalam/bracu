export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-center shadow-sm">
      <p className="font-semibold text-xl text-foreground capitalize">
        {value}
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
