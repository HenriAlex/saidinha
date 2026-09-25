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
#
# NOTA: data_retorno é preenchida AUTOMATICAMENTE
# no servidor com a data/hora atual do registro.
# O cliente NÃO precisa enviar esse campo.
class RetornoSchema(BaseModel):

    # Identificador da saída associada a este retorno.
    # Este campo é obrigatório pois todo retorno
    # deve estar relacionado a uma saída anterior.
    id_saida: int

    # Identificador do usuário (aluno) que está retornando.
    # Este campo é obrigatório.
    id_usuario: int

    # Observações adicionais sobre o retorno.
    # Campo opcional para anotações, observações ou
    # informações relevantes sobre o retorno.
    # Pode ser deixado em branco.
    observacoes: str = ""

    # ID do usuário logado (para validação de permissão).
    # Usado apenas para verificar se tem direito de registrar.
    # Em produção, seria extraído do token JWT.
    id_usuario_logado: int = 0

    # Perfil do usuário logado (opcional, para validação).
    id_perfil_logado: int = 0
