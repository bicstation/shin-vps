// shared/lib/api/django/pc/sidebar/contracts.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SidebarAttribute = {

  id?: number

  name: string

  slug: string

  count?: number

  icon?: string

  color?: string

  semantic_role?:
    | 'highlight'
    | 'primary'
    | 'secondary'
    | 'supportive'

  semantic_weight?: number
}

/* =========================================
🔥 Sidebar Group
========================================= */

export type SidebarGroup = {

  key: string

  label?: string

  title?: string

  description?: string

  items: SidebarAttribute[]
}

/* =========================================
🔥 Sidebar Payload
========================================= */

export type SidebarPayload = {

  usage?: SidebarAttribute[]

  gpu?: SidebarAttribute[]

  cpu?: SidebarAttribute[]

  maker?: SidebarAttribute[]

  memory?: SidebarAttribute[]

  storage?: SidebarAttribute[]

  device?: SidebarAttribute[]
}

/* =========================================
🔥 Sidebar Response
========================================= */

export type SidebarResponse = {

  success: boolean

  sidebar: SidebarPayload

  semantic_schema_version?: number
}