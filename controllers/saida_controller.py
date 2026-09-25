# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException


# Importa o modelo Saida.
# Esse é o objeto utilizado internamente pela aplicação.
from models.saida import Saida


# Importa o Schema utilizado pelo FastAPI.
# Ele representa os dados recebidos pela API.
from schemas.saida_schema import SaidaSchema


# Importa o Service responsável pelas regras
# de negócio das saídas.
from services.saida_service import SaidaService


# Cria o agrupador de rotas das saídas.
# O prefixo "/saidas" será adicionado a todas as rotas
# definidas neste arquivo.
router = APIRouter(
    prefix="/saidas",
    tags=["Saídas"]
)


# Cria uma instância do Service.
# Esta instância será utilizada por todos os endpoints
# para processar as requisições.
service = SaidaService()


# ============================================================
# REGISTRAR SAÍDA
# ============================================================

# Define a rota POST para registrar uma nova saída.
# POST é utilizado quando se quer criar um novo recurso.
@router.post("/", status_code=201)
def registrar(saida_schema: SaidaSchema):

    # Cria um objeto do nosso Model Saida.
    # O Model é utilizado internamente pela aplicação
    # e é diferente do Schema que é validado pelo FastAPI.
    saida = Saida(

        # Recebe o ID do usuário do Schema.
        id_usuario=saida_schema.id_usuario,

        # Recebe a data de entrada do Schema.
        data_entrada=saida_schema.data_entrada,

        # Recebe a data de saída do Schema.
        data_saida=saida_schema.data_saida,

        # Recebe o motivo do Schema.
        motivo=saida_schema.motivo
    )

    # Envia o Model para o Service e trata possíveis erros.
    try:

        # O Service irá validar os dados e inserir no banco.
        novo_id = service.registrar(saida)

    # Captura erros de validação de regras de negócio.
    except ValueError as e:

        # Retorna erro 400 (Bad Request) com a mensagem de validação.
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados do servidor.
    except Exception as e:

        # Retorna erro 500 (Internal Server Error).
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso com o ID da saída criada.
    return {
        "mensagem": "Saída registrada com sucesso.",
        "id_saida": novo_id
    }


# ============================================================
# LISTAR SAÍDAS
# ============================================================

# Define a rota GET para listar todas as saídas.
# GET é utilizado quando se quer recuperar dados.
@router.get("/")
def listar():

    # Solicita ao Service a lista de todas as saídas.
    saidas = service.listar()

    # Retorna a lista de saídas encontradas.
    return saidas


# ============================================================
# BUSCAR SAÍDA POR ID
# ============================================================

# Define a rota GET para buscar uma saída específica pelo ID.
# O {id_saida} é um parâmetro dinâmico que será extraído da URL.
@router.get("/{id_saida}")
def buscar_por_id(id_saida: int):

    # Tenta buscar a saída no banco.
    try:

        # Solicita ao Service a saída pelo ID.
        saida = service.buscar_por_id(id_saida)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 (Not Found) se a saída não existir.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna a saída encontrada.
    return saida


# ============================================================
# BUSCAR SAÍDAS DE UM USUÁRIO
# ============================================================

# Define a rota GET para buscar o histórico de saídas
# de um usuário específico.
#
# Esta rota permite que um aluno veja todas as suas saídas
# ou que um professor/gestor veja as saídas de um aluno.
@router.get("/usuario/{id_usuario}")
def buscar_por_usuario(id_usuario: int):

    # Tenta buscar as saídas do usuário.
    try:

        # Solicita ao Service as saídas do usuário.
        saidas = service.buscar_por_usuario(id_usuario)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 (Bad Request).
        raise HTTPException(status_code=400, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna o histórico de saídas do usuário.
    return saidas


# ============================================================
# ATUALIZAR SAÍDA
# ============================================================

# Define a rota PUT para atualizar uma saída existente.
# PUT é utilizado quando se quer atualizar um recurso existente.
@router.put("/{id_saida}")
def atualizar(id_saida: int, saida_schema: SaidaSchema):

    # Cria um objeto do nosso Model Saida com o ID informado.
    saida = Saida(

        # Define o ID da saída que será atualizada.
        id_saida=id_saida,

        # Recebe o ID do usuário do Schema.
        id_usuario=saida_schema.id_usuario,

        # Recebe a data de entrada do Schema.
        data_entrada=saida_schema.data_entrada,

        # Recebe a data de saída do Schema.
        data_saida=saida_schema.data_saida,

        # Recebe o motivo do Schema.
        motivo=saida_schema.motivo
    )

    # Tenta atualizar a saída.
    try:

        # Solicita ao Service a atualização.
        service.atualizar(saida)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 400 ou 404 dependendo do tipo de erro.
        status_code = 404 if "não encontrada" in str(e) else 400
        raise HTTPException(status_code=status_code, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso.
    return {"mensagem": "Saída atualizada com sucesso."}


# ============================================================
# EXCLUIR SAÍDA
# ============================================================

# Define a rota DELETE para excluir uma saída.
# DELETE é utilizado quando se quer remover um recurso.
@router.delete("/{id_saida}")
def excluir(id_saida: int):

    # Tenta excluir a saída.
    try:

        # Solicita ao Service a exclusão.
        service.excluir(id_saida)

    # Captura erros de validação.
    except ValueError as e:

        # Retorna erro 404 se a saída não for encontrada.
        raise HTTPException(status_code=404, detail=str(e))

    # Captura erros inesperados.
    except Exception as e:

        # Retorna erro 500.
        raise HTTPException(status_code=500, detail=str(e))

    # Retorna uma mensagem de sucesso.
    return {"mensagem": "Saída excluída com sucesso."}
