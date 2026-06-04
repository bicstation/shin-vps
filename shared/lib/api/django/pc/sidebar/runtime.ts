import {
  fetchSidebar,
} from './sidebar'

export async function
fetchSidebarRuntime() {

  const sidebar =
    await fetchSidebar()

  return {

    success: true,

    runtime_role:
      'sidebar-runtime',

    topology_layer:
      'navigation',

    observatory:
      'semantic-sidebar-runtime',

    semantic_authority:
      'backend',

    payload:
      sidebar,
  }
}