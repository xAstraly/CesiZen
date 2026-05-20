const request = require('supertest');
const app = require('../server');

describe('GET /stress/events', () => {
  it('retourne la liste des événements de stress', async () => {
    const res = await request(app).get('/stress/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('chaque événement a un label et des points', async () => {
    const res = await request(app).get('/stress/events');
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('label');
      expect(res.body[0]).toHaveProperty('points');
    }
  });
});

describe('POST /stress/diagnostics (sans token)', () => {
  it('refuse sans authentification', async () => {
    const res = await request(app)
      .post('/stress/diagnostics')
      .send({ event_ids: [1, 2], total_score: 100, risk_level: 'faible' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /stress/history (sans token)', () => {
  it('refuse sans authentification', async () => {
    const res = await request(app).get('/stress/history');
    expect(res.statusCode).toBe(401);
  });
});
