const express = require('express');

const router = express.Router();
const sql = require('../db/dbClient');

router.get('/', async (req, res) => {
        
    try {
        const response = await sql`SELECT * FROM clientes`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar clientes no banco de dados.' });
    }
});

router.post('/insert', async (req, res) => {

    try {
        const response = await sql`INSERT INTO clientes (cli_nome, cli_telefone) VALUES (${req.body.nome}, ${req.body.telefone})`;
        res.json({ message: 'Cliente inserido com sucesso!' });
    }catch(error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao inserir cliente no banco de dados.' });
    }
});


module.exports = router;