/**
 * Lightweight orchestrator event bus for WebSocket streaming
 */
import EventEmitter from 'events';

const orchestratorEvents = new EventEmitter();

/**
 * Emit an orchestrator event with a timestamp for downstream listeners.
 * @param {Object} payload
 */
export const emitOrchestratorEvent = (payload) => {
  orchestratorEvents.emit('event', {
    ts: new Date().toISOString(),
    ...payload,
  });
};

export { orchestratorEvents };
