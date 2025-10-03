CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    director VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    age INTEGER,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW vw_top_movies AS
SELECT 
    m.title,
    m.genre,
    COUNT(r.id) AS total_avaliacoes,
    ROUND(AVG(r.rating), 2) AS media
FROM movies m
LEFT JOIN ratings r ON m.id = r.movie_id
GROUP BY m.id, m.title, m.genre
ORDER BY media DESC, total_avaliacoes DESC;

CREATE VIEW vw_stats_genero AS
SELECT 
    m.genre AS genero,
    COUNT(DISTINCT m.id) AS total_filmes,
    COUNT(r.id) AS total_avaliacoes,
    ROUND(AVG(r.rating), 2) AS media
FROM movies m
LEFT JOIN ratings r ON m.id = r.movie_id
GROUP BY m.genre
ORDER BY media DESC;

CREATE VIEW vw_stats_pais AS
SELECT 
    u.country AS pais,
    COUNT(DISTINCT u.id) AS total_usuarios,
    COUNT(r.id) AS total_avaliacoes,
    ROUND(AVG(r.rating), 2) AS media
FROM users u
LEFT JOIN ratings r ON u.id = r.user_id
WHERE u.country IS NOT NULL
GROUP BY u.country
ORDER BY total_avaliacoes DESC;
