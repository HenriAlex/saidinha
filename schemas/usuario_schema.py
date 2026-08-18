# Importa o BaseModel do Pydantic.
# O FastAPI utiliza o Pydantic para validar
# os dados recebidos nas requisições.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um usuário.
class UsuarioSchema(BaseModel):

    # RA do aluno ou identificação do usuário.
    ra: str

    # Nome completo do usuário.
    nome: str

    # Identificador do perfil do usuário.
    id_perfil: int

    # E-mail utilizado pelo usuário.
    email: str

    # Senha utilizada para autenticação.
    senha: str