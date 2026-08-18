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