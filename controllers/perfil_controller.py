# Importa o APIRouter.
from fastapi import APIRouter, HTTPException


# Importa o Model Perfil.
from models.perfil import Perfil


# Importa o Schema utilizado pela API.
from schemas.perfil_schema import PerfilSchema


# Importa o Service de Perfil.
from services.perfil_service import PerfilService


# Cria as rotas dos perfis.
router = APIRouter(
    prefix="/perfis",
    tags=["Perfis"]
)


# Cria uma instância do Service.
service = PerfilService()


# ============================================================
# CADASTRAR PERFIL
# ============================================================

# Define a rota POST.
@router.post("/", status_code=201)
def cadastrar(perfil_schema: PerfilSchema):

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
def excluir(id_perfil: int):
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
def atualizar(id_perfil: int, perfil_schema: PerfilSchema):
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