# Importa o BaseModel do Pydantic.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um perfil.
class PerfilSchema(BaseModel):

    # Descrição do perfil.
    #
    # Exemplos:
    # Aluno
    # Professor
    # Inspetor
    # Secretaria
    # Coordenação
    ds_perfil: str

    # ID do usuário logado (para validação de permissão).
    # Usado apenas para verificar se tem direito de gerenciar perfis.
    # Em produção, seria extraído do token JWT.
    id_usuario_logado: int = 0

    # Perfil do usuário logado (opcional, para validação).
    id_perfil_logado: int = 0