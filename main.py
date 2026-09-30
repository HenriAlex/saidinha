# Importa o FastAPI.
# Ele será utilizado para criar nossa aplicação.
from fastapi import FastAPI

# Importa o módulo que cria o banco de dados.
# Isso garante que o banco será criado na inicialização.
from database.criar_banco import CriarBanco

# Importa o Controller de usuários.
from controllers.usuario_controller import router as usuario_router

# Importa o Controller de perfis.
from controllers.perfil_controller import router as perfil_router

# Importa o Controller de saídas.
from controllers.saida_controller import router as saida_router

# Importa o Controller de retornos.
from controllers.retorno_controller import router as retorno_router

# Importa o Controller de faltas.
from controllers.falta_controller import router as falta_router

# Importa o Controller de relatórios.
from controllers.relatorio_controller import router as relatorio_router

# Importa o Controller de disciplinas.
from controllers.disciplina_controller import router as disciplina_router

# Importa o Controller de atividades.
from controllers.atividade_controller import router as atividade_router

# Importa o middleware responsável pelo CORS.
from fastapi.middleware.cors import CORSMiddleware

# Cria a aplicação FastAPI.
app = FastAPI(
    title="Saidinha API",
    description="API do sistema Saidinha",
    version="1.0.0"
)


# Adiciona as rotas relacionadas aos usuários
# à aplicação principal.
app.include_router(usuario_router)


# Adiciona as rotas relacionadas aos perfis
# à aplicação principal.
app.include_router(perfil_router)


# Adiciona as rotas relacionadas às saídas
# à aplicação principal.
app.include_router(saida_router)


# Adiciona as rotas relacionadas aos retornos
# à aplicação principal.
app.include_router(retorno_router)


# Adiciona as rotas relacionadas às faltas
# à aplicação principal.
app.include_router(falta_router)


# Adiciona as rotas de relatórios/estatísticas
# à aplicação principal.
app.include_router(relatorio_router)


# Adiciona as rotas relacionadas às disciplinas
# à aplicação principal.
app.include_router(disciplina_router)


# Adiciona as rotas relacionadas às atividades
# à aplicação principal.
app.include_router(atividade_router)


# Cria uma rota simples para verificar
# se a API está funcionando.
@app.get("/")
def inicio():

    # Retorna uma mensagem.
    return {
        "mensagem": "API Saidinha funcionando!"
    }

# Configura as origens que poderão acessar a API.
app.add_middleware(

    # Define o middleware de CORS.
    CORSMiddleware,

    # Permite qualquer origem durante o desenvolvimento.
    allow_origins=["*"],

    # Permite envio de credenciais.
    allow_credentials=True,

    # Permite todos os métodos HTTP.
    allow_methods=["*"],

    # Permite todos os cabeçalhos HTTP.
    allow_headers=["*"]
)