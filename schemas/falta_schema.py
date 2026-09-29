# Importa o BaseModel do Pydantic.
# O FastAPI utiliza o Pydantic para validar
# os dados recebidos nas requisições HTTP.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um registro de FALTA.
#
# O Pydantic irá validar automaticamente
# os tipos de dados e garantir que os campos
# obrigatórios sejam preenchidos.
#
# NOTA: data_cadastro é preenchida AUTOMATICAMENTE
# no servidor com a data/hora atual do registro.
# O cliente NÃO precisa enviar esse campo.
class FaltaSchema(BaseModel):

    # Identificador do usuário (aluno) que faltou.
    # Este campo é obrigatório.
    id_usuario: int

    # Data da falta do aluno.
    # Formato esperado: "YYYY-MM-DD"
    # Exemplo: "2024-09-28"
    # Este campo é obrigatório.
    data_falta: str

    # Motivo da falta (opcional).
    # Exemplos: "Doença", "Compromisso pessoal", "Não informado"
    # Pode ser deixado em branco para faltas não justificadas.
    motivo: str = ""

    # Observações adicionais sobre a falta (opcional).
    # Campo para anotações, justificativas ou informações
    # relevantes sobre a falta.
    # Pode ser deixado em branco.
    observacoes: str = ""

    # ID do usuário logado (para validação de permissão).
    # Usado apenas para verificar se tem direito de registrar.
    # Em produção, seria extraído do token JWT.
    id_usuario_logado: int = 0

    # Perfil do usuário logado (opcional, para validação).
    id_perfil_logado: int = 0
