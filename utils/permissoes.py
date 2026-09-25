# utils/permissoes.py - Sistema de Permissões e Controle de Acesso
#
# Este módulo contém a MATRIZ DE PERMISSÕES do sistema:
# o que cada perfil de usuário pode Criar (C), Ler (R),
# Atualizar (U) e Eliminar (D) em cada módulo.
#
# ------------------------------------------------------------------
# MATRIZ DE PERMISSÕES (Perfil x Módulo)
# ------------------------------------------------------------------
#
# Perfil   Módulo     Extensão dos registros      C     R     U     D
# ------------------------------------------------------------------
# admin    Todos      Todos                       Sim   Sim   Sim   Sim
#
# 1 Aluno  Perfil     Todos                       Não   Sim   Não   Não
# 1 Aluno  Usuário    Todos                       Não   Sim   Não   Não
# 1 Aluno  Saída      Somente do usuário logado   Sim   Sim   Não   Não
# 1 Aluno  Retorno    Somente do usuário logado   Sim   Sim   Não   Não
# 1 Aluno  Consulta   Todos                       Não   Sim   Não   Não
#
# 2 Prof.  Perfil     Todos                       Não   Sim   Não   Não
# 2 Prof.  Usuário    Todos                       Não   Sim   Não   Não
# 2 Prof.  Saída      Todos                       Sim   Sim   Não   Não
# 2 Prof.  Retorno    Todos                       Sim   Sim   Não   Não
# 2 Prof.  Consulta   Todos                       Não   Sim   Não   Não
#
# 3 Equipe (mesmas permissões do Professor, perfil 2)
#
# ------------------------------------------------------------------
# Resumindo em palavras simples:
#
# - Perfil e Usuário: qualquer pessoa logada pode VER.
#   Só o admin pode Criar, Atualizar ou Eliminar.
#
# - Saída e Retorno: qualquer pessoa logada pode Criar e Ver.
#   O Aluno só pode Criar/Ver os SEUS PRÓPRIOS registros.
#   Professor, Equipe de Apoio e Admin podem Criar/Ver de qualquer aluno.
#   Só o admin pode Atualizar ou Eliminar.
#
# - Consulta (relatórios/dashboard): qualquer pessoa logada pode VER
#   os relatórios de todos os alunos. Não existe Criar/Atualizar/Eliminar
#   nesse módulo (são apenas dados calculados a partir de Saída/Retorno).
# ------------------------------------------------------------------


# ID do perfil Aluno (cadastrado na tabela "perfil").
PERFIL_ALUNO = 1

# ID do perfil Professor.
PERFIL_PROFESSOR = 2

# ID do perfil Equipe de Apoio.
PERFIL_EQUIPE_APOIO = 3


# ============================================================
# IDENTIFICAÇÃO DO USUÁRIO LOGADO
# ============================================================

def eh_admin(usuario_logado):
    """
    Verifica se o usuário logado é o Administrador.

    Neste projeto o admin é um usuário especial (não fica
    cadastrado na tabela "usuario"). Ele é identificado
    simplesmente pelo id_usuario = 0, que é o valor enviado
    pelo frontend quando o login é feito com "admin".

    Args:
        usuario_logado (dict): {"id_usuario": int, "id_perfil": int}

    Returns:
        bool: True se for admin.
    """
    return usuario_logado.get('id_usuario') == 0


def eh_aluno(usuario_logado):
    """
    Verifica se o usuário logado tem o perfil Aluno (id_perfil = 1).

    Importante: primeiro descarta o admin. Isso evita que um erro de
    configuração (ex: admin cadastrado por engano com id_perfil = 1)
    faça o sistema tratar o administrador como se fosse um aluno.
    """
    if eh_admin(usuario_logado):
        return False

    return usuario_logado.get('id_perfil') == PERFIL_ALUNO


# ============================================================
# MÓDULO PERFIL E MÓDULO USUÁRIO
# Regra: todo mundo pode LER. Só o admin pode Criar/Atualizar/Eliminar.
# ============================================================

def pode_gerenciar_perfis(usuario_logado):
    """Só o admin pode cadastrar, atualizar ou excluir perfis."""
    return eh_admin(usuario_logado)


def pode_gerenciar_usuarios(usuario_logado):
    """Só o admin pode cadastrar, atualizar ou excluir usuários."""
    return eh_admin(usuario_logado)


# ============================================================
# MÓDULO SAÍDA E MÓDULO RETORNO
# Regra: admin, professor e equipe de apoio podem Criar/Ver
# saída ou retorno de QUALQUER aluno. O aluno só pode
# Criar/Ver a SUA PRÓPRIA saída ou retorno.
# ============================================================

def pode_registrar_saida(usuario_logado, id_usuario_alvo):
    """
    Verifica se o usuário logado pode registrar uma saída
    para o usuário informado em "id_usuario_alvo".
    """

    # Admin, Professor e Equipe de Apoio podem registrar
    # saída de qualquer aluno.
    if not eh_aluno(usuario_logado):
        return True

    # Aluno só pode registrar a própria saída.
    return usuario_logado.get('id_usuario') == id_usuario_alvo


def pode_registrar_retorno(usuario_logado, id_usuario_alvo):
    """
    Verifica se o usuário logado pode registrar um retorno
    para o usuário informado em "id_usuario_alvo".

    A regra é idêntica à de registrar saída.
    """
    return pode_registrar_saida(usuario_logado, id_usuario_alvo)


def pode_editar_ou_excluir(usuario_logado):
    """
    Verifica se o usuário logado pode Atualizar ou Eliminar
    registros de Saída ou Retorno.

    Pela matriz de permissões, SÓ o admin pode fazer isso
    (nenhum perfil comum tem "U" ou "D" em Saída/Retorno).
    """
    return eh_admin(usuario_logado)
