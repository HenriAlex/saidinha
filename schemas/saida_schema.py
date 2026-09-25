# Importa o BaseModel do Pydantic.
# O FastAPI utiliza o Pydantic para validar
# os dados recebidos nas requisições HTTP.
from pydantic import BaseModel


# Cria o Schema utilizado para receber
# os dados de um registro de SAÍDA.
#
# O Pydantic irá validar automaticamente
# os tipos de dados e garantir que os campos
# obrigatórios sejam preenchidos.
#
# NOTA: data_saida é preenchida AUTOMATICAMENTE
# no servidor com a data/hora atual do registro.
# O cliente NÃO precisa enviar esse campo.
class SaidaSchema(BaseModel):

    # Identificador do usuário (aluno) que está saindo.
    # Este campo é obrigatório.
    id_usuario: int

    # Motivo da saída do aluno.
    # Exemplos: "Intervalo para almoço", "Consulta médica", "Aula terminada"
    # Este campo é obrigatório e deve ter no mínimo 3 caracteres.
    motivo: str

    # ID do usuário logado (para validação de permissão).
    # Usado apenas para verificar se tem direito de registrar.
    # Em produção, seria extraído do token JWT.
    id_usuario_logado: int = 0

    # Perfil do usuário logado (opcional, para validação).
    id_perfil_logado: int = 0
