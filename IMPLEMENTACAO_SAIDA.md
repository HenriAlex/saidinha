# Documentação - Implementação da Funcionalidade de Saída de Alunos

## 📋 Sumário Executivo

Foi implementada a funcionalidade completa de **lançamento de saída de alunos** no sistema Saidinha. Os alunos podem registrar quando saem da instituição, informando:
- Data e hora de **entrada**
- Data e hora de **saída**
- **Motivo** da saída (ex: intervalo, consulta médica, aula terminada)

A implementação segue o padrão arquitetural estabelecido (Model → Repository → Service → Controller) e inclui **comentários educacionais** em todos os arquivos para servir como base de aprendizado.

---

## 🏗️ Arquitetura de Camadas

### Fluxo de Dados
```
Frontend (Interface HTML/JS)
        ↓
API REST (FastAPI)
        ↓
Controller (Rotas)
        ↓
Service (Regras de Negócio)
        ↓
Repository (Acesso ao Banco)
        ↓
SQLite (Banco de Dados)
```

---

## 🗄️ 1. CAMADA DE BANCO DE DADOS

### Arquivo: `database/criar_banco.py`

**O que foi adicionado:**
- Nova tabela `saida` com estrutura relacional

**Estrutura da Tabela:**
```sql
CREATE TABLE IF NOT EXISTS saida (
    id_saida INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,           -- Aluno (FK)
    data_entrada TEXT NOT NULL,            -- Quando entrou
    data_saida TEXT NOT NULL,              -- Quando saiu
    motivo TEXT NOT NULL,                  -- Razão da saída
    data_cadastro TEXT NOT NULL,           -- Quando registrou
    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
)
```

**Comentários Educacionais:**
- Explica o uso de FOREIGN KEY para relacionar com tabela usuario
- Descreve o tipo TEXT para armazenar datas
- Justifica AUTOINCREMENT para ID único

---

## 📦 2. CAMADA DE MODELO

### Arquivo: `models/saida.py`

**Classe:** `Saida`

**Atributos:**
- `id_saida` - Identificador único (gerado automaticamente)
- `id_usuario` - Referência ao aluno
- `data_entrada` - Data/hora de chegada
- `data_saida` - Data/hora de partida
- `motivo` - Descrição do motivo
- `data_cadastro` - Timestamp automático

**Características:**
- Construtor parametrizado com valores padrão
- Data de cadastro inicializada automaticamente se não informada
- **Totalmente comentado** para fins educacionais

**Exemplo de Uso:**
```python
# Criar nova saída
saida = Saida(
    id_usuario=1,
    data_entrada="2024-12-25 10:30:00",
    data_saida="2024-12-25 11:30:00",
    motivo="Intervalo para almoço"
)
```

---

## 🔌 3. CAMADA DE REPOSITORY

### Arquivo: `repositories/saida_repository.py`

**Classe:** `SaidaRepository`

**Operações Implementadas:**

#### 1. **INSERIR** - `inserir(saida: Saida)`
```python
def inserir(self, saida: Saida):
    # Conecta ao banco
    # Executa INSERT
    # Retorna ID gerado
```
- Grava novo registro na tabela saida
- Retorna ID auto-gerado para referência
- Abre/fecha conexão automaticamente

#### 2. **LISTAR** - `listar()`
```python
def listar(self):
    # SELECT com INNER JOIN usuario
    # Retorna lista de dicionários
```
- Recupera todas as saídas
- **JOIN com tabela usuario** para trazer nome e RA
- Ordena por data de saída (mais recentes primeiro)

#### 3. **BUSCAR POR ID** - `buscar_por_id(id_saida)`
```python
def buscar_por_id(self, id_saida):
    # Busca saída específica
    # Retorna dicionário ou None
```
- Localiza saída por ID
- Inclui dados do usuário relacionado

#### 4. **BUSCAR POR USUÁRIO** - `buscar_por_usuario(id_usuario)`
```python
def buscar_por_usuario(self, id_usuario):
    # Retorna histórico de saídas do aluno
    # Ordena por data (mais recentes primeiro)
```
- Mostra todas as saídas de um aluno
- Útil para visualizar histórico

