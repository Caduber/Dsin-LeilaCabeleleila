const sql = require('../db/dbClient');

// Lógica para buscar todos os agendamentos
const getAllAgendamentos = async (req, res) => {
    try {
        const response = await sql`SELECT * FROM agendamentos`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados.' });
    }
};

// Lógica para criar um novo agendamento com regra de negócio
const createAgendamento = async (req, res) => {
    const { data, hora, cli_id } = req.body;

    // Validação básica de entrada
    if (!data || !hora || !cli_id) {
        return res.status(400).json({ message: 'Os campos data, hora e cli_id são obrigatórios.' });
    }

    try {
        // --- REGRA DE NEGÓCIO ---
        // Verifica se já existe um agendamento para a mesma data e hora
        const agendamentoExistente = await sql`
            SELECT * FROM agendamentos WHERE age_data = ${data} AND age_hora = ${hora}
        `;

        if (agendamentoExistente.count > 0) {
            // Se já existir, retorna um erro de conflito (409)
            return res.status(409).json({ message: 'Já existe um agendamento para esta data e hora.' });
        }

        // Se não existir, insere o novo agendamento
        const response = await sql`
            INSERT INTO agendamentos (age_data, age_hora, cli_id) 
            VALUES (${data}, ${hora}, ${cli_id})
            RETURNING *
        `;
        
        // Retorna 201 Created com o agendamento criado
        res.status(201).json(response[0]);

    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao inserir agendamento no banco de dados.' });
    }
};

// Lógica para atualizar um agendamento
const updateAgendamento = async (req, res) => {
    const { id } = req.params;
    const { data, hora } = req.body;

    if (!data || !hora) {
        return res.status(400).json({ message: 'Os campos data e hora são obrigatórios para atualização.' });
    }

    try {
        const response = await sql`
            UPDATE agendamentos 
            SET age_data = ${data}, age_hora = ${hora} 
            WHERE age_id = ${id}
            RETURNING *
        `;

        if (response.count === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }

        res.json({ message: 'Agendamento atualizado com sucesso!', agendamento: response[0] });

    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao atualizar agendamento no banco de dados.' });
    }
};

module.exports = {
    getAllAgendamentos,
    createAgendamento,
    updateAgendamento
};
