# Importa o BaseModel do Pydantic.
# O FastAPI utiliza o Pydantic para validar
# os dados recebidos nas requisições HTTP.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um registro de saída.
#
# O Pydantic irá validar automaticamente
# os tipos de dados e garantir que os campos
# obrigatórios sejam preenchidos.
class SaidaSchema(BaseModel):

    # Identificador do usuário (aluno) que está saindo.
    # Este campo é obrigatório.
    id_usuario: int

    # Data e hora de entrada do aluno.
    # Formato esperado: "2024-12-25 10:30:00"
    # Este campo é obrigatório.
    data_entrada: str

    # Data e hora de saída do aluno.
    # Formato esperado: "2024-12-25 14:30:00"
    # Este campo é obrigatório.
    data_saida: str

    # Motivo da saída do aluno.
    # Exemplos: "Intervalo para almoço", "Consulta médica", "Aula terminada"
    # Este campo é obrigatório e deve ter no mínimo 3 caracteres.
    motivo: str
