const request = require('supertest');
const app = require('../server');

describe('POST /auth/login', () => {
  it('refuse sans email ni mot de passe', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('refuse avec des identifiants incorrects', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inexistant@test.com', password: 'mauvais' });
    expect(res.statusCode).toBe(401);
  });

  it('refuse sans mot de passe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/register', () => {
  it('refuse si des champs sont manquants', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'nouveau@test.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /auth/me', () => {
  it('refuse sans token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('refuse avec un token invalide', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token_invalide');
    expect(res.statusCode).toBe(401);
  });
});
