# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException

# Importa a classe datetime para cálculos de horas.
from datetime import datetime

# Importa o Repository de saídas e retornos.
from repositories.saida_repository import SaidaRepository
from repositories.retorno_repository import RetornoRepository
from repositories.usuario_repository import UsuarioRepository

# NOTA SOBRE PERMISSÕES:
# Pela matriz de permissões do projeto, o módulo "Consulta"
# pode ser LIDO por qualquer perfil (Admin, Aluno, Professor
# e Equipe de Apoio), sempre considerando TODOS os alunos.
# Por isso, os endpoints deste arquivo não fazem nenhuma
# validação de permissão: qualquer usuário autenticado no
# frontend pode acessá-los.


# Cria o agrupador de rotas de relatórios.
router = APIRouter(
    prefix="/relatorios",
    tags=["Relatórios"]
)


# Cria instâncias dos repositories.
saida_repo = SaidaRepository()
retorno_repo = RetornoRepository()
usuario_repo = UsuarioRepository()


# ============================================================
# ESTATÍSTICAS POR USUÁRIO
# ============================================================

# Define a rota GET para obter estatísticas de um usuário.
# Retorna: total de saídas e total de horas fora.
@router.get("/usuario/{id_usuario}")
def estatisticas_usuario(id_usuario: int):

    # Verifica se o usuário existe.
    usuario = usuario_repo.buscar_por_id(id_usuario)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Busca todas as saídas do usuário.
    saidas = saida_repo.buscar_por_usuario(id_usuario)

    # Busca todos os retornos do usuário.
    retornos = retorno_repo.buscar_por_usuario(id_usuario)

    # Calcula total de saídas.
    total_saidas = len(saidas)

    # Calcula total de horas fora.
    # Percorre cada saída e busca o retorno correspondente.
    total_minutos = 0

    for saida in saidas:
        # Encontra o retorno associado a esta saída.
        retorno_saida = next(
            (r for r in retornos if r['id_saida'] == saida['id_saida']),
            None
        )

        # Se houver retorno, calcula as horas.
        if retorno_saida:
            # Converte strings para datetime.
            data_saida = datetime.strptime(
                saida['data_saida'],
                "%Y-%m-%d %H:%M:%S"
            )
            data_retorno = datetime.strptime(
                retorno_saida['data_retorno'],
                "%Y-%m-%d %H:%M:%S"
            )

            # Calcula a diferença em minutos.
            diferenca = data_retorno - data_saida
            minutos = int(diferenca.total_seconds() / 60)
            total_minutos += minutos

    # Converte minutos para horas e minutos.
    horas = total_minutos // 60
    minutos = total_minutos % 60

    # Retorna as estatísticas.
    return {
        "id_usuario": id_usuario,
        "nome_usuario": usuario['nome'],
        "ra_usuario": usuario['ra'],
        "total_saidas": total_saidas,
        "total_horas": horas,
        "total_minutos": minutos,
        "tempo_formatado": f"{horas}h {minutos}min"
    }


# ============================================================
# ESTATÍSTICAS GERAIS
# ============================================================

