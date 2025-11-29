import WebSocket from 'ws';

// Lightweight WebSocket client used to submit CIP-68 carbon token payloads to the Mausami network (formerly Hydra slot)

class HydraClient {
  constructor(url) {
    this.url = url;
    this.connected = false;
    this.ws = null;
    if (url) this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.on('open', () => {
        this.connected = true;
        console.log('Hydra connected');
      });
      this.ws.on('close', () => (this.connected = false));
      this.ws.on('error', (err) => console.warn('Hydra error', err.message));
    } catch (err) {
      console.warn('Hydra connection failed', err.message);
    }
  }

  async submitToHydra(payload) {
    if (!this.url) throw new Error('Hydra not configured');
    if (!this.connected) this.connect();
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('Hydra not connected'));
      }
      const msg = JSON.stringify({ action: 'submit', payload });
      this.ws.send(msg, (err) => {
        if (err) return reject(err);
      });
      this.ws.once('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          resolve(parsed.txId || parsed);
        } catch (e) {
          resolve(data.toString());
        }
      });
      setTimeout(() => resolve(null), 5000);
    });
  }
}

const hydraClient = new HydraClient(process.env.HYDRA_WS_URL);
export default hydraClient;
