# Importa a classe datetime.
# Ela será utilizada para trabalhar com datas e horas.
from datetime import datetime


# Classe que representa a tabela retorno.
# Esta classe mapeia os dados de RETORNO dos alunos
# (quando retornam à instituição após uma saída).
class Retorno:

    # Método construtor da classe.
    # O construtor inicializa todos os atributos do retorno.
    def __init__(self,
                 id_retorno=0,
                 id_saida=0,
                 id_usuario=0,
                 data_retorno=None,
                 observacoes="",
                 data_cadastro=None):

        # Código identificador único do retorno.
        self.id_retorno = id_retorno

        # Código identificador da saída relacionada.
        # Estabelece uma relação com a tabela saida.
        # Um retorno sempre está associado a uma saída anterior.
        self.id_saida = id_saida

        # Código identificador do usuário (aluno).
        # Estabelece uma relação com a tabela usuario.
        self.id_usuario = id_usuario

        # Data e hora de retorno do aluno.
        # Representa quando o aluno voltou à instituição
        # após registrar uma saída.
        self.data_retorno = data_retorno

        # Observações adicionais sobre o retorno.
        # Campo opcional para notas, observações ou observações
        # relevantes sobre o retorno.
        self.observacoes = observacoes

        # Caso nenhuma data seja informada,
        # utiliza a data e hora atuais.
        # Esta data representa quando o registro foi criado.
        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro
