# 📚 Sistema de Atividades e Consulta de Pontos

## 📖 Visão Geral

Este documento descreve o novo módulo de **Atividades e Consulta de Pontos** do sistema Saidinha. Este módulo permite:

1. **Cadastro de Disciplinas**: Registrar as matérias/disciplinas do curso
2. **Cadastro de Atividades**: Registrar atividades avaliativas com pontuação por aluno, disciplina e bimestre
3. **Consulta de Pontos**: Visualizar o total de pontos por disciplina agrupado por aluno e bimestre

## 🎯 Funcionalidades

### 1. Disciplinas

#### Cadastrar Disciplina
- Acesse a seção **Disciplinas** no menu lateral
- Preencha a descrição da disciplina (ex: Matemática, Português)
- Clique em **Registrar Disciplina**

#### Operações
- ✏️ **Editar**: Clique no ícone de lápis para atualizar a descrição
- 🗑️ **Excluir**: Clique no ícone de lixeira para remover a disciplina

### 2. Atividades

#### Cadastrar Atividade
- Acesse a seção **Atividades** no menu lateral
- Preencha os campos:
  - **👤 Aluno**: Selecione o aluno
  - **📚 Disciplina**: Selecione a disciplina
  - **📅 Data da Atividade**: Escolha a data em que a atividade foi realizada
  - **📊 Bimestre**: Selecione entre 1º, 2º, 3º ou 4º bimestre
  - **⭐ Pontos**: Insira a pontuação da atividade (ex: 10, 9.5)
  - **📝 Descrição**: (Opcional) Adicione informações como "Prova", "Trabalho", etc.
- Clique em **Registrar Atividade**

#### Operações
- 🗑️ **Excluir**: Clique no ícone de lixeira para remover a atividade

### 3. Consulta de Pontos

#### Filtrar e Consultar
- Acesse a seção **Pontos** no menu lateral
- Use os filtros:
  - **📊 Bimestre**: Selecione qual bimestre deseja consultar (obrigatório)
  - **📚 Disciplina**: (Opcional) Filtre por uma disciplina específica
- Clique em **🔍 Consultar**

#### Resultado da Consulta
O sistema exibe:
- Uma tabela para cada aluno com:
  - **Disciplina**: Nome da matéria
  - **Total Pontos**: Soma de todos os pontos naquele bimestre
  - **Atividades**: Quantidade de atividades registradas

## 💾 Estrutura de Dados

### Tabela: `disciplina`
```sql
CREATE TABLE disciplina (
    id_disciplina INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    data_cadastro TEXT NOT NULL
);
```

### Tabela: `atividade`
```sql
CREATE TABLE atividade (
    id_atividade INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,
    data_atividade TEXT NOT NULL,
    bimestre INTEGER NOT NULL,
    pontos REAL NOT NULL,
    descricao TEXT,
    data_cadastro TEXT NOT NULL,
    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY(id_disciplina) REFERENCES disciplina(id_disciplina)
);
```

## 🔌 Endpoints da API

### Disciplinas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/disciplinas/` | Criar nova disciplina |
| GET | `/disciplinas/` | Listar todas as disciplinas |
| GET | `/disciplinas/{id_disciplina}` | Buscar disciplina por ID |
| PUT | `/disciplinas/{id_disciplina}` | Atualizar disciplina |
| DELETE | `/disciplinas/{id_disciplina}` | Excluir disciplina |

