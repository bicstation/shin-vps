// /app/concierge/system/registry/AgentRegistry.ts

/* =========================================
🔥 SYSTEM AGENT REGISTRY
========================================= */

type Agent = {
  id: string
  name: string
  description?: string
  execute: (...args: any[]) => any
}

export class AgentRegistry {

  private agents: Record<string, Agent> = {}

  /* ======================================
  Register Agent
  ====================================== */
  register(agent: Agent) {
    this.agents[agent.id] = agent
  }

  /* ======================================
  Get Agent
  ====================================== */
  get(id: string): Agent | undefined {
    return this.agents[id]
  }

  /* ======================================
  List All
  ====================================== */
  list(): Agent[] {
    return Object.values(this.agents)
  }

  /* ======================================
  Execute Agent
  ====================================== */
  execute(id: string, ...args: any[]) {
    const agent = this.get(id)
    if (!agent) throw new Error(`Agent ${id} not found`)
    return agent.execute(...args)
  }
}