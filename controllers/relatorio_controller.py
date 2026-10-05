# Importa o APIRouter.
# Ele permite criar e organizar as rotas da API.
from fastapi import APIRouter, HTTPException

# Importa datetime/timedelta para cálculos de horas e períodos.
from datetime import datetime, timedelta

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
# HELPERS DE FILTRO POR PERÍODO (compartilhado pelos endpoints)
# ============================================================

# Calcula o intervalo [start_dt, end_dt] a partir das opções de filtro
# fixas (períodos em dias, mês atual) ou de um intervalo customizado.
# Retorna (None, None) quando nenhum filtro foi aplicado (traz tudo).
def _calcular_intervalo_periodo(periodo: int = 0, mes_atual: bool = False, start_date: str = None, end_date: str = None):
    agora = datetime.now()
    start_dt = None
    end_dt = None

    if mes_atual:
        start_dt = agora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_dt = agora
    elif periodo and periodo > 0:
        start_dt = agora - timedelta(days=periodo)
        end_dt = agora
    elif start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        except Exception:
            raise HTTPException(status_code=400, detail="start_date deve estar no formato YYYY-MM-DD")
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            except Exception:
                raise HTTPException(status_code=400, detail="end_date deve estar no formato YYYY-MM-DD")
        else:
            end_dt = agora

    return start_dt, end_dt


# Verifica se uma data (string "%Y-%m-%d %H:%M:%S") está dentro do
# intervalo [start_dt, end_dt]. Quando ambos são None, considera que
# está sempre dentro (sem filtro aplicado).
def _data_dentro_intervalo(data_str: str, start_dt, end_dt) -> bool:
    if not start_dt and not end_dt:
        return True
    try:
        data_dt = datetime.strptime(data_str, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return False
    if start_dt and data_dt < start_dt:
        return False
    if end_dt and data_dt > end_dt:
        return False
    return True


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
#
# Aceita filtro opcional por período (periodo em dias, mes_atual ou
# um intervalo customizado start_date/end_date). Sem filtro, considera
# todo o histórico.
@router.get("/geral")
def estatisticas_geral(periodo: int = 0, mes_atual: bool = False, start_date: str = None, end_date: str = None):

    # Calcula o intervalo de datas a aplicar (ou None, None se "todos").
    start_dt, end_dt = _calcular_intervalo_periodo(periodo, mes_atual, start_date, end_date)

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

            # Aplica o filtro de período (se houver) às saídas do usuário.
            saidas = [s for s in saidas if _data_dentro_intervalo(s['data_saida'], start_dt, end_dt)]

            # NOTA: diferente da versão anterior, NÃO pulamos usuários sem
            # saídas no período: eles são necessários para o ranking
            # inverso (alunos que menos saem, incluindo os com zero saídas).

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

    # Ordena por tempo total fora (em minutos, decrescente) — ranking por tempo
    # Quando há empate no tempo, usa total de saídas como desempate
    estatisticas.sort(key=lambda x: (
        x['total_horas'] * 60 + x['total_minutos'],
        x['total_saidas']
    ), reverse=True)

    # Calcula totalizadores considerando apenas quem teve ao menos
    # uma saída no período (para não distorcer as médias com zeros).
    quem_saiu = [e for e in estatisticas if e['total_saidas'] > 0]
    total_geral_saidas = sum(e['total_saidas'] for e in quem_saiu)
    total_geral_minutos = sum(
        (e['total_horas'] * 60 + e['total_minutos'])
        for e in quem_saiu
    )
    horas_gerais = total_geral_minutos // 60
    minutos_gerais = total_geral_minutos % 60

    # RANKING INVERSO: alunos que MENOS saíram no período (os mais
    # "presentes"). Ordenado de forma ascendente por total_saidas,
    # com empate desempatado por nome. Inclui apenas alunos (perfil
    # "Aluno") para fazer sentido no contexto de presença em sala.
    candidatos_inverso = [e for e in estatisticas if (e.get('perfil') or '').lower() == 'aluno']
    if not candidatos_inverso:
        # Fallback: se não há classificação de perfil disponível,
        # considera todos os usuários.
        candidatos_inverso = estatisticas
    ranking_inverso = sorted(candidatos_inverso, key=lambda x: (x['total_saidas'], x['nome']))

    return {
        "usuarios": estatisticas,
        "ranking_inverso": ranking_inverso,
        "resumo_geral": {
            "total_usuarios_com_saidas": len(quem_saiu),
            "total_saidas_geral": total_geral_saidas,
            "total_horas_geral": horas_gerais,
            "total_minutos_geral": minutos_gerais,
            "tempo_formatado_geral": f"{horas_gerais}h {minutos_gerais}min"
        },
        "periodo_aplicado": {
            "periodo_dias": periodo or None,
            "mes_atual": mes_atual,
            "start_date": start_date,
            "end_date": end_date
        }
    }


# ============================================================
# HISTÓRICO COMPLETO DE UM USUÁRIO
# ============================================================

# Define a rota GET para obter histórico completo de um usuário.
@router.get("/historico/{id_usuario}")
def historico_usuario(id_usuario: int, periodo: int = 0, start_date: str = None, end_date: str = None, mes_atual: bool = False):

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

    # Aplica o mesmo filtro de período utilizado no relatório geral.
    start_dt, end_dt = _calcular_intervalo_periodo(periodo, mes_atual, start_date, end_date)
    eventos = [e for e in eventos if _data_dentro_intervalo(e['data_saida'], start_dt, end_dt)]

    # Ordena por data (mais recente primeiro).
    eventos.sort(key=lambda x: x['data_saida'], reverse=True)

    return {
        "id_usuario": id_usuario,
        "nome_usuario": usuario['nome'],
        "ra_usuario": usuario['ra'],
        "historico": eventos,
        "total_registros": len(eventos)
    }