#### 5. **ATUALIZAR** - `atualizar(saida: Saida)`
```python
def atualizar(self, saida: Saida):
    # UPDATE na tabela saida
    # Identifica por ID
```
- Modifica saída existente
- Mantém ID imutável (é chave primária)

#### 6. **EXCLUIR** - `excluir(id_saida)`
```python
def excluir(self, id_saida):
    # DELETE permanente
    # Baseado em ID
```
- Remove saída do banco
- Operação irreversível

**Padrão de Comentários:**
- Cada método tem bloco de comentário explicativo
- Cada SQL é comentado linha por linha
- Explicação de parâmetros

---

## ⚙️ 4. CAMADA DE SERVIÇO

### Arquivo: `services/saida_service.py`

**Classe:** `SaidaService`

**Responsabilidades:**
- Validar dados antes de gravar
- Aplicar regras de negócio
- Garantir integridade dos dados

**Métodos Implementados:**

#### 1. **REGISTRAR** - `registrar(saida: Saida)`

**Validações Executadas:**
```python
def registrar(self, saida: Saida):
    # ✓ ID do usuário obrigatório
    if not saida.id_usuario:
        raise ValueError("O ID do usuário é obrigatório.")
    
    # ✓ Data de entrada obrigatória
    if not saida.data_entrada:
        raise ValueError("A data de entrada é obrigatória.")
    
    # ✓ Data de saída obrigatória
    if not saida.data_saida:
        raise ValueError("A data de saída é obrigatória.")
    
    # ✓ Motivo obrigatório
    if not saida.motivo:
        raise ValueError("O motivo da saída é obrigatório.")
    
    # ✓ Motivo com mínimo 3 caracteres
    if len(saida.motivo) < 3:
        raise ValueError("O motivo deve ter pelo menos 3 caracteres.")
    
    # ✓ Verifica se usuário existe
    usuario = self.usuario_repository.buscar_por_id(saida.id_usuario)
    if not usuario:
        raise ValueError("O usuário informado não existe.")
    
    # Gravas após todas as validações
    return self.repository.inserir(saida)
```

#### 2. **LISTAR** - `listar()`
- Retorna todas as saídas sem validação (é leitura)

#### 3. **BUSCAR POR ID** - `buscar_por_id(id_saida)`
- Valida se ID foi informado
- Valida se saída existe
- Lança ValueError se não encontrada

#### 4. **BUSCAR POR USUÁRIO** - `buscar_por_usuario(id_usuario)`
- Valida existência do usuário
- Retorna histórico do aluno

#### 5. **ATUALIZAR** - `atualizar(saida: Saida)`
- Valida ID da saída
- Valida existência da saída
- Valida todos os campos
- Verifica integridade referencial (usuário existe)

#### 6. **EXCLUIR** - `excluir(id_saida)`
- Valida ID
- Valida existência antes de deletar

**Tratamento de Erros:**
- Usa `ValueError` para erros de validação
- Mensagens descritivas em português
- Propagadas para Controller tratar como HTTP 400

---

## 🔐 5. CAMADA DE SCHEMA (VALIDAÇÃO)

### Arquivo: `schemas/saida_schema.py`

**Classe:** `SaidaSchema` (Pydantic BaseModel)

**Campo Principal:**
```python
class SaidaSchema(BaseModel):
    id_usuario: int              # ID do aluno (obrigatório)
    data_entrada: str            # "2024-12-25 10:30:00"
    data_saida: str              # "2024-12-25 14:30:00"
    motivo: str                  # Razão da saída
```

**Funcionamento:**
- FastAPI valida automaticamente tipos
- Rejeita requisições com campos faltantes (400 Bad Request)
- Converte JSON para objeto Python
- Documentação automática no Swagger

**Exemplo de Requisição Válida:**
```json
{
    "id_usuario": 1,
    "data_entrada": "2024-12-25 10:30:00",
    "data_saida": "2024-12-25 11:30:00",
    "motivo": "Intervalo para almoço"
}
```

