const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        m.*,
        COUNT(r.id) AS ratings_count,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
      FROM movies m
      LEFT JOIN ratings r ON m.id = r.movie_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao listar filmes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await db.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    
    if (movie.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Filme não encontrado' });
    }

    const ratings = await db.query('SELECT * FROM ratings WHERE movie_id = $1', [req.params.id]);
    const avg = await db.query('SELECT COALESCE(ROUND(AVG(rating), 1), 0) as avg FROM ratings WHERE movie_id = $1', [req.params.id]);

    res.json({
      success: true,
      data: {
        ...movie.rows[0],
        ratings: ratings.rows,
        ratingsCount: ratings.rows.length,
        averageRating: parseFloat(avg.rows[0].avg)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar filme' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, genre, year, director, description } = req.body;

    if (!title || !genre || !year) {
      return res.status(400).json({ success: false, message: 'Título, gênero e ano são obrigatórios' });
    }

    const result = await db.query(
      'INSERT INTO movies (title, genre, year, director, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, genre, parseInt(year), director || 'Não informado', description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Filme cadastrado!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao cadastrar filme' });
  }
});

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, userName } = req.body;

    // Verifica se filme existe
    const movieCheck = await db.query('SELECT id FROM movies WHERE id = $1', [req.params.id]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Filme não encontrado' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Nota deve ser entre 1 e 5' });
    }

    // Cria usuário se não existir
    let userId;
    const name = userName || 'Anônimo';
    
    const userCheck = await db.query('SELECT id FROM users WHERE name = $1 LIMIT 1', [name]);
    
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
    } else {
      const newUser = await db.query(
        'INSERT INTO users (name, country) VALUES ($1, $2) RETURNING id',
        [name, 'Brasil']
      );
      userId = newUser.rows[0].id;
    }

    // Insere avaliação
    const result = await db.query(
      'INSERT INTO ratings (movie_id, user_id, rating) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, userId, parseFloat(rating)]
    );

    res.status(201).json({
      success: true,
      message: 'Avaliação registrada!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao avaliar filme' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM movies WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Filme não encontrado' });
    }

    res.json({ success: true, message: 'Filme removido!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover filme' });
  }
});

module.exports = router;
