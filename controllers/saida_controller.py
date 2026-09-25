# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException

# Importa datetime para preenchimento automático de data/hora.
from datetime import datetime

# Importa o modelo Saida.
# Esse é o objeto utilizado internamente pela aplicação.
from models.saida import Saida

# Importa as funções de permissão.
# Essas funções verificam se o usuário pode realizar a ação.
from utils.permissoes import pode_registrar_saida, pode_editar_ou_excluir, eh_aluno


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
# FUNÇÃO AUXILIAR DE VALIDAÇÃO
# ============================================================

def validar_permissao_saida(usuario_logado, id_usuario_saida):
    """
    Valida se o usuário logado pode registrar saída para outro usuário.

    Se a permissão for negada, lança uma exceção HTTP 403.

    Args:
        usuario_logado (dict): Dados do usuário logado
        id_usuario_saida (int): ID do usuário para qual quer registrar saída

    Raises:
        HTTPException: Com status 403 se acesso negado
    """

    # Verifica a permissão usando a função do módulo permissões
    if not pode_registrar_saida(usuario_logado, id_usuario_saida):

        # Se negado, lança exceção HTTP 403 Forbidden
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: você não pode registrar saída para este usuário."
        )


def validar_permissao_editar_excluir(usuario_logado):
    """
    Valida se o usuário logado pode Atualizar ou Eliminar uma saída.

    Pela matriz de permissões, somente o admin pode fazer isso.

    Raises:
        HTTPException: Com status 403 se acesso negado
    """

    if not pode_editar_ou_excluir(usuario_logado):
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: apenas administrador pode atualizar ou excluir saídas."
        )


# ============================================================
# REGISTRAR SAÍDA
# ============================================================

# Define a rota POST para registrar uma nova saída.
# POST é utilizado quando se quer criar um novo recurso.
@router.post("/", status_code=201)
def registrar(saida_schema: SaidaSchema):

    # VALIDAÇÃO DE PERMISSÃO
    #
    # Verifica se o usuário logado tem permissão
    # de registrar saída para este aluno.
    usuario_logado = {
        "id_usuario": saida_schema.id_usuario_logado,
        "id_perfil": saida_schema.id_perfil_logado
    }

    # Valida a permissão (lança exceção se negado)
    validar_permissao_saida(usuario_logado, saida_schema.id_usuario)

    # Cria um objeto do nosso Model Saida.
    # O Model é utilizado internamente pela aplicação
    # e é diferente do Schema que é validado pelo FastAPI.
    #
    # IMPORTANTE: data_saida é preenchida AUTOMATICAMENTE
    # aqui no servidor com a data/hora atual.
    # O cliente (frontend) NÃO envia esse valor.
    saida = Saida(

        # Recebe o ID do usuário do Schema.
        id_usuario=saida_schema.id_usuario,

        # Data/hora de saída é AUTOMATICAMENTE
        # preenchida com a data/hora do registro.
        data_saida=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),

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

# Define a rota GET para listar as saídas.
# GET é utilizado quando se quer recuperar dados.
#
# Pela matriz de permissões, o Aluno só pode VER as suas
# próprias saídas. Professor, Equipe de Apoio e Admin veem todas.
# Por isso a rota recebe (opcionalmente) o usuário logado:
# se for Aluno, a lista é filtrada; caso contrário, retorna tudo.
@router.get("/")
def listar(id_usuario_logado: int = 0, id_perfil_logado: int = 0):

    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }

    # Se quem está pedindo é Aluno, mostra somente as suas saídas.
    if eh_aluno(usuario_logado):
        return service.buscar_por_usuario(id_usuario_logado)

    # Admin, Professor e Equipe de Apoio veem todas as saídas.
    return service.listar()


# ============================================================
# LISTAR SAÍDAS SEM RETORNO (PENDENTES)
# ============================================================

# Define a rota GET para listar apenas saídas sem retorno.
# Esta rota retorna os alunos que saíram e ainda não voltaram.
#
# O Aluno só pode ver a SUA PRÓPRIA pendência de retorno.
# Professor, Equipe de Apoio e Admin veem as de todos os alunos.
@router.get("/pendentes/lista")
def listar_saidas_sem_retorno(id_usuario_logado: int = 0, id_perfil_logado: int = 0):

    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }

    # Solicita ao Service as saídas que não têm retorno.
    saidas = service.buscar_saidas_sem_retorno()

    # Se for Aluno, filtra para mostrar somente a própria pendência.
    if eh_aluno(usuario_logado):
        saidas = [s for s in saidas if s['id_usuario'] == id_usuario_logado]

    # Retorna a lista de saídas pendentes.
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

    # VALIDAÇÃO DE PERMISSÃO
    # Somente admin pode atualizar uma saída.
    usuario_logado = {
        "id_usuario": saida_schema.id_usuario_logado,
        "id_perfil": saida_schema.id_perfil_logado
    }
    validar_permissao_editar_excluir(usuario_logado)

    # Busca a saída anterior para manter a data original.
    saida_anterior = service.buscar_por_id(id_saida)

    if not saida_anterior:
        raise HTTPException(status_code=404, detail="Saída não encontrada.")

    # Cria um objeto do nosso Model Saida com o ID informado.
    # A data_saida MANTÉM o valor original (não pode ser alterada).
    saida = Saida(

        # Define o ID da saída que será atualizada.
        id_saida=id_saida,

        # Recebe o ID do usuário do Schema.
        id_usuario=saida_schema.id_usuario,

        # MANTÉM a data/hora original da saída.
        # A data de saída nunca é alterada, apenas registrada uma vez.
        data_saida=saida_anterior['data_saida'],

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
def excluir(id_saida: int, id_usuario_logado: int = 0, id_perfil_logado: int = 0):

    # VALIDAÇÃO DE PERMISSÃO
    # Somente admin pode excluir uma saída.
    usuario_logado = {
        "id_usuario": id_usuario_logado,
        "id_perfil": id_perfil_logado
    }
    validar_permissao_editar_excluir(usuario_logado)

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
