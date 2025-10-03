const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Conexão com o banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'movieflix',
  password: process.env.DB_PASSWORD || 'movieflix123',
  database: process.env.DB_NAME || 'movieflix_db',
});

// Ler arquivo CSV
function lerCSV(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'utf-8');
  const linhas = conteudo.split('\n').filter(l => l.trim());
  const colunas = linhas[0].split(',');
  
  return linhas.slice(1).map(linha => {
    const valores = linha.split(',');
    const obj = {};
    colunas.forEach((col, i) => {
      obj[col.trim()] = valores[i] ? valores[i].trim() : '';
    });
    return obj;
  });
}

async function executarETL() {
  try {

    await pool.query('TRUNCATE TABLE ratings, movies, users RESTART IDENTITY CASCADE');
    
    const usuarios = lerCSV(path.join(__dirname, '../data-lake/users.csv'));
    
    for (const user of usuarios) {
      await pool.query(
        'INSERT INTO users (name, email, age, country) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, parseInt(user.age), user.country]
      );
    }

    const filmes = lerCSV(path.join(__dirname, '../data-lake/movies.csv'));
    const mapaFilmes = {};
    
    for (const filme of filmes) {
      const result = await pool.query(
        'INSERT INTO movies (title, genre, year, director, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [filme.title, filme.genre, parseInt(filme.year), filme.director, filme.description]
      );
      mapaFilmes[filme.title] = result.rows[0].id;
    }

    const avaliacoes = lerCSV(path.join(__dirname, '../data-lake/ratings.csv'));
    
    for (const avaliacao of avaliacoes) {
      const usuario = await pool.query(
        'SELECT id FROM users WHERE name = $1 LIMIT 1',
        [avaliacao.user_name]
      );
      
      if (usuario.rows.length === 0) continue;
      
      const userId = usuario.rows[0].id;
      const movieId = mapaFilmes[avaliacao.movie_title];
      
      if (!movieId) continue;
      
      await pool.query(
        'INSERT INTO ratings (movie_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [movieId, userId, parseFloat(avaliacao.rating), avaliacao.comment]
      );
    }


    console.log('\n📈 Estatísticas:');
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM movies) as filmes,
        (SELECT COUNT(*) FROM users) as usuarios,
        (SELECT COUNT(*) FROM ratings) as avaliacoes,
        (SELECT ROUND(AVG(rating), 2) FROM ratings) as media
    `);
    
    console.log(`   Filmes: ${stats.rows[0].filmes}`);
    console.log(`   Usuários: ${stats.rows[0].usuarios}`);
    console.log(`   Avaliações: ${stats.rows[0].avaliacoes}`);
    console.log(`   Média: ${stats.rows[0].media}`);
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

executarETL();
