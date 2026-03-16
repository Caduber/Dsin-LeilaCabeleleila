## Cabeleleila Leila – Sistema de Agendamentos

Aplicação completa (front-end + back-end) para gestão de agendamentos do salão **Cabeleleila Leila**, com cadastro de clientes, criação de horários e regras de negócio.

---

## Tecnologias utilizadas

- **Back-end**
  - **Node.js**: 20.x (recomendado) – runtime JavaScript  
    - Download: [`https://nodejs.org`](https://nodejs.org)
  - **Express**: `^5.2.1` – criação da API REST  
  - **cors**: `^2.8.5` – habilita acesso do front em `http://localhost:3000`
  - **date-fns**: `^4.1.0` – manipulação de datas (regras de semana / diferença de dias)
  - **dotenv**: `^17.3.1` – leitura de variáveis de ambiente
  - **postgres**: `^3.4.8` – client para PostgreSQL
  - **Banco de dados**: **PostgreSQL no Supabase**  
    - Supabase: [`https://supabase.com`](https://supabase.com)
    --------------------------------------------------------------------------------------------------------------------
    - As credenciais de conexão ficam em `.env` no diretório `Back-end`

- **Front-end**
  - HTML5, CSS3 (layout responsivo definido em `Front-end/css/estilo.css`)
  - JavaScript puro (sem framework)  
  - Front servido em `http://localhost:3000` (por exemplo, usando um servidor estático do próprio Node ou extensão Live Server)

---

## Estrutura do projeto

Diretório raiz:

- `Back-end/`
  - `index.js`: ponto de entrada da API (configura Express, CORS, JSON e porta 8080).
  - `routes/`
    - `mainRouter.js`: roteador principal; incorpora como módulos:
      - `/clientes` → `routesClientes.js`
      - `/agendamentos` → `routesAgendamentos.js`
    - `routesClientes.js`: módulo de rotas REST de clientes.
    - `routesAgendamentos.js`: módulo de rotas REST de agendamentos (CRUD + regras de semana).
  - `controllers/`
    - `clienteController.js`: lógica de clientes + conexões com o banco (listar, buscar por CPF, inserir).
    - `agendamentoController.js`: lógica de agendamentos + conexões com o banco (listar, inserir, atualizar com regra de 2 dias, verificação de múltiplas datas na semana).
  - `db/`
    - `dbClient.js`: configuração do client `postgres` apontando para o Supabase (via `.env`).
  - `teste.txt`: exemplos de chamadas `curl` para testar os endpoints via terminal (necessita ter o curl instalado).
  - `package.json`: dependências e script `npm start`.

- `Front-end/`
  - Páginas:
    - `index.html`:
      - Página inicial do salão, com descrição dos serviços e botões para ir para **Agendar**, **Agendamentos** e **Clientes**.
      - Carrega `js/api.js` e `js/index.js` (pode exibir avisos gerais).
    - `agendar.html`:
      - Fluxo de **novo agendamento**:
        - Etapa 1 – Identificar/cadastrar cliente (buscar por CPF ou criar novo).
        - Etapa 2 – Escolher data e horário.
      - Mostra alertas (`#alerta`) e aviso de múltiplos agendamentos na semana (`#avisoSemana`).
      - Exibe **popup de confirmação** após agendar com sucesso.
    - `agendamentos.html`:
      - Lista todos os agendamentos.
      - Permite **filtrar por cliente**, **editar data/hora** (com regra de antecedência de 2 dias) e mostrar aviso de múltiplos agendamentos por semana com opção de “Ver agendamentos”.
    - `clientes.html`:
      - Página para **cadastrar e listar clientes**.
  - JavaScript:
    - `js/api.js`:
      - Client HTTP genérico para a API (`API_BASE = http://localhost:8080`).
      - Agrupa chamadas em:
        - `api.clientes` (listar, buscar por CPF, cadastrar).
        - `api.agendamentos` (listar, listar por cliente, criar, atualizar, verificar semana).
      - Responsável por montar as requisições `fetch` com JSON.
    - `js/agendar.js`:
      - Controla o fluxo da tela de **agendamento**:
        - Seleção do tipo de cliente (buscar/cadastrar).
        - Busca por CPF e seleção do cliente.
        - Chamada a `api.agendamentos.verificarSemana(cli_id)` para exibir aviso se já existir horário na mesma semana.
        - Confirmação de criação (`api.agendamentos.criar`) com validações de campos.
        - Exibe **popup de sucesso** após o agendamento.
    - `js/agendamentos.js`:
      - Controlador da tela de **lista de agendamentos**:
        - Chama `api.agendamentos.listarTodos()` e `api.clientes.listar()` para montar a tabela.
        - Implementa filtro por cliente.
        - Abre modal de **edição de data/hora** e chama `api.agendamentos.atualizar`.
        - Reaproveita lógica de diferença de dias (mensagens de bloqueio “ligue para o salão”).
        - Calcula clientes com **múltiplos agendamentos na semana** (no front) e exibe aviso.
    - `js/clientes.js`: comportamentos da página de clientes.
    - `js/index.js`: comportamentos adicionais da home (por exemplo, avisos).
  - Assets:
    - `css/estilo.css`: tema visual do sistema (cores, botões, formulários, tabelas).
    - `public/favicon.*`: ícone do site.

---

## Tipo da API e endpoints
A estrutura da API foi pensada em módulos, facilitar a manutenibilidade (bastando apenas retirar o módulo) e escalabilidade, de modo que basta desenvolver um módulo novo e injetá-lo nos arquivos de rotas.

- **Tipo de API**: REST, JSON sobre HTTP
- **Base URL** (back-end): `http://localhost:8080`
- **Formato**:
  - Requests e responses em JSON.
  - Cabeçalho esperado: `Content-Type: application/json`.

### Rotas de clientes (`/clientes`)

- `GET /clientes`
  - Retorna a lista de todos os clientes.
  - Implementação: `clienteController.getAllClientes`.

- `GET /clientes/:cpf`
  - Busca clientes pelo CPF.
  - Implementação: `clienteController.getClientes`.

- `POST /clientes/insert`
  - Cria um novo cliente.
  - Body JSON esperado:
    ```json
    {
      "nome": "Marcia",
      "cpf": "12345678900",
      "telefone": "(14) 9876-1234"
    }
    ```
  - Implementação: `clienteController.insert`.

### Rotas de agendamentos (`/agendamentos`)

- `GET /agendamentos`
  - Lista todos os agendamentos.
  - Implementação: `agendamentoController.getAllAgendamentos`.

- `GET /agendamentos/:cli_id`
  - Lista agendamentos de um cliente específico.
  - Implementação: `agendamentoController.getAgendamentos`.

- `POST /agendamentos/insert`
  - Cria um novo agendamento.
  - Body JSON:
    ```json
    {
      "data": "2026-03-15",
      "hora": "11:11:10",
      "cli_id": 3
    }
    ```
  - Implementação: `agendamentoController.insert`.

- `PATCH /agendamentos/update/:age_id`
  - Atualiza data e hora de um agendamento existente.
  - Regra de negócio: só permite alterações com antecedência mínima de 2 dias (caso contrário, retorna mensagem para contato telefônico).
  - Body JSON:
    ```json
    {
      "data": "2026-06-12",
      "hora": "23:59:00"
    }
    ```
  - Implementação: `agendamentoController.patch`.

- `GET /agendamentos/verifSemana/:cli_id`
  - Verifica se um cliente possui **múltiplos agendamentos na mesma semana**.
  - Resposta:
    - Caso exista conflito:
      ```json
      {
        "multiplas": true,
        "message": "Já existe um agendamento na semana, deseja agendar os dois no mesmo dia?",
        "data_sugerida": "...",
        "data_multipla": "..."
      }
      ```
    - Sem conflito:
      ```json
      { "multiplas": false }
      ```
  - Implementação: `agendamentoController.verifSemana`.

---

## Como rodar o back-end (API)

### Pré-requisitos

- Rodar o back-end localmente
- Node.js 24.x  (versão usada 24.13.1)
-  no **Supabase** com um banco PostgreSQL:
  - Tabelas esperadas:
    - `clientes` com campos `cli_id`, `cli_nome`, `cli_cpf`, `cli_telefone`.
    - `agendamentos` com campos `age_id`, `age_data`, `age_hora`, `cli_id`.

### Passos

1. Na raiz, acesse o diretório "Back-end":
   ```bash
   cd Back-end
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` (use o Supabase):
   - Por questões de segurança do Github, a senha foi enviada no e-mail, também está presente no .env do arquivo zipado. 
   - Exemplo (adaptar para seu Supabase):
     ```env
     DATABASE_URL = "postgresql://postgres.iqowjvfzftnrvxaflrjn:<SENHA>@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
     ```
   - O arquivo `db/dbClient.js` usa essas variáveis para conectar.

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. A API ficará disponível em:
   - `http://localhost:8080`

---

## Como rodar o front-end

O front-end é estático (HTML/CSS/JS). Você pode rodar de várias formas; duas opções simples:

- **Opção 1 – Servidor estático com Node (http-server ou similar)**  
  A partir da pasta raiz:
  ```bash
  cd Front-end
  npx serve . -l 3000
  ```
  ou
  ```bash
  npx http-server -p 3000
  ```

- **Opção 2 – Extensão Live Server (VS Code)**  
  - Abra o diretório `Front-end` no VS Code.
  - Clique com o botão direito em `index.html` → “Open with Live Server”.
  - Configure a porta para `3000` (se necessário).

Depois disso, acesse:

- `http://localhost:3000/index.html` – Home  
- `http://localhost:3000/agendar.html` – Tela de novo agendamento  
- `http://localhost:3000/agendamentos.html` – Lista/edição de agendamentos  
- `http://localhost:3000/clientes.html` – Gestão de clientes

(Abrir o arquivo diretamente também funciona)
---

## Exemplos de testes (via `curl`)

Os exemplos abaixo estão em `Back-end/teste.txt`, adaptados:

- **Listar todos os agendamentos**
  ```bash
  curl -X GET http://localhost:8080/agendamentos/ \
    -H "Content-Type: application/json"
  ```

- **Listar agendamentos de um cliente específico (`cli_id = 2`)**
  ```bash
  curl -X GET http://localhost:8080/agendamentos/2 \
    -H "Content-Type: application/json"
  ```

- **Criar novo agendamento**
  ```bash
  curl -X POST http://localhost:8080/agendamentos/insert \
    -H "Content-Type: application/json" \
    -d '{
      "data": "2026-03-15",
      "hora": "11:11:10",
      "cli_id": 3
    }'
  ```

- **Atualizar data/hora de um agendamento (`age_id = 4`)**
  ```bash
  curl -X PATCH http://localhost:8080/agendamentos/update/4 \
    -H "Content-Type: application/json" \
    -d '{
      "data": "2026-06-12",
      "hora": "23:59:00"
    }'
  ```

- **Verificar múltiplos atendimentos na mesma semana (`cli_id = 2`)**
  ```bash
  curl -X GET http://localhost:8080/agendamentos/verifSemana/2 \
    -H "Content-Type: application/json"
  ```

- **Inserir um cliente**
  ```bash
  curl -X POST http://localhost:8080/clientes/insert \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Marcia",
      "cpf": "12345678900",
      "telefone": "(14) 9876-1234"
    }'
  ```

---

## Decisões arquiteturais

- **API REST enxuta com Express**
  - Separação em módulos/camadas:
    - Rotas (`Back-end/routes`) apenas mapeiam URLs para controladores.
    - Controladores (`Back-end/controllers`) contêm a lógica de negócio e acesso ao banco.
    - Módulo de banco (`Back-end/db/dbClient.js`) centraliza a conexão PostgreSQL (Supabase).

- **Regra de antecedência de 2 dias (atualização de agendamento)**
  - Motivo: evitar mudanças de última hora via sistema; nesses casos o contato deve ser por telefone.
  - Implementação:
    - `agendamentoController.patch` usa `date-fns` para calcular diferença de dias entre a data atual salva e a nova data.
    - Se estiver muito próximo, retorna uma mensagem de aviso, sem alterar o banco; o front exibe essa mensagem.

- **Verificação de múltiplos agendamentos na mesma semana**
  - Motivo: evitar que o mesmo cliente tenha vários horários na mesma semana sem intenção explícita.
  - Backend:
    - `verifSemana` percorre os agendamentos de um cliente, comparando datas pela diferença em dias.
    - Retorna `multiplas: true` e uma mensagem de confirmação para o front.
  - Front:
    - `agendar.js` chama `verificarSemana(cli_id)` antes de criar agendamento, exibindo aviso/confirm.
    - `agendamentos.js` também calcula e exibe avisos de múltiplos na lista.

- **Front-end desacoplado (HTML/JS puro)**
  - Decisão: evitar frameworks pesados para um CRUD simples.
  - O JS do front usa um client REST (`api.js`) que centraliza a lógica de comunicação; páginas consomem esse client.
  - Vantagem: facilita uso do mesmo back-end em outro front (React, mobile, etc.).

- **Uso de Supabase como “Postgres gerenciado”**
  - Simplifica o provisionamento de banco, autenticação e segurança.
  - A aplicação enxerga apenas uma URL Postgres e credenciais definidas em `.env`.

---

## Observações sobre o desenvolvimento

- **Regras de negócio extras**:
  - Algumas regras de negócio geraram margem para interpretação, então está sendo considerado:
    - A Leila pode atender muitos clientes em um mesmo horário;
    - Estamos considerando que só a Leila está trabalhando no salão (sem funcionários extras);  

- **Validações mais fortes no front**:
  - As páginas fazem validação simples (campos obrigatórios, CPF preenchido, etc.) antes de chamar a API.
  - As regras de negócio mais críticas (datas, múltiplos na semana) estão no back-end.

- **Mensagens de erro e UX**
  - Todas as chamadas usam um padrão de alertas (`div#alerta` e classes `alerta-*`), para feedback claro ao usuário.
  - Na tela de agendar, um **popup/modal** foi adicionado para reforçar visualmente o sucesso do agendamento.

- **Extensibilidade**
  - A separação clara entre rotas, controladores e camada de banco facilita adicionar novos recursos:
    - Ex.: cancelamento de agendamento, histórico, serviços por tipo, etc.
  - O front usa componentes visuais reaproveitáveis (alertas, modais, tabela com filtros).

---
