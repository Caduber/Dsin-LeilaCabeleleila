const alerta = document.getElementById('alerta');
const filtroCliente = document.getElementById('filtroCliente');
const corpo = document.getElementById('corpoAgendamentos');
const modalEditar = document.getElementById('modalEditar');
let agendamentos = [];
let clientes = [];
let ageIdEditando = null;

function mostrarAlerta(msg, tipo) {
  alerta.textContent = msg;
  alerta.className = 'alerta alerta-' + tipo;
  alerta.style.display = 'block';
}
function esconderAlerta() {
  alerta.style.display = 'none';
}

function formatarData(str) {
  if (str == null || str === '') return '—';
  const onlyDate = String(str).split('T')[0].split(' ')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) return '—';
  const d = new Date(onlyDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function nomeCliente(cliId) {
  const c = clientes.find(x => x.cli_id === cliId);
  if (c) {
    return c.cli_nome;
  }
  return '—';
}
function cpfCliente(cliId) {
  const c = clientes.find(x => x.cli_id === cliId);
  if (c) {
    return c.cli_cpf || '—';
  }
  return '—';
}
function telefoneCliente(cliId) {
  const c = clientes.find(x => x.cli_id === cliId);
  if (c) {
    return c.cli_telefone;
  }
  return '—';
}

function filtrar() {
  const cliId = filtroCliente.value;
  let lista;
  if (cliId) {
    lista = agendamentos.filter(a => String(a.cli_id) === cliId);
  } else {
    lista = agendamentos;
  }
  lista.sort((a, b) => {
    const da = (a.age_data || '') + (a.age_hora || '');
    const db = (b.age_data || '') + (b.age_hora || '');
    return da.localeCompare(db);
  });
  render(lista);
}

function render(lista) {
  if (lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6" class="msg-vazia">Nenhum agendamento encontrado.</td></tr>';
    return;
  }
  corpo.innerHTML = lista.map(a => `
    <tr>
      <td>${formatarData(a.age_data)}</td>
      <td>${a.age_hora || '—'}</td>
      <td>${nomeCliente(a.cli_id)}</td>
      <td>${cpfCliente(a.cli_id)}</td>
      <td>${telefoneCliente(a.cli_id)}</td>
      <td><button type="button" class="btn btn-secundario" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" data-age-id="${a.age_id}" data-data="${a.age_data}" data-hora="${a.age_hora || ''}">Alterar</button></td>
    </tr>
  `).join('');

  corpo.querySelectorAll('[data-age-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      ageIdEditando = btn.dataset.ageId;
      const dataBruta = btn.dataset.data || '';
      const dataOnly = String(dataBruta).split('T')[0].split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataOnly)) {
        document.getElementById('editData').value = dataOnly;
      } else {
        document.getElementById('editData').value = '';
      }
      document.getElementById('editHora').value = btn.dataset.hora || '';
      modalEditar.style.display = 'flex';
    });
  });
}

function mesmaSemana(dataStr1, dataStr2) {
  const d1 = new Date(String(dataStr1).split('T')[0] + 'T12:00:00');
  const d2 = new Date(String(dataStr2).split('T')[0] + 'T12:00:00');
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
  const seg = 86400000;
  const segSemana = 7 * seg;
  const ini1 = d1.getTime() - (d1.getDay() * seg);
  const ini2 = d2.getTime() - (d2.getDay() * seg);
  return Math.abs(ini1 - ini2) < segSemana;
}

function clientesComMultiplosNaSemana() {
  const porCliente = {};
  agendamentos.forEach(a => {
    const id = a.cli_id;
    if (!porCliente[id]) porCliente[id] = [];
    porCliente[id].push(a);
  });
  const resultado = [];
  Object.keys(porCliente).forEach(cliId => {
    const list = porCliente[cliId];
    if (list.length < 2) return;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (mesmaSemana(list[i].age_data, list[j].age_data)) {
          resultado.push({ cliId, nome: nomeCliente(parseInt(cliId, 10)) });
          return;
        }
      }
    }
  });
  return resultado;
}

function exibirAvisoMultiplos() {
  const multi = clientesComMultiplosNaSemana();
  const box = document.getElementById('avisoSemana');
  if (multi.length === 0) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  box.innerHTML = multi.map(m => `
    <div class="alerta alerta-aviso aviso-reagendar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
      <span>Um cliente possui mais de um agendamento nesta semana. Deseja reagendar?</span>
      <button type="button" class="btn btn-secundario btn-reagendar" data-cli-id="${m.cliId}" style="padding: 0.4rem 0.8rem;">Ver agendamentos</button>
    </div>
  `).join('');
  box.style.display = 'block';
  box.querySelectorAll('.btn-reagendar').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroCliente.value = btn.dataset.cliId;
      filtrar();
      box.style.display = 'none';
    });
  });
}

async function carregar() {
  esconderAlerta();
  try {
    [agendamentos, clientes] = await Promise.all([
      api.agendamentos.listarTodos(),
      api.clientes.listar(),
    ]);
    filtroCliente.innerHTML = '<option value="">Todos</option>' +
      clientes.map(c => `<option value="${c.cli_id}">${c.cli_nome}</option>`).join('');
    filtrar();
    exibirAvisoMultiplos();
  } catch (e) {
    corpo.innerHTML = '<tr><td colspan="6" class="msg-vazia">Erro ao carregar. Verifique se a API está em http://localhost:8080</td></tr>';
    mostrarAlerta('Falha ao carregar dados. Motivo: ' + (e.data?.message || e.message || 'erro de conexão'), 'erro');
  }
}

document.getElementById('btnFecharModal').addEventListener('click', () => {
  modalEditar.style.display = 'none';
  ageIdEditando = null;
});

document.getElementById('btnSalvarEdicao').addEventListener('click', async () => {
  if (!ageIdEditando) return;
  const data = document.getElementById('editData').value;
  const hora = document.getElementById('editHora').value;
  if (!data || !hora) {
    mostrarAlerta('Preencha data e horário.', 'aviso');
    return;
  }
  esconderAlerta();
  try {
    const result = await api.agendamentos.atualizar(ageIdEditando, data, hora);
    let msg;
    if (result && result.message) {
      msg = result.message;
    } else {
      msg = 'Agendamento atualizado com sucesso.';
    }
    const foiBloqueado = msg.includes('próxima') || msg.includes('ligação') || msg.includes('telefone');
    let tipo;
    if (foiBloqueado) {
      tipo = 'aviso';
    } else {
      tipo = 'sucesso';
    }

    modalEditar.style.display = 'none';
    ageIdEditando = null;

    if (foiBloqueado) {
      mostrarAlerta(msg, tipo);
    } else {
      mostrarAlerta(msg, tipo);
      carregar();
    }
  } catch (e) {
    let msgErro;
    if (e.data && e.data.message) {
      msgErro = e.data.message;
    } else if (e.message) {
      msgErro = e.message;
    } else {
      msgErro = 'Erro ao atualizar.';
    }
    mostrarAlerta(msgErro, 'erro');
    alerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

filtroCliente.addEventListener('change', filtrar);
carregar();
