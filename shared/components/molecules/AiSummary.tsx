// /shared/components/molecules/AiSummary.tsx

type Props = {
  p1?: string;
  p2?: string;
  p3?: string;
  target?: string;
};

export default function AiSummary({ p1, p2, p3, target }: Props) {

  const points = [p1, p2, p3].filter(Boolean);

  if (!points.length && !target) return null;

  return (
    <div className="mt-4 mb-2 text-center">

      <div className="space-y-1 text-sm text-gray-200">
        {points.map((p, i) => (
          <div key={i}>✓ {p}</div>
        ))}
      </div>

      {target && (
        <div className="mt-2 text-xs text-orange-400 font-semibold">
          ▶ {target}
        </div>
      )}

    </div>
  );
}