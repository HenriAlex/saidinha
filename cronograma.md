| Etapa  | Conteúdo                                                       |       Status       |
| ------ | ---------------------------------------------------------------| :----------------: |
| **1**  | Definição do problema, escopo e requisitos                     |        ✅         |
| **2**  | Modelagem do Banco de Dados (MER/DER)                          |        ✅         |
| **3**  | Script de criação do banco (MySQL para estudo)                 |        ✅         |
| **4**  | Criação das Classes Model (`Perfil` e `Usuario`)               |        ✅         |
| **5**  | Banco SQLite (Conexão e criação automática das tabelas)        |        ✅         |
| **6**  | Repository (Acesso e persistência dos dados)                   |        ✅         |
| **7**  | Service (Regras de negócio e autenticação)                     |        ✅         |
| **8**  | API REST com FastAPI (Schemas, Controllers e Rotas)            | **⬅ Estamos aqui** |
| **9**  | Interface Web (HTML/CSS/JavaScript)                            |        ⏳         |
| **10** | Integração Front-End × Back-End                                |        ⏳         |
| **11** | Login e autenticação                                           |        ⏳         |
| **12** | Cadastro de Usuários                                           |        ⏳         |
| **13** | Cadastro de Saídas                                             |        ⏳         |
| **14** | Dashboard e Consultas                                          |        ⏳         |
| **15** | Testes, validações e ajustes                                   |        ⏳         |
| **16** | Publicação e Apresentação do Projeto                           |        ⏳         |
|:--------------------------------------------------------------------------------------------:|

================================================
== PREPARAÇÃO DO AMBIENTE DO PROJETO SAIDINHA ==
================================================

1. Baixar o código do repositório GitHub
git clone https://github.com/HenriAlex/saidinha.git
e para baixar a versão mais atual: git pull | (o terminar precisa ser aberto na raiz do diretório Saidinha)

2. Entrar na pasta do projeto
cd saidinha

3. Verificar a versão do Python
python --version
Deve aparecer algo semelhante a: Python 3.13.x

4. Criar o ambiente virtual
python -m venv .venv

5. Ativar o ambiente virtual
.\.venv\Scripts\Activate.ps1
Depois de ativado, deverá aparecer algo parecido com: (.venv) PS C:\...\saidinha>

6. Instalar as dependências
python -m pip install -r requirements.txt

7. Criar o banco de dados e suas tabelas
python -m database.criar_banco

8. Executar a API
python -m uvicorn main:app --reload

9. Acessar a API
No navegador: http://127.0.0.1:8000

Para acessar a documentação e testar as rotas: http://127.0.0.1:8000/docs