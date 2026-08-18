# Importa o FastAPI.
# Ele será utilizado para criar nossa aplicação.
from fastapi import FastAPI


# Importa o Controller de usuários.
from controllers.usuario_controller import router as usuario_router


# Importa o Controller de perfis.
from controllers.perfil_controller import router as perfil_router


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


# Cria uma rota simples para verificar
# se a API está funcionando.
@app.get("/")
def inicio():

    # Retorna uma mensagem.
    return {
        "mensagem": "API Saidinha funcionando!"
    }