# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException


# Importa o modelo Retorno.
# Esse é o objeto utilizado internamente pela aplicação.
from models.retorno import Retorno


# Importa o Schema utilizado pelo FastAPI.
# Ele representa os dados recebidos pela API.
from schemas.retorno_schema import RetornoSchema


# Importa o Service responsável pelas regras
# de negócio dos retornos.
from services.retorno_service import RetornoService


# Cria o agrupador de rotas dos retornos.
# O prefixo "/retornos" será adicionado a todas as rotas
# definidas neste arquivo.
router = APIRouter(
    prefix="/retornos",
    tags=["Retornos"]
)


# Cria uma instância do Service.
# Esta instância será utilizada por todos os endpoints
# para processar as requisições.
service = RetornoService()


# ============================================================
# REGISTRAR RETORNO
# ============================================================

# Define a rota POST para registrar um novo retorno.
# POST é utilizado quando se quer criar um novo recurso.
@router.post("/", status_code=201)
def registrar(retorno_schema: RetornoSchema):

    # Cria um objeto do nosso Model Retorno.
    # O Model é utilizado internamente pela aplicação
    # e é diferente do Schema que é validado pelo FastAPI.
    retorno = Retorno(

        # Recebe o ID da saída do Schema.
        id_saida=retorno_schema.id_saida,

        # Recebe o ID do usuário do Schema.
        id_usuario=retorno_schema.id_usuario,

        # Recebe a data de retorno do Schema.
        data_retorno=retorno_schema.data_retorno,

        # Recebe as observações do Schema.
        observacoes=retorno_schema.observacoes
    )

    # Envia o Model para o Service e trata possíveis erros.
    try:

        # O Service irá validar os dados e inserir no banco.
        novo_id = service.registrar(retorno)

    # Captura erros de validação de regras de negócio.
    except ValueError as e:

        # Retorna erro 400 (Bad Request) com a mensagem de validação.
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados do servidor.
    except Exception as e:

        # Retorna erro 500 (Internal Server Error).
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso com o ID do retorno criado.
    return {
        "mensagem": "Retorno registrado com sucesso.",
        "id_retorno": novo_id
    }


# ============================================================
# LISTAR RETORNOS
# ============================================================

# Define a rota GET para listar todos os retornos.
# GET é utilizado quando se quer recuperar dados.
@router.get("/")
def listar():

    # Solicita ao Service a lista de todos os retornos.
    retornos = service.listar()

    # Retorna a lista de retornos encontrados.
    return retornos


# ============================================================
# BUSCAR RETORNO POR ID
# ============================================================

# Define a rota GET para buscar um retorno específico pelo ID.
# O {id_retorno} é um parâmetro dinâmico que será extraído da URL.
@router.get("/{id_retorno}")
def buscar_por_id(id_retorno: int):

    # Tenta buscar o retorno no banco.
    try:

        # Solicita ao Service o retorno pelo ID.
        retorno = service.buscar_por_id(id_retorno)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 (Not Found) se o retorno não existir.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna o retorno encontrado.
    return retorno


# ============================================================
# BUSCAR RETORNOS DE UMA SAÍDA
# ============================================================

# Define a rota GET para buscar todos os retornos
# relacionados a uma saída específica.
@router.get("/saida/{id_saida}")
def buscar_por_saida(id_saida: int):

    # Tenta buscar os retornos da saída.
    try:

        # Solicita ao Service os retornos da saída.
        retornos = service.buscar_por_saida(id_saida)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 (Bad Request).
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna os retornos encontrados.
    return retornos


# ============================================================
# BUSCAR RETORNOS DE UM USUÁRIO
# ============================================================

# Define a rota GET para buscar o histórico de retornos
# de um usuário específico.
#
# Esta rota permite que um aluno veja todos os seus retornos
# ou que um professor/gestor veja os retornos de um aluno.
@router.get("/usuario/{id_usuario}")
def buscar_por_usuario(id_usuario: int):

    # Tenta buscar os retornos do usuário.
    try:

        # Solicita ao Service os retornos do usuário.
        retornos = service.buscar_por_usuario(id_usuario)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 (Bad Request).
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna o histórico de retornos do usuário.
    return retornos


# ============================================================
# ATUALIZAR RETORNO
# ============================================================

# Define a rota PUT para atualizar um retorno existente.
# PUT é utilizado quando se quer atualizar um recurso existente.
@router.put("/{id_retorno}")
def atualizar(id_retorno: int, retorno_schema: RetornoSchema):

    # Cria um objeto do nosso Model Retorno com o ID informado.
    retorno = Retorno(

        # Define o ID do retorno que será atualizado.
        id_retorno=id_retorno,

        # Recebe o ID da saída do Schema.
        id_saida=retorno_schema.id_saida,

        # Recebe o ID do usuário do Schema.
        id_usuario=retorno_schema.id_usuario,

        # Recebe a data de retorno do Schema.
        data_retorno=retorno_schema.data_retorno,

        # Recebe as observações do Schema.
        observacoes=retorno_schema.observacoes
    )

    # Tenta atualizar o retorno.
    try:

        # Solicita ao Service a atualização.
        service.atualizar(retorno)

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
    return {"mensagem": "Retorno atualizado com sucesso."}


# ============================================================
# EXCLUIR RETORNO
# ============================================================

# Define a rota DELETE para excluir um retorno.
# DELETE é utilizado quando se quer remover um recurso.
@router.delete("/{id_retorno}")
def excluir(id_retorno: int):

    # Tenta excluir o retorno.
    try:

        # Solicita ao Service a exclusão.
        service.excluir(id_retorno)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 se o retorno não for encontrado.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso.
    return {"mensagem": "Retorno excluído com sucesso."}
