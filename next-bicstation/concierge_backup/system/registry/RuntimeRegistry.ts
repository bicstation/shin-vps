// /app/concierge/system/registry/RuntimeRegistry.ts

/* =========================================
🔥 SYSTEM RUNTIME REGISTRY
========================================= */

type RuntimeModule = {
  id: string
  name: string
  execute: (...args: any[]) => any
}

export class RuntimeRegistry {

  private modules: Record<string, RuntimeModule> = {}

  /* ======================================
  Register Module
  ====================================== */
  register(module: RuntimeModule) {
    this.modules[module.id] = module
  }

  /* ======================================
  Get Module
  ====================================== */
  get(id: string): RuntimeModule | undefined {
    return this.modules[id]
  }

  /* ======================================
  List All Modules
  ====================================== */
  list(): RuntimeModule[] {
    return Object.values(this.modules)
  }

  /* ======================================
  Execute Module
  ====================================== */
  execute(id: string, ...args: any[]) {
    const module = this.get(id)
    if (!module) throw new Error(`Runtime module ${id} not found`)
    return module.execute(...args)
  }
}