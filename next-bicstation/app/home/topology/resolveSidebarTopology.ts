// /home/maya/shin-vps/next-bicstation/app/home/topology/resolveSidebarTopology.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveSidebarTopologyProps = {

sidebar?: any

runtime?: any
}

/* ============================================================================
🔥 Resolve Sidebar Topology
============================================================================ */

export function
resolveSidebarTopology({

sidebar,

runtime,

}: ResolveSidebarTopologyProps) {

// ======================================================
// Sidebar Groups
// ======================================================

const cpu =


Array.isArray(
  sidebar?.cpu
)

  ? sidebar.cpu

  : []


const gpu =


Array.isArray(
  sidebar?.gpu
)

  ? sidebar.gpu

  : []


const maker =


Array.isArray(
  sidebar?.maker
)

  ? sidebar.maker

  : []


const usage =


Array.isArray(
  sidebar?.usage
)

  ? sidebar.usage

  : []


const memory =


Array.isArray(
  sidebar?.memory
)

  ? sidebar.memory

  : []


const storage =


Array.isArray(
  sidebar?.storage
)

  ? sidebar.storage

  : []


const device =


Array.isArray(
  sidebar?.device
)

  ? sidebar.device

  : []


// ======================================================
// Runtime Flags
// ======================================================

const hasSemanticRuntime =


!!runtime?.semantic_runtime


const hasAdaptiveRuntime =


!!runtime?.adaptive_runtime


// ======================================================
// Sidebar Sections
// ======================================================

const sections = [


// ====================================================
// Usage
// ====================================================

{

  type:
    'usage',

  visible:
    usage.length > 0,

  priority:
    1,

  count:
    usage.length,
},

// ====================================================
// GPU
// ====================================================

{

  type:
    'gpu',

  visible:
    gpu.length > 0,

  priority:
    2,

  count:
    gpu.length,
},

// ====================================================
// CPU
// ====================================================

{

  type:
    'cpu',

  visible:
    cpu.length > 0,

  priority:
    3,

  count:
    cpu.length,
},

// ====================================================
// Maker
// ====================================================

{

  type:
    'maker',

  visible:
    maker.length > 0,

  priority:
    4,

  count:
    maker.length,
},

// ====================================================
// Memory
// ====================================================

{

  type:
    'memory',

  visible:
    memory.length > 0,

  priority:
    5,

  count:
    memory.length,
},

// ====================================================
// Storage
// ====================================================

{

  type:
    'storage',

  visible:
    storage.length > 0,

  priority:
    6,

  count:
    storage.length,
},

// ====================================================
// Device
// ====================================================

{

  type:
    'device',

  visible:
    device.length > 0,

  priority:
    7,

  count:
    device.length,
},


]

// ======================================================
// Visible Sections
// ======================================================

const visibleSections =


sections.filter(
  (section) =>
    section.visible
)


// ======================================================
// Ordered Sections
// ======================================================

const orderedSections =


[...visibleSections].sort(

  (
    a,
    b
  ) =>

    a.priority
    -
    b.priority

)


// ======================================================
// Sidebar Summary
// ======================================================

const summary = {


totalSections:
  orderedSections.length,

totalItems:

  orderedSections.reduce(

    (
      total,
      section
    ) =>

      total
      +
      (
        section.count
        || 0
      ),

    0

  ),

hasSemanticRuntime,

hasAdaptiveRuntime,

cpu:
  cpu.length,

gpu:
  gpu.length,

maker:
  maker.length,

usage:
  usage.length,

memory:
  memory.length,

storage:
  storage.length,

device:
  device.length,


}

// ======================================================
// Return
// ======================================================

return {


sections:
  orderedSections,

summary,

runtime: {

  semantic:
    hasSemanticRuntime,

  adaptive:
    hasAdaptiveRuntime,
},

sidebar: {

  cpu,

  gpu,

  maker,

  usage,

  memory,

  storage,

  device,
},


}

}
