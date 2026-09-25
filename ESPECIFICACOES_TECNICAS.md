# 📋 Especificações Técnicas do Projeto Saidinha

## 📖 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Linguagens e Tecnologias](#linguagens-e-tecnologias)
3. [Dependências e Bibliotecas](#dependências-e-bibliotecas)
4. [Arquitetura do Projeto](#arquitetura-do-projeto)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Explicação de Cada Camada](#explicação-de-cada-camada)
7. [Fluxo de Dados (Exemplo Prático)](#fluxo-de-dados-exemplo-prático)
8. [Banco de Dados](#banco-de-dados)
9. [Sistema de Permissões](#sistema-de-permissões)

---

## 🎯 Visão Geral do Projeto

**Saidinha** é um sistema web para controlar e registrar as **saídas e retornos de alunos** durante as aulas em uma instituição de ensino.

### Objetivo Principal
Registrar quando um aluno sai da sala (com motivo), registrar quando retorna, e gerar relatórios com o tempo total que cada aluno passou fora da sala.

### Públicos-Alvo (Perfis de Usuário)
- **Aluno**: Pode registrar apenas suas próprias saídas/retornos e ver seus relatórios
- **Professor**: Pode registrar saídas/retornos de qualquer aluno e ver todos os relatórios
- **Equipe de Apoio**: Mesmas permissões do Professor
- **Admin**: Controla tudo (criar usuários, perfis, editar/deletar registros)

---

## 💻 Linguagens e Tecnologias

### Backend (Servidor)
- **Python 3.x** — Linguagem principal do backend
  - Simples, legível, ótima para aprendizado
  - Grande comunidade e muitas bibliotecas disponíveis

- **FastAPI** — Framework web para criar a API REST
  - Moderno, rápido e fácil de aprender
  - Gera documentação automática da API
  - Usa "decoradores" para definir rotas HTTP (GET, POST, PUT, DELETE)

- **SQLite** — Banco de dados local
  - Arquivo simples (`saidinha.db`), sem servidor necessário
  - Perfeito para projetos pequenos e educacionais
  - Suporta SQL padrão

- **Uvicorn** — Servidor ASGI (Application Server Gateway Interface)
  - Executa a aplicação FastAPI
  - Escuta requisições HTTP na porta 8000

### Frontend (Interface do Usuário)
- **HTML 5** — Estrutura da página
- **CSS 3** — Estilo visual e responsividade
- **JavaScript (ES6)** — Interatividade e requisições HTTP
  - Sem frameworks complexos (puro JavaScript)
  - Usa `fetch()` para comunicação com o backend

---

## 📦 Dependências e Bibliotecas

### Instaladas no Projeto

| Biblioteca | Versão | Para Quê? |
|-----------|--------|-----------|
| **fastapi** | 0.141.1 | Criar a API REST (servidor) |
| **uvicorn** | 0.52.4 | Executar/iniciar o servidor |
| **pydantic** | 2.13.4 | Validar dados recebidos nas requisições |
| **starlette** | 1.6.0 | Funcionalidades HTTP de baixo nível (FastAPI usa isso) |

### Como Instalar
```bash
pip install fastapi uvicorn pydantic
```

### Por Que Essas Bibliotecas?

**FastAPI + Uvicorn**
- FastAPI define **o que** a API faz (as rotas)
- Uvicorn define **como** executar (o servidor)
- Juntas, criam um servidor web profissional em poucas linhas

**Pydantic**
- Valida dados automaticamente
- Se alguém enviar um email inválido, Pydantic rejeita
- Poupa código de validação manual

**Starlette**
- É a base de tudo (middleware, CORS, etc.)
- FastAPI "anda em cima" do Starlette

---

## 🏗️ Arquitetura do Projeto

### Padrão: Model-Repository-Service-Controller (MVC + Padrões Avançados)

O projeto segue uma **arquitetura em camadas**, separando responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│              (HTML/CSS/JavaScript no Navegador)             │
└────────────────────┬────────────────────────────────────────┘
                     │ (requisições HTTP: GET, POST, PUT, DELETE)
┌────────────────────▼────────────────────────────────────────┐
│                      CONTROLLER                              │
│           (Recebe requisições, valida, responde)            │
│        Arquivo: controllers/*.py                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                       SERVICE                                │
│              (Regras de negócio, validações)                │
│          Arquivo: services/*.py                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      REPOSITORY                              │
│         (Operações com o banco de dados: CRUD)              │
│        Arquivo: repositories/*.py                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  MODEL + DATABASE                            │
│          (Estrutura de dados + Arquivo do banco)            │
│   models/*.py + saidinha.db (SQLite)                        │
└─────────────────────────────────────────────────────────────┘
```

### Por Que Essa Estrutura?

✅ **Separação de Responsabilidades**
- Cada camada tem uma função clara
- Fácil de entender e manter

✅ **Reutilização de Código**
- Mesma lógica para web e mobile (no futuro)
- Testes são mais simples

✅ **Educação**
- Alunos aprendem padrões profissionais reais
- Pronto para trabalho em empresa

---

## 📂 Estrutura de Pastas

```
saidinha/
│
├── frontend/                    # Código que roda no navegador
│   ├── index.html              # Página HTML principal
│   ├── css/
│   │   └── style.css           # Estilos visuais
│   └── js/                      # Lógica do frontend
│       ├── script.js           # Navegação e funções gerais
│       ├── usuario.js          # Lógica de cadastro de usuários
│       ├── perfil.js           # Lógica de cadastro de perfis
│       ├── saida.js            # Lógica de registrar saídas
│       ├── retorno.js          # Lógica de registrar retornos
│       └── consultas.js        # Lógica do dashboard/relatórios
│
├── database/                    # Banco de dados
│   ├── criar_banco.py          # Script que cria tabelas e dados iniciais
│   └── conexao.py              # Classe que gerencia conexão com SQLite
│
├── models/                      # Estrutura de dados (Model)
│   ├── usuario.py              # Classe Usuario
│   ├── perfil.py               # Classe Perfil
│   ├── saida.py                # Classe Saida
│   └── retorno.py              # Classe Retorno
│
├── repositories/                # Acesso ao banco (Repository)
│   ├── usuario_repository.py    # CRUD de usuários
│   ├── perfil_repository.py     # CRUD de perfis
│   ├── saida_repository.py      # CRUD de saídas
│   └── retorno_repository.py    # CRUD de retornos
│
├── services/                    # Lógica de negócio (Service)
│   ├── usuario_service.py       # Validações de usuário
│   ├── perfil_service.py        # Validações de perfil
│   ├── saida_service.py         # Validações de saída
│   └── retorno_service.py       # Validações de retorno
│
├── schemas/                     # Validação de dados recebidos
│   ├── usuario_schema.py        # Estrutura de dados esperada de usuário
│   ├── perfil_schema.py         # Estrutura de dados esperada de perfil
│   ├── saida_schema.py          # Estrutura de dados esperada de saída
│   └── retorno_schema.py        # Estrutura de dados esperada de retorno
│
├── controllers/                 # Rotas HTTP e respostas (Controller)
│   ├── usuario_controller.py    # Endpoints /usuarios
│   ├── perfil_controller.py     # Endpoints /perfis
│   ├── saida_controller.py      # Endpoints /saidas
│   ├── retorno_controller.py    # Endpoints /retornos
│   └── relatorio_controller.py  # Endpoints /relatorios (dashboard)
│
├── utils/                       # Funções auxiliares
│   └── permissoes.py            # Sistema de controle de acesso (RBAC)
│
├── main.py                      # Arquivo principal (inicia o servidor)
├── saidinha.db                  # Arquivo do banco de dados SQLite
└── requirements.txt             # Lista de dependências Python
```

---

## 🔄 Explicação de Cada Camada

### 1️⃣ FRONTEND (frontend/)

**O que é?**
Tudo que o usuário vê e interage no navegador.

**Componentes:**
- `index.html` — Estrutura das páginas (HTML)
- `style.css` — Visual e cores (CSS)
- `*.js` — Ações e comunicação com servidor (JavaScript)

**Exemplo de Fluxo:**
```
1. Usuário clica em "Registrar Saída"
2. JavaScript (saida.js) abre um formulário
3. Usuário preenche e clica "Enviar"
4. JavaScript faz um POST para o servidor
5. Resposta volta e exibe mensagem de sucesso
```

**Tecnologia Usada:**
- HTML 5 (semântico)
- CSS 3 (responsivo, sem frameworks)
- JavaScript ES6 (sem bibliotecas externas)

---

### 2️⃣ CONTROLLER (controllers/)

**O que é?**
O "recepcionista" do servidor. Recebe requisições HTTP e as responde.

**Responsabilidades:**
- Receber dados do frontend
- Chamar o Service para processar
- Retornar resposta (JSON)

**Exemplo (pseudocódigo):**
```python
@router.post("/saidas/")
def registrar_saida(dados_saida):
    # 1. Receber dados
    # 2. Chamar o Service
    resultado = service.registrar(dados_saida)
    # 3. Retornar resposta
    return {"mensagem": "Sucesso!", "id": resultado}
```

**Endpoints (Rotas HTTP):**
| Método | Rota | O Que Faz |
|--------|------|-----------|
| POST | /usuarios/ | Criar novo usuário |
| GET | /usuarios/ | Listar usuários |
| PUT | /usuarios/{id} | Editar usuário |
| DELETE | /usuarios/{id} | Deletar usuário |
| POST | /saidas/ | Registrar saída |
| GET | /saidas/ | Listar saídas |
| POST | /retornos/ | Registrar retorno |
| GET | /relatorios/geral | Obter dashboard |

---

### 3️⃣ SERVICE (services/)

**O que é?**
O "gerente" de regras e validações.

**Responsabilidades:**
- Validar dados (email válido? senha tem mínimo de caracteres?)
- Aplicar regras de negócio (aluno não pode deletar)
- Chamar Repository para acessar banco

**Exemplo:**
```python
class UsuarioService:
    def cadastrar(self, usuario):
        # Validação 1: Email já existe?
        if self.repository.buscar_por_email(usuario.email):
            raise ValueError("Email já cadastrado")
        
        # Validação 2: Senha mínimo 4 caracteres?
        if len(usuario.senha) < 4:
            raise ValueError("Senha muito curta")
        
        # Se passou nas validações, registra
        return self.repository.cadastrar(usuario)
```

**Por Que Existe?**
- Centraliza lógica de validação
- Reutilizável (API web, mobile, desktop)
- Testes são mais fáceis

---

### 4️⃣ REPOSITORY (repositories/)

**O que é?**
O "arquivista" que lida com o banco de dados.

**Responsabilidades:**
- Inserir dados (INSERT SQL)
- Buscar dados (SELECT SQL)
- Atualizar dados (UPDATE SQL)
- Deletar dados (DELETE SQL)

**Exemplo:**
```python
class UsuarioRepository:
    def cadastrar(self, usuario):
        sql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)"
        cursor.execute(sql, (usuario.nome, usuario.email, usuario.senha))
        conexao.commit()
        return cursor.lastrowid  # Retorna ID do novo registro
    
    def buscar_por_email(self, email):
        sql = "SELECT * FROM usuario WHERE email = ?"
        cursor.execute(sql, (email,))
        return cursor.fetchone()
```

**Por Que Existe?**
- Centraliza SQL em um único lugar
- Fácil de mudar de SQLite para PostgreSQL depois
- Testes sem precisar do banco real

---

### 5️⃣ MODEL (models/)

**O que é?**
A "estrutura de dados" — como os dados são organizados.

**Exemplo:**
```python
class Usuario:
    def __init__(self, id_usuario, ra, nome, id_perfil, email, senha):
        self.id_usuario = id_usuario
        self.ra = ra
        self.nome = nome
        self.id_perfil = id_perfil
        self.email = email
        self.senha = senha
```

**Por Que Existe?**
- Deixa claro que dados cada entidade tem
- Python verifica tipo de dado
- Documentação viva do código

---

### 6️⃣ SCHEMA (schemas/)

**O que é?**
A "especificação de entrada" — que dados são esperados do frontend.

**Exemplo (usando Pydantic):**
```python
from pydantic import BaseModel

class UsuarioSchema(BaseModel):
    ra: str              # Obrigatório, string
    nome: str            # Obrigatório, string
    email: str           # Obrigatório, string
    senha: str           # Obrigatório, string
    id_perfil: int       # Obrigatório, número
```

**Benefício:**
- FastAPI automaticamente rejeita dados inválidos
- Se `id_perfil` é "abc" (texto), FastAPI avisa
- Não precisa validar manualmente

---

### 7️⃣ DATABASE (database/)

**O que é?**
Gerenciamento do banco de dados SQLite.

**Arquivos:**
- `conexao.py` — Como conectar ao banco
- `criar_banco.py` — Script que cria tabelas e insere dados iniciais

**Exemplo de Conexão:**
```python
import sqlite3

class Conexao:
    @staticmethod
    def conectar():
        conexao = sqlite3.connect("saidinha.db")
        return conexao
```

**Tabelas Criadas:**
1. `perfil` — Perfis disponíveis (Aluno, Professor, Equipe de Apoio)
2. `usuario` — Usuários do sistema
3. `saida` — Registros de quando aluno saiu
4. `retorno` — Registros de quando aluno retornou

---

### 8️⃣ UTILS (utils/)

**O que é?**
Funções reutilizáveis em vários lugares.

**Arquivo: `permissoes.py`**
Sistema de controle de acesso (RBAC — Role-Based Access Control)

```python
def pode_registrar_saida(usuario, id_usuario_alvo):
    """
    Aluno só pode registrar saída dele mesmo.
    Professor pode registrar de qualquer aluno.
    """
    if usuario['id_perfil'] == 1:  # Aluno
        return usuario['id_usuario'] == id_usuario_alvo
    return True  # Professor, Equipe, Admin podem tudo
```

---

## 🔀 Fluxo de Dados (Exemplo Prático)

### Cenário: Aluno registra uma saída

#### Passo 1: Frontend Envia Dados
```javascript
// usuario.js
const dados = {
    id_usuario: 3,
    motivo: "Consulta médica",
    id_usuario_logado: 3,
    id_perfil_logado: 1
};

fetch("http://127.0.0.1:8000/saidas/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
});
```

#### Passo 2: Controller Recebe
```python
# saida_controller.py
@router.post("/saidas/")
def registrar(saida_schema: SaidaSchema):
    # FastAPI valida automaticamente com Pydantic
    usuario_logado = {
        "id_usuario": saida_schema.id_usuario_logado,
        "id_perfil": saida_schema.id_perfil_logado
    }
    
    # Validar permissão
    validar_permissao_saida(usuario_logado, saida_schema.id_usuario)
    
    # Chamando o Service
    novo_id = service.registrar(saida_schema)
    
    return {"mensagem": "Saída registrada!", "id_saida": novo_id}
```

#### Passo 3: Service Valida
```python
# saida_service.py
class SaidaService:
    def registrar(self, saida):
        # Validação 1: usuário existe?
        usuario = usuario_repo.buscar_por_id(saida.id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")
        
        # Validação 2: motivo tem mínimo 3 caracteres?
        if len(saida.motivo) < 3:
            raise ValueError("Motivo muito curto")
        
        # Passar para Repository
        return self.repository.registrar(saida)
```

#### Passo 4: Repository Insere no Banco
```python
# saida_repository.py
class SaidaRepository:
    def registrar(self, saida):
        sql = """
            INSERT INTO saida (id_usuario, data_saida, motivo, data_cadastro)
            VALUES (?, ?, ?, ?)
        """
        cursor.execute(sql, (
            saida.id_usuario,
            datetime.now().isoformat(),
            saida.motivo,
            datetime.now().isoformat()
        ))
        conexao.commit()
        return cursor.lastrowid
```

#### Passo 5: Resposta Volta ao Frontend
```
← Servidor responde: 
{
    "mensagem": "Saída registrada!",
    "id_saida": 5
}

JavaScript recebe e exibe:
"✓ Saída registrada com sucesso"
```

---

## 🗄️ Banco de Dados

### SQLite
- Arquivo simples: `saidinha.db`
- Sem servidor necessário
- Ideal para aprendizado e projetos pequenos

### Tabelas

#### perfil
```sql
CREATE TABLE perfil (
    id_perfil INTEGER PRIMARY KEY AUTOINCREMENT,
    ds_perfil TEXT NOT NULL
);
-- Dados iniciais:
-- 1 = Aluno
-- 2 = Professor
-- 3 = Equipe de Apoio
```

#### usuario
```sql
CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    ra TEXT NOT NULL,
    nome TEXT NOT NULL,
    id_perfil INTEGER NOT NULL,  -- Referencia perfil.id_perfil
    email TEXT NOT NULL,
    senha TEXT NOT NULL,
    data_cadastro TEXT NOT NULL,
    FOREIGN KEY(id_perfil) REFERENCES perfil(id_perfil)
);
```

#### saida
```sql
CREATE TABLE saida (
    id_saida INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,  -- Referencia usuario.id_usuario
    data_saida TEXT NOT NULL,     -- Quando saiu
    motivo TEXT NOT NULL,         -- Por que saiu
    data_cadastro TEXT NOT NULL,  -- Quando foi registrado
    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
```

#### retorno
```sql
CREATE TABLE retorno (
    id_retorno INTEGER PRIMARY KEY AUTOINCREMENT,
    id_saida INTEGER NOT NULL,    -- Referencia saida.id_saida
    id_usuario INTEGER NOT NULL,  -- Referencia usuario.id_usuario
    data_retorno TEXT NOT NULL,   -- Quando retornou
    observacoes TEXT,             -- Observações (opcional)
    data_cadastro TEXT NOT NULL,  -- Quando foi registrado
    FOREIGN KEY(id_saida) REFERENCES saida(id_saida),
    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
```

---

## 🔐 Sistema de Permissões

### Matriz de Permissões

| Ação | Admin | Aluno | Professor | Equipe Apoio |
|------|-------|-------|-----------|--------------|
| **Criar Usuário** | ✅ | ❌ | ❌ | ❌ |
| **Ver Usuários** | ✅ | ✅ | ✅ | ✅ |
| **Editar Usuário** | ✅ | ❌ | ❌ | ❌ |
| **Deletar Usuário** | ✅ | ❌ | ❌ | ❌ |
| **Registrar Saída** | ✅ | ✅* | ✅ | ✅ |
| **Ver Saídas** | ✅ | ✅* | ✅ | ✅ |
| **Editar Saída** | ✅ | ❌ | ❌ | ❌ |
| **Deletar Saída** | ✅ | ❌ | ❌ | ❌ |
| **Ver Dashboard** | ✅ | ✅ | ✅ | ✅ |

*Aluno pode apenas as suas próprias saídas

### Como Funciona (utils/permissoes.py)

```python
def pode_registrar_saida(usuario, id_usuario_alvo):
    # Admin, Professor, Equipe = sim para qualquer aluno
    if usuario['id_perfil'] in [0, 2, 3]:
        return True
    
    # Aluno = sim apenas para ele mesmo
    if usuario['id_perfil'] == 1:
        return usuario['id_usuario'] == id_usuario_alvo
    
    return False
```

---

## 🚀 Como Iniciar o Servidor

### 1. Abrir Terminal na Pasta do Projeto
```bash
cd "G:\Meu Drive\Ensino Profissionalzante\Desenvolvimento de Sistemas\TCC\Saidinha"
```

### 2. Ativar Ambiente Virtual
```bash
.venv\Scripts\activate
```

### 3. Iniciar o Servidor
```bash
python -m uvicorn main:app --reload
```

Saída esperada:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 4. Abrir no Navegador
```
http://127.0.0.1:8000
```

---

## 📚 Resumo das Dependências

| Nome | Versão | Função |
|------|--------|--------|
| **fastapi** | 0.141.1 | Framework web — define rotas |
| **uvicorn** | 0.52.4 | Servidor — executa o FastAPI |
| **pydantic** | 2.13.4 | Validação — garante dados corretos |
| **starlette** | 1.6.0 | Base HTTP — usado pelo FastAPI |

---

## 🎓 Dicas para Aprendizado

### Ordem Recomendada de Estudo

1. **Entenda o Banco (database/)**
   - Leia `criar_banco.py`
   - Entenda as 4 tabelas
   - Abra `saidinha.db` com SQL Browser (opcional)

2. **Entenda os Models (models/)**
   - São simples, apenas estruturas Python
   - Veja como cada tabela vira uma classe

3. **Entenda os Repositories (repositories/)**
   - Veja como executar SQL
   - INSERT, SELECT, UPDATE, DELETE

4. **Entenda os Services (services/)**
   - Veja como validar dados
   - Lógica de negócio em Python puro

5. **Entenda os Controllers (controllers/)**
   - Veja as rotas HTTP
   - Como tudo se conecta

6. **Entenda o Frontend (frontend/)**
   - Como JavaScript envia dados
   - Como recebe respostas

### Exercícios Práticos

1. **Adicione um novo campo** a usuário (ex: telefone)
   - Modifique a tabela
   - Atualize Model
   - Atualize Repository
   - Atualize Service (validação)
   - Atualize Schema
   - Atualize Controller
   - Atualize formulário HTML

2. **Crie um novo endpoint**
   - POST /saidas/relatorio (gera relatório detalhado)
   - Use Repository para buscar dados
   - Use Service para calcular horas
   - Use Controller para responder

3. **Implemente Logout**
   - Limpar localStorage no frontend
   - Redirecionar para login

---

## 📞 Estrutura em Uma Linha

> **Frontend** (HTML/JS) → **Controller** (recebe) → **Service** (valida) → **Repository** (banco) → **Model** (estrutura)

---

Documento criado para fins educacionais.
Projeto Saidinha — Controle de Saídas de Alunos