---

## 🌐 6. CAMADA DE CONTROLLER (ROTAS API)

### Arquivo: `controllers/saida_controller.py`

**Router:** `/saidas`

**Endpoints Implementados:**

### 1. **POST /saidas/** - Registrar Saída
```http
POST /saidas/
Content-Type: application/json

{
    "id_usuario": 1,
    "data_entrada": "2024-12-25 10:30:00",
    "data_saida": "2024-12-25 11:30:00",
    "motivo": "Intervalo"
}
```

**Respostas:**
- `201 Created` - Sucesso
  ```json
  {
      "mensagem": "Saída registrada com sucesso.",
      "id_saida": 42
  }
  ```
- `400 Bad Request` - Erro de validação
  ```json
  {
      "detail": "O motivo da saída é obrigatório."
  }
  ```
- `500 Internal Server Error` - Erro do servidor

### 2. **GET /saidas/** - Listar Todas as Saídas
```http
GET /saidas/
```

**Resposta:**
```json
[
    {
        "id_saida": 1,
        "id_usuario": 1,
        "nome_usuario": "João Silva",
        "ra_usuario": "202401001",
        "data_entrada": "2024-12-25 10:30:00",
        "data_saida": "2024-12-25 11:30:00",
        "motivo": "Intervalo",
        "data_cadastro": "2024-12-25 11:31:00"
    },
    ...
]
```

### 3. **GET /saidas/{id_saida}** - Buscar Saída por ID
```http
GET /saidas/42
```

**Respostas:**
- `200 OK` - Saída encontrada (mesmo formato acima)
- `404 Not Found` - Saída não existe

### 4. **GET /saidas/usuario/{id_usuario}** - Histórico do Aluno
```http
GET /saidas/usuario/1
```

**Resposta:** Array com todas as saídas do aluno

### 5. **PUT /saidas/{id_saida}** - Atualizar Saída
```http
PUT /saidas/42
Content-Type: application/json

{
    "id_usuario": 1,
    "data_entrada": "2024-12-25 10:30:00",
    "data_saida": "2024-12-25 11:45:00",  // alterado
    "motivo": "Intervalo estendido"        // alterado
}
```

**Respostas:**
- `200 OK` - Atualizado com sucesso
- `400 Bad Request` - Erro de validação
- `404 Not Found` - Saída não encontrada

### 6. **DELETE /saidas/{id_saida}** - Remover Saída
```http
DELETE /saidas/42
```

**Respostas:**
- `200 OK` - Removido com sucesso
- `404 Not Found` - Saída não encontrada

**Estrutura de Tratamento de Erros:**
```python
try:
    # Executa operação
    novo_id = service.registrar(saida)
except ValueError as e:
    # Erro de validação → 400
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    # Erro inesperado → 500
    raise HTTPException(status_code=500, detail=str(e))
```

---

## 🎨 7. CAMADA DE FRONT-END

### Arquivo: `frontend/js/saida.js`

**Funções Implementadas:**

#### 1. **carregarSaidas()**
```javascript
async function carregarSaidas(){
    // Exibe esqueletos de carregamento
    // Faz GET /saidas/
    // Cria cards com informações
    // Exibe mensagem se vazio
    // Trata erros
}
```

**O que faz:**
- Busca todas as saídas da API
- Exibe enquanto carrega (skeleton loading)
- Cria cards animados no grid
- Mostra nome do aluno, RA, data/hora e motivo
- Adiciona botões editar e remover

#### 2. **registrarSaida()**
```javascript
async function registrarSaida(){
    // Lê dados do formulário
    // Valida campos
    // POST /saidas/ (novo) ou PUT (edição)
    // Recarrega lista
    // Navega para tela de listagem
}
```

**Modos:**
- **Novo:** Faz POST para criar
- **Edição:** Faz PUT para atualizar (se window.saidaEditId existe)

