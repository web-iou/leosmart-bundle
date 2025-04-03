type EventHandler = (...args: any[]) => void;

interface EventMap {
  [eventName: string]: EventHandler[];
}

class EventBus {
  private events: EventMap = {};

  on(event: string, callback: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventHandler): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`事件处理错误 ${event}:`, error);
      }
    });
  }

  once(event: string, callback: EventHandler): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}

export const eventBus = new EventBus();

export const EVENT_NAMES = {
  LOGOUT_REQUIRED: 'logout_required',
  NAVIGATION_TO_LOGIN: 'navigation_to_login',
};

export default eventBus; 