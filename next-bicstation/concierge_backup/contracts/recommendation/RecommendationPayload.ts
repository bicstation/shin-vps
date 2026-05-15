// /app/concierge/contracts/recommendation/RecommendationPayload.ts

export type RecommendationPayload = {

  unique_id?: string

  name?: string

  shortTitle?: string

  image_url?: string

  price?: number

  maker?: string

  score?: number

  reasoning?: string

  grouped_attributes?: Record<
    string,
    any[]
  >
}