#### 3. **removerSaida(id_saida)**
```javascript
async function removerSaida(id_saida){
    // Pede confirmação ao usuário
    // DELETE /saidas/{id_saida}
    // Recarrega lista
    // Mostra toast de sucesso/erro
}
```

#### 4. **filterSaidas(text)**
```javascript
function filterSaidas(text){
    // Filtra cards por texto (client-side)
    // Busca em nome, RA e motivo
    // Atualiza contagem visível
}
```

**Integração com barra de busca:**
```html
<input oninput="filterSaidas(this.value)">
```

#### 5. **popularSelectUsuariosSaida()**
```javascript
async function popularSelectUsuariosSaida(){
    // GET /usuarios/
    // Cria <option> para cada aluno
    // Formata como "Nome (RA)"
}
```

#### 6. **editarSaida(s)**
```javascript
function editarSaida(s){
    // Pré-preenche formulário com dados da saída
    // Define window.saidaEditId para modo edição
    // Mostra tela de cadastro
}
```

**Fluxo:**
1. Usuário clica "Editar" em um card
2. Formulário é preenchido com dados antigos
3. Usuário modifica e clica "Registrar"
4. Sistema detecta saidaEditId e usa PUT

### Arquivo: `frontend/index.html`

**Alterações:**

#### 1. Navegação
```html
<button class="nav-item" data-screen="telaSaidas" 
        onclick="showScreen('telaSaidas')">
    <svg>...</svg>
    <span>Saídas</span>
</button>
```

#### 2. Tela de Listagem
```html
<section id="telaSaidas" style="display:none;">
    <h2>Saídas registradas</h2>
    <div id="aidasGrid" class="profiles-grid"></div>
    <button onclick="showScreen('telaSaidaCadastro')">
        Registrar saída
    </button>
</section>
```

#### 3. Tela de Cadastro
```html
<section id="telaSaidaCadastro" style="display:none;">
    <form id="formSaida" onsubmit="registrarSaida()">
        <select id="selectUsuarioSaida"></select>
        <input type="datetime-local" id="inputDataEntrada">
        <input type="datetime-local" id="inputDataSaida">
        <input type="text" id="inputMotivoSaida">
        <button type="submit">Registrar</button>
    </form>
</section>
```

#### 4. Script Import
```html
<script src="js/saida.js"></script>
```

### Arquivo: `frontend/js/script.js`

**Atualizações:**

#### 1. Lista de Telas Válidas
```javascript
const valid = [
    'bemVindo', 'telaLista', 'telaCadastro', 
    'telaUsuarios', 'telaUsuarioCadastro',
    'telaSaidas', 'telaSaidaCadastro',  // ← Adicionado
    'telaLogin'
];
```

#### 2. Restrição de Acesso Admin
```javascript
const requiresAdmin = [
    'telaUsuarioCadastro', 'telaCadastro',
    'telaSaidaCadastro'  // ← Apenas admin
];
```

#### 3. Carregamento na Inicialização
```javascript
if (typeof carregarSaidas === 'function') 
    carregarSaidas();  // ← Carrega em background
```

#### 4. Carregamento ao Navegar
```javascript
if (screen === 'telaSaidas' || screen === 'telaSaidaCadastro') {
    if (typeof carregarSaidas === 'function') carregarSaidas();
    if (screen === 'telaSaidaCadastro' && 
        typeof popularSelectUsuariosSaida === 'function') 
        popularSelectUsuariosSaida();
}
```

---

## 📊 Fluxo de Uso

### Caso 1: Registrar Nova Saída

```
1. User clica em "Saídas" no menu
   └─ Frontend: showScreen('telaSaidas')
      └─ Carrega lista via GET /saidas/

2. User clica "Registrar saída"
   └─ showScreen('telaSaidaCadastro')
      └─ Popula select com GET /usuarios/

3. User preenche formulário
   ├─ Seleciona aluno
   ├─ Define data/hora entrada
   ├─ Define data/hora saída
   └─ Digita motivo

4. User clica "Registrar"
   └─ Frontend: registrarSaida()
      └─ Valida campos (JavaScript)
      └─ POST /saidas/ com dados
         └─ Backend: registrar()
            └─ Valida todos os dados
            └─ Verifica usuário existe
            └─ INSERT na tabela
            └─ Retorna id_saida (201)

5. Frontend recebe resposta
   └─ Limpa formulário
   └─ Carrega lista novamente
   └─ Mostra toast "Saída registrada"
   └─ Navega para telaSaidas
```

