type Task<T> = (signal: AbortSignal) => Promise<T>;

type QueueItem<T> = {
  task: Task<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  priority: number;
  controller: AbortController;
  timeoutMs?: number;
};

export class AdvancedQueue {
  private queue: QueueItem<any>[] = [];
  private activeCount = 0;

  constructor(private concurrency: number) {}

  add<T>(
    task: Task<T>,
    options?: { priority?: number; timeoutMs?: number }
  ): Promise<T> {
    const controller = new AbortController();

    return new Promise((resolve, reject) => {
      const item: QueueItem<T> = {
        task,
        resolve,
        reject,
        priority: options?.priority ?? 0,
        controller,
        timeoutMs: options?.timeoutMs,
      };

      this.queue.push(item);
      this.queue.sort((a, b) => b.priority - a.priority);

      this.next();
    });
  }

  private next() {
    if (this.activeCount >= this.concurrency) return;
    if (this.queue.length === 0) return;

    const item = this.queue.shift()!;
    this.run(item);
  }

  private async run<T>(item: QueueItem<T>) {
    this.activeCount++;

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      if (item.timeoutMs) {
        timeoutId = setTimeout(() => {
          item.controller.abort();
        }, item.timeoutMs);
      }

      const result = await item.task(item.controller.signal);
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      this.activeCount--;
      this.next();
    }
  }
}

export const requestQueue = new AdvancedQueue(3);