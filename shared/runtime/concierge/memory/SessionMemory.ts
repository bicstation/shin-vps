import type { ConciergeSession } from "../contracts";

export class SessionMemory {
private readonly sessions = new Map<string, ConciergeSession>();

public get(sessionId: string): ConciergeSession | undefined {
return this.sessions.get(sessionId);
}

public save(session: ConciergeSession): void {
this.sessions.set(session.sessionId, session);
}

public clear(sessionId: string): void {
this.sessions.delete(sessionId);
}

public clearAll(): void {
this.sessions.clear();
}
}
