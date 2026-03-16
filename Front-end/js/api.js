/**
 * Integração com a API da Cabeleleila Leila
 * Back-end em http://localhost:8080
 */
const API_BASE = 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Erro ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const api = {
  // Clientes
  clientes: {
    listar: () => request('/clientes'),
    buscarPorCpf: (cpf) => request(`/clientes/${cpf}`),
    cadastrar: (nome, cpf, telefone) => request('/clientes/insert', {
      method: 'POST',
      body: { nome, cpf, telefone },
    }),
  },

  // Agendamentos
  agendamentos: {
    listarTodos: () => request('/agendamentos'),
    listarPorCliente: (cliId) => request(`/agendamentos/${cliId}`),
    criar: (data, hora, cli_id) => request('/agendamentos/insert', {
      method: 'POST',
      body: { data, hora, cli_id },
    }),
    atualizar: (ageId, data, hora) => request(`/agendamentos/update/${ageId}`, {
      method: 'PATCH',
      body: { data, hora },
    }),
    verificarSemana: (cliId) => request(`/agendamentos/verifSemana/${cliId}`),
    manterData: (ageId) => request(`/agendamentos/manter/${ageId}`),
  },
};
