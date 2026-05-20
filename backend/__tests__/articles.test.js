const request = require('supertest');
const app = require('../server');

describe('GET /articles', () => {
  it('retourne un tableau d\'articles', async () => {
    const res = await request(app).get('/articles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('retourne un tableau de catégories', async () => {
    const res = await request(app).get('/articles/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('retourne 404 pour un article inexistant', async () => {
    const res = await request(app).get('/articles/99999');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /articles (sans token)', () => {
  it('refuse la création sans authentification', async () => {
    const res = await request(app)
      .post('/articles')
      .send({ titre: 'Test', contenu: 'Contenu test', categorie: 'Santé' });
    expect(res.statusCode).toBe(401);
  });
});
