const express = require('express');

const sql = require('../db/dbClient');

const getAllAgendamentos = async (req,res) => {
    try {
        const response = await sql`SELECT * FROM agendamentos`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados.' });
    }
};

const getAgendamentos = async (req,res) => {
    try {
        const response = await sql`SELECT * FROM agendamentos WHERE cli_id = ${req.params.id}`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados' });
    }
}

const insert = async (req, res)=> {
    try {
        const response = await sql`INSERT INTO agendamentos (age_data, age_hora, cli_id) VALUES (${req.body.data}, ${req.body.hora}, ${req.body.cli_id})`;

    } catch(error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao inserir agendamento no banco de dados' })
    }
}

const patch =  async (req, res) => {
    
    try {
        const response = await sql`UPDATE agendamentos SET age_data = ${req.body.data}, age_hora = ${req.body.hora} WHERE age_id = ${req.params.id}`;
        res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao atualizar agendamento no banco de dados.' });
    }
}

module.exports = {
    getAllAgendamentos,
    getAgendamentos,
    insert,
    patch
}