### Atividades

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/atividades/` | Criar nova atividade |
| GET | `/atividades/` | Listar todas as atividades |
| GET | `/atividades/{id_atividade}` | Buscar atividade por ID |
| GET | `/atividades/usuario/{id_usuario}` | Listar atividades de um usuário |
| GET | `/atividades/bimestre/{bimestre}` | Listar atividades por bimestre |
| GET | `/atividades/usuario/{id_usuario}/disciplina/{id_disciplina}/bimestre/{bimestre}` | Consulta específica |
| PUT | `/atividades/{id_atividade}` | Atualizar atividade |
| DELETE | `/atividades/{id_atividade}` | Excluir atividade |

## 📁 Arquivos Criados

### Backend (Python)
- `models/disciplina.py` - Modelo de dados para Disciplina
- `models/atividade.py` - Modelo de dados para Atividade
- `repositories/disciplina_repository.py` - Acesso a dados de Disciplinas
- `repositories/atividade_repository.py` - Acesso a dados de Atividades
- `services/disciplina_service.py` - Regras de negócio de Disciplinas
- `services/atividade_service.py` - Regras de negócio de Atividades
- `schemas/disciplina_schema.py` - Schema de validação (Pydantic)
- `schemas/atividade_schema.py` - Schema de validação (Pydantic)
- `controllers/disciplina_controller.py` - Rotas REST de Disciplinas
- `controllers/atividade_controller.py` - Rotas REST de Atividades

### Frontend (JavaScript/HTML)
- `frontend/js/disciplina.js` - Lógica de Disciplinas
- `frontend/js/atividade.js` - Lógica de Atividades
- `frontend/js/pontos.js` - Lógica de Consulta de Pontos
- `frontend/index.html` - Seções HTML para as novas telas

### Banco de Dados
- Tabelas adicionadas: `disciplina` e `atividade`
- Arquivo modificado: `database/criar_banco.py`

## 🎨 Design e UI/UX

O sistema segue o padrão de design Material Design 3 usado no projeto:
- Ícones usando emojis para melhor compreensão
- Cards responsivos para exibição de dados
- Formulários inline para entrada rápida de dados
- Cores consistentes (azul primário: #3b82f6)
- Suporte a tema claro/escuro

## ✅ Validações

### Disciplina
- Descrição obrigatória
- Não permite disciplinas duplicadas (case-insensitive)

### Atividade
- ID do usuário obrigatório
- ID da disciplina obrigatório
- Data obrigatória (formato YYYY-MM-DD)
- Bimestre obrigatório (entre 1 e 4)
- Pontos obrigatório (não pode ser negativo)
- Descrição opcional

## 🔒 Permissões

Por padrão, as operações respeitam a matriz de permissões do sistema:
- **Admin**: Acesso total a todos os dados
- **Professor**: Pode visualizar dados, mas edição limitada
- **Equipe de Apoio**: Acesso similar ao Professor
- **Aluno**: Pode visualizar seus próprios dados

## 📊 Exemplo de Uso

### Cenário 1: Registrar Atividades de um Bimestre

1. **Acesse Disciplinas** e cadastre as matérias: Matemática, Português, História
2. **Acesse Atividades** e registre:
   - Aluno: João | Disciplina: Matemática | Data: 01/09 | Bimestre: 1 | Pontos: 9.5 | Desc: Prova
   - Aluno: João | Disciplina: Matemática | Data: 15/09 | Bimestre: 1 | Pontos: 8.0 | Desc: Trabalho
   - Aluno: Maria | Disciplina: Português | Data: 05/09 | Bimestre: 1 | Pontos: 10.0 | Desc: Prova

3. **Consulte Pontos**:
   - Selecione: Bimestre = 1º
   - Resultado mostrará:
     - João: Matemática = 17.5 pontos, 2 atividades
     - Maria: Português = 10.0 pontos, 1 atividade

## 🚀 Próximos Passos (Sugestões)

- Adicionar relatórios em PDF
- Implementar gráficos de desempenho
- Adicionar média por disciplina/bimestre
- Implementar sistema de metas/objetivos
- Adicionar histórico de alterações

## 📝 Notas

- Os dados não serão deletados ao reiniciar o servidor (SQLite persiste em arquivo)
- O sistema mantém histórico da data de cadastro de cada registro
- Recomenda-se fazer backup do arquivo `saidinha.db` periodicamente
