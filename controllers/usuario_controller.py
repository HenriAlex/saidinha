# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter


# Importa o modelo Usuario.
# Esse é o objeto utilizado internamente pela aplicação.
from models.usuario import Usuario


# Importa o Schema utilizado pelo FastAPI.
# Ele representa os dados recebidos pela API.
from schemas.usuario_schema import UsuarioSchema


# Importa o Service responsável pelas regras
# de negócio dos usuários.
from services.usuario_service import UsuarioService


# Cria o agrupador de rotas dos usuários.
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)


# Cria uma instância do Service.
service = UsuarioService()


# ============================================================
# CADASTRAR USUÁRIO
# ============================================================

# Define a rota POST para cadastrar um usuário.
@router.post("/")
def cadastrar(usuario_schema: UsuarioSchema):

    # Cria um objeto do nosso Model Usuario.
    usuario = Usuario(

        # Recebe o RA do Schema.
        ra=usuario_schema.ra,

        # Recebe o nome do Schema.
        nome=usuario_schema.nome,

        # Recebe o perfil do Schema.
        id_perfil=usuario_schema.id_perfil,

        # Recebe o e-mail do Schema.
        email=usuario_schema.email,

        # Recebe a senha do Schema.
        senha=usuario_schema.senha
    )

    # Envia o Model para o Service.
    service.cadastrar(usuario)

    # Retorna uma mensagem de sucesso.
    return {
        "mensagem": "Usuário cadastrado com sucesso."
    }