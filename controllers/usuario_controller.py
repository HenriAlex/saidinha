# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException


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
@router.post("/", status_code=201)
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

    # Envia o Model para o Service e trata possíveis erros.
    try:
        novo_id = service.cadastrar(usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "mensagem": "Usuário cadastrado com sucesso.",
        "id_usuario": novo_id
    }


# ============================================================
# LISTAR USUÁRIOS
# ============================================================


@router.get("/")
def listar():

    # Solicita ao Service a lista de usuários.
    usuarios = service.listar()

    return usuarios


# ============================================================
# EXCLUIR USUÁRIO (API)
# ============================================================


@router.delete("/{id_usuario}")
def excluir(id_usuario: int):
    try:
        service.excluir(id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Usuário excluído com sucesso."}


# ============================================================
# ATUALIZAR USUÁRIO (API)
# ============================================================


@router.put("/{id_usuario}")
def atualizar(id_usuario: int, usuario_schema: UsuarioSchema):
    usuario = Usuario(
        id_usuario=id_usuario,
        ra=usuario_schema.ra,
        nome=usuario_schema.nome,
        id_perfil=usuario_schema.id_perfil,
        email=usuario_schema.email,
        senha=usuario_schema.senha
    )

    try:
        service.atualizar(usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Usuário atualizado com sucesso."}