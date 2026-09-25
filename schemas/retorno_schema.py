# Importa o BaseModel do Pydantic.
# O FastAPI utiliza o Pydantic para validar
# os dados recebidos nas requisições HTTP.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um registro de RETORNO.
#
# O Pydantic irá validar automaticamente
# os tipos de dados e garantir que os campos
# obrigatórios sejam preenchidos.
class RetornoSchema(BaseModel):

    # Identificador da saída associada a este retorno.
    # Este campo é obrigatório pois todo retorno
    # deve estar relacionado a uma saída anterior.
    id_saida: int

    # Identificador do usuário (aluno) que está retornando.
    # Este campo é obrigatório.
    id_usuario: int

    # Data e hora de retorno do aluno.
    # Formato esperado: "2024-12-25 14:30:00"
    # Este campo é obrigatório.
    data_retorno: str

    # Observações adicionais sobre o retorno.
    # Campo opcional para anotações, observações ou
    # informações relevantes sobre o retorno.
    # Pode ser deixado em branco.
    observacoes: str = ""
