const express = require('express');
const NodeCache = require('node-cache');
const app = express();
const cache = new NodeCache();

const resultados = {
    pessoas: [{ id: 1, nome: 'Marcelo' }, { id: 2, nome: 'João' }, { id: 3, nome: 'Maria' }],
    carros: [{ id: 1, modelo: 'Fusca' }, { id: 2, modelo: 'Gol' }, { id: 3, modelo: 'Palio' }],
    animais: [{ id: 1, nome: 'Cachorro' }, { id: 2, nome: 'Gato' }, { id: 3, nome: 'Papagaio' }],
};

app.use(express.json());

// Middleware para cache com ETag
function cacheMiddleware(req, res, next) {
    const route = req.originalUrl;
    const cachedData = cache.get(route);
    if (cachedData) {
        const etag = `"${JSON.stringify(cachedData)}"`;
        res.setHeader('ETag', etag);
        if (req.headers['if-none-match'] === etag) {
            res.status(304).send();
            return;
        }
    }
    next();
}

// Rota para listar todos os itens
app.get('/:recurso', cacheMiddleware, (req, res) => {
    const recurso = req.params.recurso;
    if (resultados[recurso]) {
        cache.set(req.originalUrl, resultados[recurso]);
        res.json(resultados[recurso]);
    } else {
        res.status(404).json({ erro: 'Recurso não encontrado' });
    }
});

// Rota para consultar um item individual
app.get('/:recurso/:id', cacheMiddleware, (req, res) => {
    const recurso = req.params.recurso;
    const id = parseInt(req.params.id);
    if (resultados[recurso]) {
        const item = resultados[recurso].find(item => item.id === id);
        if (item) {
            cache.set(req.originalUrl, item);
            res.json(item);
        } else {
            res.status(404).json({ erro: 'Item não encontrado' });
        }
    } else {
        res.status(404).json({ erro: 'Recurso não encontrado' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});