# Define a rota GET para obter estatísticas de todos os usuários.
# Qualquer perfil logado (Aluno, Professor, Equipe de Apoio ou Admin)
# pode visualizar o relatório geral com os dados de todos os alunos.
@router.get("/geral")
def estatisticas_geral():

    # Busca todos os usuários.
    usuarios = usuario_repo.listar()

    # Lista para armazenar estatísticas.
    estatisticas = []

    # Calcula estatísticas para cada usuário.
    for usuario in usuarios:
        try:
            # Busca saídas e retornos.
            saidas = saida_repo.buscar_por_usuario(usuario['id_usuario'])
            retornos = retorno_repo.buscar_por_usuario(usuario['id_usuario'])

            # Se não houver saídas, pula.
            if not saidas:
                continue

            # Calcula total de minutos fora.
            total_minutos = 0

            for saida in saidas:
                retorno_saida = next(
                    (r for r in retornos if r['id_saida'] == saida['id_saida']),
                    None
                )

                if retorno_saida:
                    data_saida = datetime.strptime(
                        saida['data_saida'],
                        "%Y-%m-%d %H:%M:%S"
                    )
                    data_retorno = datetime.strptime(
                        retorno_saida['data_retorno'],
                        "%Y-%m-%d %H:%M:%S"
                    )

                    diferenca = data_retorno - data_saida
                    minutos = int(diferenca.total_seconds() / 60)
                    total_minutos += minutos

            # Converte para horas e minutos.
            horas = total_minutos // 60
            minutos = total_minutos % 60

            # Adiciona à lista.
            estatisticas.append({
                "id_usuario": usuario['id_usuario'],
                "nome": usuario['nome'],
                "ra": usuario['ra'],
                "perfil": usuario['ds_perfil'],
                "total_saidas": len(saidas),
                "total_horas": horas,
                "total_minutos": minutos,
                "tempo_formatado": f"{horas}h {minutos}min"
            })

        except Exception as e:
            # Se houver erro, continua com próximo usuário.
            continue

    # Ordena por total de saídas (decrescente).
    estatisticas.sort(key=lambda x: x['total_saidas'], reverse=True)

    # Calcula totalizadores.
    total_geral_saidas = sum(e['total_saidas'] for e in estatisticas)
    total_geral_minutos = sum(
        (e['total_horas'] * 60 + e['total_minutos'])
        for e in estatisticas
    )
    horas_gerais = total_geral_minutos // 60
    minutos_gerais = total_geral_minutos % 60

    return {
        "usuarios": estatisticas,
        "resumo_geral": {
            "total_usuarios_com_saidas": len(estatisticas),
            "total_saidas_geral": total_geral_saidas,
            "total_horas_geral": horas_gerais,
            "total_minutos_geral": minutos_gerais,
            "tempo_formatado_geral": f"{horas_gerais}h {minutos_gerais}min"
        }
    }


# ============================================================
# HISTÓRICO COMPLETO DE UM USUÁRIO
# ============================================================

# Define a rota GET para obter histórico completo de um usuário.
@router.get("/historico/{id_usuario}")
def historico_usuario(id_usuario: int):

    # Verifica se o usuário existe.
    usuario = usuario_repo.buscar_por_id(id_usuario)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Busca saídas e retornos.
    saidas = saida_repo.buscar_por_usuario(id_usuario)
    retornos = retorno_repo.buscar_por_usuario(id_usuario)

    # Monta lista de eventos (saída + retorno).
    eventos = []

    for saida in saidas:
        # Encontra retorno correspondente.
        retorno_saida = next(
            (r for r in retornos if r['id_saida'] == saida['id_saida']),
            None
        )

        # Calcula duração.
        duracao = "Pendente"
        duracao_minutos = 0

        if retorno_saida:
            data_saida = datetime.strptime(
                saida['data_saida'],
                "%Y-%m-%d %H:%M:%S"
            )
            data_retorno = datetime.strptime(
                retorno_saida['data_retorno'],
                "%Y-%m-%d %H:%M:%S"
            )

            diferenca = data_retorno - data_saida
            duracao_minutos = int(diferenca.total_seconds() / 60)
            horas = duracao_minutos // 60
            minutos = duracao_minutos % 60
            duracao = f"{horas}h {minutos}min"

        # Cria evento.
        evento = {
            "id_saida": saida['id_saida'],
            "data_saida": saida['data_saida'],
            "motivo": saida['motivo'],
            "data_retorno": retorno_saida['data_retorno'] if retorno_saida else None,
            "observacoes": retorno_saida['observacoes'] if retorno_saida else None,
            "duracao": duracao,
            "duracao_minutos": duracao_minutos,
            "status": "Retornou" if retorno_saida else "Fora (pendente)"
        }

        eventos.append(evento)

    # Ordena por data (mais recente primeiro).
    eventos.sort(key=lambda x: x['data_saida'], reverse=True)

    return {
        "id_usuario": id_usuario,
        "nome_usuario": usuario['nome'],
        "ra_usuario": usuario['ra'],
        "historico": eventos,
        "total_registros": len(eventos)
    }
