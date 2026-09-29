# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException

# Importa datetime para preenchimento automático de data/hora.
from datetime import datetime

# Importa o modelo Falta.
# Esse é o objeto utilizado internamente pela aplicação.
from models.falta import Falta

# Importa as funções de permissão.
# Essas funções verificam se o usuário pode realizar a ação.
from utils.permissoes import pode_registrar_falta, pode_editar_ou_excluir


# Importa o Schema utilizado pelo FastAPI.
# Ele representa os dados recebidos pela API.
from schemas.falta_schema import FaltaSchema


# Importa o Service responsável pelas regras
# de negócio das faltas.
from services.falta_service import FaltaService


# Cria o agrupador de rotas das faltas.
# O prefixo "/faltas" será adicionado a todas as rotas
# definidas neste arquivo.
router = APIRouter(
    prefix="/faltas",
    tags=["Faltas"]
)


# Cria uma instância do Service.
# Esta instância será utilizada por todos os endpoints
# para processar as requisições.
service = FaltaService()


# ============================================================
# FUNÇÃO AUXILIAR DE VALIDAÇÃO
# ============================================================

def validar_permissao_falta(usuario_logado, id_usuario_falta):
    """
    Valida se o usuário logado pode registrar falta para outro usuário.

    Se a permissão for negada, lança uma exceção HTTP 403.

    Args:
        usuario_logado (dict): Dados do usuário logado
        id_usuario_falta (int): ID do usuário para qual quer registrar falta

    Raises:
        HTTPException: Com status 403 se acesso negado
    """

    # Verifica a permissão usando a função do módulo permissões
    if not pode_registrar_falta(usuario_logado, id_usuario_falta):

        # Se negado, lança exceção HTTP 403 Forbidden
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: você não pode registrar falta para este usuário."
        )


def validar_permissao_editar_excluir(usuario_logado):
    """
    Valida se o usuário logado pode Atualizar ou Eliminar uma falta.

    Pela matriz de permissões, somente o admin pode fazer isso.

    Raises:
        HTTPException: Com status 403 se acesso negado
    """

    if not pode_editar_ou_excluir(usuario_logado):
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: apenas administrador pode atualizar ou excluir faltas."
        )


# ============================================================
# REGISTRAR FALTA
# ============================================================

# Define a rota POST para registrar uma nova falta.
# POST é utilizado quando se quer criar um novo recurso.
@router.post("/", status_code=201)
def registrar(falta_schema: FaltaSchema):

    # VALIDAÇÃO DE PERMISSÃO
    #
    # Verifica se o usuário logado tem permissão
    # de registrar falta para este aluno.
    usuario_logado = {
        "id_usuario": falta_schema.id_usuario_logado,
        "id_perfil": falta_schema.id_perfil_logado
    }

    # Valida a permissão (lança exceção se negado)
    validar_permissao_falta(usuario_logado, falta_schema.id_usuario)

    # Cria um objeto do nosso Model Falta.
    # O Model é utilizado internamente pela aplicação
    # e é diferente do Schema que é validado pelo FastAPI.
    falta = Falta(

        # Recebe o ID do usuário do Schema.
        id_usuario=falta_schema.id_usuario,

        # Recebe a data da falta do Schema.
        data_falta=falta_schema.data_falta,

        # Recebe o motivo da falta (opcional).
        motivo=falta_schema.motivo,

        # Recebe as observações do Schema.
        observacoes=falta_schema.observacoes
    )

    # Envia o Model para o Service e trata possíveis erros.
    try:

        # O Service irá validar os dados e inserir no banco.
        novo_id = service.registrar(falta)

    # Captura erros de validação de regras de negócio.
    except ValueError as e:

        # Retorna erro 400 (Bad Request) com a mensagem de validação.
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados do servidor.
    except Exception as e:

        # Retorna erro 500 (Internal Server Error).
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso com o ID da falta criada.
    return {
        "mensagem": "Falta registrada com sucesso.",
        "id_falta": novo_id
    }


# ============================================================
# LISTAR FALTAS
# ============================================================

