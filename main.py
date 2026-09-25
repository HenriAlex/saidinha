# Importa o FastAPI.
# Ele será utilizado para criar nossa aplicação.
from fastapi import FastAPI

# Importa o Controller de usuários.
from controllers.usuario_controller import router as usuario_router

# Importa o Controller de perfis.
from controllers.perfil_controller import router as perfil_router

# Importa o Controller de saídas.
from controllers.saida_controller import router as saida_router

# Importa o Controller de retornos.
from controllers.retorno_controller import router as retorno_router

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