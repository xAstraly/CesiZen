require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const breathingRoutes = require('./routes/breathing');
const articlesRoutes = require('./routes/articles');
const emotionsRoutes = require('./routes/emotions');
const stressRoutes = require('./routes/stress');
const adminRoutes = require('./routes/admin');
const detenteRoutes = require('./routes/detente');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/breathing', breathingRoutes);
app.use('/articles', articlesRoutes);
app.use('/emotions', emotionsRoutes);
app.use('/stress', stressRoutes);
app.use('/admin', adminRoutes);
app.use('/detente', detenteRoutes);

app.get('/', (req, res) => res.json({ message: 'CesiZen API en ligne' }));

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
}

module.exports = app;
