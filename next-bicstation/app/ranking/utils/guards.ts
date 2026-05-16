// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/guards.ts// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/guards.ts

/* =========================================
🔥 Is Object
========================================= */

export function
isObject(

  value: unknown

): value is Record<string, any> {

  return (

    typeof value
      === 'object'

    && value !== null

    && !Array.isArray(value)

  )
}

/* =========================================
🔥 Is Non Empty String
========================================= */

export function
isNonEmptyString(

  value: unknown

): value is string {

  return (

    typeof value
      === 'string'

    && value.trim().length > 0

  )
}

/* =========================================
🔥 Is Number
========================================= */

export function
isNumber(

  value: unknown

): value is number {

  return (

    typeof value
      === 'number'

    && !Number.isNaN(value)

  )
}

/* =========================================
🔥 Is Array
========================================= */

export function
isArray<T = any>(

  value: unknown

): value is T[] {

  return Array.isArray(
    value
  )
}

/* =========================================
🔥 Has Slug
========================================= */

export function
hasSlug(

  value: any

): boolean {

  return isNonEmptyString(
    value?.slug
  )
}

/* =========================================
🔥 Has Name
========================================= */

export function
hasName(

  value: any

): boolean {

  return isNonEmptyString(
    value?.name
  )
}

/* =========================================
🔥 Is Valid Attribute
========================================= */

export function
isValidAttribute(

  value: any

): boolean {

  return (

    isObject(value)

    && hasSlug(value)

    && hasName(value)

  )
}

/* =========================================
🔥 Is Valid Product
========================================= */

export function
isValidProduct(

  value: any

): boolean {

  return (

    isObject(value)

    && isNonEmptyString(
      value?.unique_id
    )

  )
}

/* =========================================
🔥 Is Empty Array
========================================= */

export function
isEmptyArray(

  value: unknown

) {

  return (

    !Array.isArray(value)

    || value.length === 0

  )
}

/* =========================================
🔥 Is Runtime Success
========================================= */

export function
isRuntimeSuccess(

  runtime: any

) {

  return (

    isObject(runtime)

    && runtime?.success
      === true

  )
}