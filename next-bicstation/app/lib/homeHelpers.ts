export function getGpuDescription(
  name: string
) {

  const lower =
    name?.toLowerCase?.() || ''

  if (
    lower.includes('4090')
  ) {
    return '4K / AI / ultra gaming'
  }

  if (
    lower.includes('4080')
  ) {
    return 'high-end gaming semantic'
  }

  if (
    lower.includes('4070')
  ) {
    return '1440p gaming optimized'
  }

  if (
    lower.includes('4060')
  ) {
    return 'gaming balance semantic'
  }

  return 'GPU performance semantic'
}

export function getMakerDescription(
  name: string
) {

  const lower =
    name?.toLowerCase?.() || ''

  if (
    lower.includes('asus')
  ) {
    return 'gaming / creatorブランド'
  }

  if (
    lower.includes('dell')
  ) {
    return 'business stability semantic'
  }

  if (
    lower.includes('hp')
  ) {
    return 'balance workstation semantic'
  }

  if (
    lower.includes('lenovo')
  ) {
    return 'workload productivity semantic'
  }

  return 'brand recommendation semantic'
}


export function getSemanticDifference(
  product: any
) {

  const grouped =
    product
      ?.grouped_attributes
      || {}

  const usage =
    grouped
      ?.usage?.[0]
      ?.name

  const gpu =
    grouped
      ?.gpu?.[0]
      ?.name

  const maker =
    grouped
      ?.maker?.[0]
      ?.name

  return {
    usage,
    gpu,
    maker,
  }
}