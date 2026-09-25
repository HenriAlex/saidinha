# Importa o APIRouter.
from fastapi import APIRouter, HTTPException


# Importa o Model Perfil.
from models.perfil import Perfil


# Importa o Schema utilizado pela API.
from schemas.perfil_schema import PerfilSchema


# Importa o Service de Perfil.
from services.perfil_service import PerfilService

# Importa as funções de permissão.
# Apenas admin pode gerenciar perfis.
from utils.permissoes import pode_gerenciar_perfis


# Cria as rotas dos perfis.
router = APIRouter(
    prefix="/perfis",
    tags=["Perfis"]
)


# Cria uma instância do Service.
service = PerfilService()


# ============================================================
# FUNÇÃO AUXILIAR DE VALIDAÇÃO
# ============================================================

def validar_permissao_gerenciar_perfil(usuario_logado):
    """
    Valida se o usuário logado pode gerenciar perfis.

    Apenas Admin pode gerenciar perfis.
    Se a permissão for negada, lança uma exceção HTTP 403.

    Args:
        usuario_logado (dict): Dados do usuário logado

    Raises:
        HTTPException: Com status 403 se acesso negado
    """

    if not pode_gerenciar_perfis(usuario_logado):
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: apenas administrador pode gerenciar perfis."
        )


# ============================================================
# CADASTRAR PERFIL
# ============================================================

# Define a rota POST.
@router.post("/", status_code=201)
def cadastrar(perfil_schema: PerfilSchema, id_usuario_logado: int = 0, id_perfil_logado: int = 0):

    # VALIDAÇÃO DE PERMISSÃO
    # Apenas admin pode cadastrar perfis
    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }
    validar_permissao_gerenciar_perfil(usuario_logado)

    # Cria um objeto do Model Perfil.
    perfil = Perfil(

        # Transfere a descrição recebida
        # pelo Schema para o Model.
        ds_perfil=perfil_schema.ds_perfil
    )

    # Envia o Model para o Service e trata possíveis erros.
    try:
        novo_id = service.cadastrar(perfil)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Captura exceções inesperadas para facilitar o diagnóstico local.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso com o id criado.
    return {
        "mensagem": "Perfil cadastrado com sucesso.",
        "id_perfil": novo_id
    }


# ============================================================
# LISTAR PERFIS
# ============================================================

# Define a rota GET.
@router.get("/")
def listar():

    # Solicita ao Service a lista de perfis.
    perfis = service.listar()

    # Retorna a lista de perfis.
    return perfis


# ============================================================
# EXCLUIR PERFIL (API)
# ============================================================


@router.delete("/{id_perfil}")
def excluir(id_perfil: int, id_usuario_logado: int = 0, id_perfil_logado: int = 0):
    # VALIDAÇÃO DE PERMISSÃO
    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }
    validar_permissao_gerenciar_perfil(usuario_logado)

    try:
        service.excluir(id_perfil)
    except ValueError as e:
        # Erro de validação (por exemplo, perfil não encontrado)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Erro genérico
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Perfil excluído com sucesso."}


# ============================================================
# ATUALIZAR PERFIL (API)
# ============================================================


@router.put("/{id_perfil}")
def atualizar(id_perfil: int, perfil_schema: PerfilSchema, id_usuario_logado: int = 0, id_perfil_logado: int = 0):
    # VALIDAÇÃO DE PERMISSÃO
    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }
    validar_permissao_gerenciar_perfil(usuario_logado)

    # Cria um objeto Perfil com o id informado
    perfil = Perfil(
        id_perfil=id_perfil,
        ds_perfil=perfil_schema.ds_perfil
    )

    try:
        service.atualizar(perfil)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Perfil atualizado com sucesso."}