# Define a rota GET para listar todas as faltas.
# GET é utilizado quando se quer recuperar dados.
@router.get("/")
def listar():

    # Solicita ao Service a lista de todas as faltas.
    faltas = service.listar()

    # Retorna a lista de faltas encontradas.
    return faltas


# ============================================================
# BUSCAR FALTA POR ID
# ============================================================

# Define a rota GET para buscar uma falta específica pelo ID.
# O {id_falta} é um parâmetro dinâmico que será extraído da URL.
@router.get("/{id_falta}")
def buscar_por_id(id_falta: int):

    # Tenta buscar a falta no banco.
    try:

        # Solicita ao Service a falta pelo ID.
        falta = service.buscar_por_id(id_falta)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 (Not Found) se a falta não existir.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna a falta encontrada.
    return falta


# ============================================================
# BUSCAR FALTAS DE UM USUÁRIO
# ============================================================

# Define a rota GET para buscar o histórico de faltas
# de um usuário específico.
#
# Esta rota permite que um aluno veja todas as suas faltas
# ou que um professor/gestor veja as faltas de um aluno.
@router.get("/usuario/{id_usuario}")
def buscar_por_usuario(id_usuario: int):

    # Tenta buscar as faltas do usuário.
    try:

        # Solicita ao Service as faltas do usuário.
        faltas = service.buscar_por_usuario(id_usuario)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 (Bad Request).
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna o histórico de faltas do usuário.
    return faltas


# ============================================================
# BUSCAR FALTAS DE UMA DATA
# ============================================================

# Define a rota GET para buscar todas as faltas
# de uma data específica.
@router.get("/data/{data_falta}")
def buscar_por_data(data_falta: str):

    # Tenta buscar as faltas da data.
    try:

        # Solicita ao Service as faltas da data.
        faltas = service.buscar_por_data(data_falta)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 (Bad Request).
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna as faltas encontradas.
    return faltas


# ============================================================
# ATUALIZAR FALTA
# ============================================================

# Define a rota PUT para atualizar uma falta existente.
# PUT é utilizado quando se quer atualizar um recurso existente.
@router.put("/{id_falta}")
def atualizar(id_falta: int, falta_schema: FaltaSchema):

    # VALIDAÇÃO DE PERMISSÃO
    # Somente admin pode atualizar uma falta.
    usuario_logado = {
        "id_usuario": falta_schema.id_usuario_logado,
        "id_perfil": falta_schema.id_perfil_logado
    }
    validar_permissao_editar_excluir(usuario_logado)

    # Cria um objeto do nosso Model Falta com o ID informado.
    falta = Falta(

        # Define o ID da falta que será atualizada.
        id_falta=id_falta,

        # Recebe o ID do usuário do Schema.
        id_usuario=falta_schema.id_usuario,

        # Recebe a data da falta do Schema.
        data_falta=falta_schema.data_falta,

        # Recebe o motivo da falta do Schema.
        motivo=falta_schema.motivo,

        # Recebe as observações do Schema.
        observacoes=falta_schema.observacoes
    )

    # Tenta atualizar a falta.
    try:

        # Solicita ao Service a atualização.
        service.atualizar(falta)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 ou 404 dependendo do tipo de erro.
        status_code = 404 if "não encontrado" in str(e) else 400
        raise HTTPException(status_code=status_code, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso.
    return {"mensagem": "Falta atualizada com sucesso."}


# ============================================================
# EXCLUIR FALTA
# ============================================================

# Define a rota DELETE para excluir uma falta.
# DELETE é utilizado quando se quer remover um recurso.
@router.delete("/{id_falta}")
def excluir(id_falta: int, id_usuario_logado: int = 0, id_perfil_logado: int = 0):

    # VALIDAÇÃO DE PERMISSÃO
    # Somente admin pode excluir uma falta.
    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }
    validar_permissao_editar_excluir(usuario_logado)

    # Tenta excluir a falta.
    try:

        # Solicita ao Service a exclusão.
        service.excluir(id_falta)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 se a falta não for encontrada.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso.
    return {"mensagem": "Falta excluída com sucesso."}
