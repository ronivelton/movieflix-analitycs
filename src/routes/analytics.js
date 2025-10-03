const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/dashboard', async (req, res) => {
  try {
    const totalMovies = await db.query('SELECT COUNT(*) as total FROM movies');
    const totalUsers = await db.query('SELECT COUNT(*) as total FROM users');
    const totalRatings = await db.query('SELECT COUNT(*) as total FROM ratings');
    const avgRating = await db.query('SELECT ROUND(AVG(rating), 2) as avg FROM ratings');
    const topMovies = await db.query('SELECT * FROM vw_top_movies LIMIT 5');
    
    res.json({
      success: true,
      data: {
        totalFilmes: parseInt(totalMovies.rows[0].total),
        totalUsuarios: parseInt(totalUsers.rows[0].total),
        totalAvaliacoes: parseInt(totalRatings.rows[0].total),
        mediaGeral: parseFloat(avgRating.rows[0].avg) || 0,
        topFilmes: topMovies.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar dashboard' });
  }
});

router.get('/genero', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vw_stats_genero');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
  }
});

router.get('/pais', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vw_stats_pais');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar dados' });
  }
});

module.exports = router;
