import ScoreRadarChart from '@/shared/components/molecules/ScoreRadarChart'

export default function ProductRadar({ product }: any) {
  return (
    <div className="mt-6 flex justify-center">
      <ScoreRadarChart
        score_cpu={product.score_cpu}
        score_gpu={product.score_gpu}
        score_cost={product.score_cost}
        score_portable={product.score_portable}
        score_ai={product.score_ai}
      />
    </div>
  )
}