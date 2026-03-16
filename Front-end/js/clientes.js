const alerta = document.getElementById('alerta');
const corpo = document.getElementById('corpoClientes');

function mostrarAlerta(msg, tipo) {
  alerta.textContent = msg;
  alerta.className = 'alerta alerta-' + tipo;
  alerta.style.display = 'block';
}
function esconderAlerta() {
  alerta.style.display = 'none';
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

async function carregar() {
  esconderAlerta();
  try {
    const [clientesLista, agendamentos] = await Promise.all([
      api.clientes.listar(),
      api.agendamentos.listarTodos(),
    ]);
    const clientes = clientesLista;
    if (clientes.length === 0) {
      corpo.innerHTML = '<tr><td colspan="4" class="msg-vazia">Nenhum cliente cadastrado.</td></tr>';
      document.getElementById('avisoSemana').style.display = 'none';
      return;
    }
    corpo.innerHTML = clientes.map(c => `
      <tr>
        <td>${c.cli_nome}</td>
        <td>${c.cli_cpf || ''}</td>
        <td>${c.cli_telefone}</td>
        <td><a href="agendar.html" class="btn btn-secundario" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; text-decoration: none;">Agendar</a></td>
      </tr>
    `).join('');

    const porCliente = {};
    agendamentos.forEach(a => {
      if (!porCliente[a.cli_id]) porCliente[a.cli_id] = [];
      porCliente[a.cli_id].push(a);
    });
    let countMulti = 0;
    Object.keys(porCliente).forEach(cliId => {
      const list = porCliente[cliId];
      if (list.length < 2) return;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (mesmaSemana(list[i].age_data, list[j].age_data)) {
            countMulti++;
            return;
          }
        }
      }
    });
    const box = document.getElementById('avisoSemana');
    if (countMulti > 0) {
      box.className = 'alerta alerta-aviso';
      box.innerHTML = countMulti + ' cliente(s) com mais de um agendamento nesta semana. <a href="agendamentos.html">Deseja reagendar? Ver agendamentos</a>';
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  } catch (e) {
    corpo.innerHTML = '<tr><td colspan="4" class="msg-vazia">Erro ao carregar. Verifique se a API está em http://localhost:8080</td></tr>';
    mostrarAlerta('Falha ao carregar clientes. Motivo: ' + (e.data?.message || e.message || 'erro de conexão'), 'erro');
  }
}

document.getElementById('btnCadastrar').addEventListener('click', async () => {
  esconderAlerta();
  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  const telefone = document.getElementById('telefone').value.trim();
  if (!nome || !cpf || !telefone) {
    mostrarAlerta('Preencha nome, CPF e telefone.', 'aviso');
    return;
  }
  try {
    await api.clientes.cadastrar(nome, cpf, telefone);
    mostrarAlerta('Cliente cadastrado com sucesso!', 'sucesso');
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('telefone').value = '';
    carregar();
    window.alert("Cadastro Enviado");
  } catch (e) {
    mostrarAlerta('Cadastro não realizado. Motivo: ' + (e.data?.message || e.message || 'erro ao cadastrar'), 'erro');
  }
});

carregar();
