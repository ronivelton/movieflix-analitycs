const { Pool } = require('pg');

// Conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'movieflix',
  password: process.env.DB_PASSWORD || 'movieflix123',
  database: process.env.DB_NAME || 'movieflix_db',
});

// Testa conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no PostgreSQL:', err);
});

module.exports = pool;
