export default function AiSummary({ summary }: any) {
  if (!summary) return null

  const { p1, p2, p3, target } = summary

  const points = [p1, p2, p3].filter(Boolean)

  return (
    <div className="text-center mt-4">

      {points.map((p, i) => (
        <div key={i} className="text-sm">
          ✓ {p}
        </div>
      ))}

      {target && (
        <div className="text-xs text-orange-400 mt-2">
          ▶ {target}
        </div>
      )}

    </div>
  )
}