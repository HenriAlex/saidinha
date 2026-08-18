# Importa o APIRouter.
from fastapi import APIRouter


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
@router.post("/")
def cadastrar(perfil_schema: PerfilSchema):

    # Cria um objeto do Model Perfil.
    perfil = Perfil(

        # Transfere a descrição recebida
        # pelo Schema para o Model.
        ds_perfil=perfil_schema.ds_perfil
    )

    # Envia o Model para o Service.
    service.cadastrar(perfil)

    # Retorna uma mensagem de sucesso.
    return {
        "mensagem": "Perfil cadastrado com sucesso."
    }