### Caso 2: Editar Saída Existente

```
1. User vê lista de saídas (telaSaidas)

2. User clica "Editar" em um card
   └─ Frontend: editarSaida(saida)
      └─ Pré-preenche formulário
      └─ Define window.saidaEditId = saida.id_saida
      └─ showScreen('telaSaidaCadastro')

3. User modifica dados conforme necessário

4. User clica "Registrar"
   └─ Frontend: registrarSaida()
      └─ Detecta window.saidaEditId
      └─ PUT /saidas/{id_saida} com novos dados
         └─ Backend: atualizar()
            └─ Valida ID existe
            └─ Valida todos os campos
            └─ UPDATE na tabela
            └─ Retorna mensagem (200)

5. Frontend recebe resposta
   └─ Limpa window.saidaEditId
   └─ Recarrega lista
   └─ Navega para telaSaidas
```

### Caso 3: Remover Saída

```
1. User vê card de saída

2. User clica "Remover"
   └─ Frontend: removerSaida(id_saida)
      └─ Mostra modal de confirmação

3. User confirma
   └─ DELETE /saidas/{id_saida}
      └─ Backend: excluir()
         └─ Valida ID existe
         └─ DELETE da tabela
         └─ Retorna mensagem (200)

4. Frontend recebe resposta
   └─ Mostra toast "Saída removida"
   └─ Recarrega lista
```

---

## 🎓 Propósito Educacional

### Comentários em Código

**Arquivo: models/saida.py**
```python
# Importa a classe datetime.
# Ela será utilizada para trabalhar com datas e horas.
from datetime import datetime

# Classe que representa a tabela saida.
# Esta classe mapeia os dados de saída dos alunos.
class Saida:
    # Método construtor da classe.
    # O construtor inicializa todos os atributos da saída.
    def __init__(self, ...):
        # Código identificador único da saída.
        self.id_saida = id_saida
        ...
```

### Benefícios para Alunos

1. **Entender Arquitetura em Camadas**
   - Ver como dados fluem de frontend a banco
   - Compreender responsabilidade de cada camada

2. **Aprender Padrão MVC**
   - Model: Representa dados
   - View: Frontend com HTML/JS
   - Controller: Rotas da API

3. **Validação em Múltiplas Camadas**
   - Frontend: UX imediata
   - API Schema: Rejeição automática
   - Service: Lógica de negócio

4. **Tratamento de Erros**
   - Try/catch em JavaScript
   - Try/except em Python
   - HTTP status codes apropriados

5. **Integração com Banco de Dados**
   - SQL com JOINs
   - Chaves estrangeiras
   - CRUD operations

---

## 🚀 Como Executar

### 1. Backend

```bash
# Navegar para o diretório do projeto
cd "G:\Meu Drive\...\Saidinha"

# Ativar virtual environment (se necessário)
.\.venv\Scripts\activate

# Criar banco de dados (se ainda não existe)
python database/criar_banco.py

# Executar servidor FastAPI
uvicorn main:app --reload
```

**Servidor rodando em:** http://127.0.0.1:8000

**Documentação automática (Swagger):** http://127.0.0.1:8000/docs

### 2. Frontend

- Abrir `frontend/index.html` em navegador
- Ou servir com um servidor HTTP local

**Endpoints da API:**
- `GET /saidas/` - Listar todas
- `POST /saidas/` - Criar nova
- `GET /saidas/{id}` - Buscar por ID
- `PUT /saidas/{id}` - Atualizar
- `DELETE /saidas/{id}` - Remover

---

## 📝 Exemplo Prático Completo

### Registrar saída de "João Silva" (RA: 202401001)

**JSON da Requisição:**
```json
{
    "id_usuario": 1,
    "data_entrada": "2024-12-25 10:30:00",
    "data_saida": "2024-12-25 11:30:00",
    "motivo": "Intervalo para almoço"
}
```

**Fluxo no Backend:**

1. **Controller** recebe POST
   - Valida JSON com Pydantic (schema)
   - Cria objeto Saida

2. **Service** processa
   - Valida ID do usuário não vazio
   - Valida datas informadas
   - Valida motivo não vazio
   - Valida motivo >= 3 caracteres
   - Busca usuário (existe?)
   - Se tudo OK → chama Repository.inserir()

3. **Repository** executa SQL
   - INSERT INTO saida (...)
   - Retorna ID gerado (ex: 42)

4. **Controller** responde
   ```json
   {
       "mensagem": "Saída registrada com sucesso.",
       "id_saida": 42
   }
   ```
   HTTP Status: 201 Created

**Resultado no Banco:**
```
id_saida | id_usuario | data_entrada        | data_saida          | motivo              | data_cadastro
---------|------------|--------------------|---------------------|---------------------|---------------------
42       | 1          | 2024-12-25 10:30:00| 2024-12-25 11:30:00| Intervalo p/ almoço| 2024-12-25 11:31:00
```

---

## 🔍 Testes Manuais Recomendados

### 1. Criar Saída Válida
- ✅ Com todos os dados corretos
- ❌ Com usuário inexistente (deve falhar)
- ❌ Com motivo vazio (deve falhar)
- ❌ Com motivo muito curto (deve falhar)

### 2. Listar Saídas
- ✅ GET /saidas/ retorna array
- ✅ Dados incluem nome do usuário (JOIN)
- ✅ Ordenação por data (mais recentes primeiro)

### 3. Buscar Saída Específica
- ✅ GET /saidas/1 retorna dados
- ❌ GET /saidas/99999 retorna 404

### 4. Editar Saída
- ✅ PUT com dados válidos
- ✅ Histórico não perde dados anteriores

### 5. Remover Saída
- ✅ DELETE remove permanentemente
- ✅ GET posterior retorna 404

### 6. Filtro Frontend
- ✅ Busca por nome do aluno
- ✅ Busca por RA
- ✅ Busca por motivo
- ✅ Case-insensitive

---

## 📚 Estrutura de Diretórios

```
Saidinha/
├── database/
│   └── criar_banco.py          ← Tabela SAIDA criada aqui
├── models/
│   └── saida.py                ← ✨ NOVO
├── repositories/
│   └── saida_repository.py      ← ✨ NOVO
├── services/
│   └── saida_service.py         ← ✨ NOVO
├── controllers/
│   └── saida_controller.py      ← ✨ NOVO
├── schemas/
│   └── saida_schema.py          ← ✨ NOVO
├── frontend/
│   ├── index.html               ← Atualizado
│   └── js/
│       ├── script.js            ← Atualizado
│       ├── usuario.js
│       ├── perfil.js
│       └── saida.js             ← ✨ NOVO
├── main.py                      ← Atualizado (include_router)
└── IMPLEMENTACAO_SAIDA.md       ← Este arquivo
```

---

## ✨ Resumo de Benefícios

| Aspecto | Benefício |
|---------|-----------|
| **Aprendizado** | Código comentado serve como tutorial completo |
| **Reutilização** | Padrão pode ser adaptado para novas funcionalidades |
| **Manutenção** | Separação em camadas facilita correções |
| **Escalabilidade** | Estrutura suporta crescimento do sistema |
| **Testabilidade** | Service separado do Controller permite testes |
| **Documentação** | Comentários em português e arquivo markdown |

---

**Data de Implementação:** 23ª Semana (Dezembro 2024)

**Desenvolvido para:** Projeto Acadêmico Saidinha - Base Educacional

**Padrão:** Arquitetura em Camadas com FastAPI + SQLite + Vanilla JS

---
