# Importa a classe datetime.
# Ela será utilizada para trabalhar com datas e horas.
from datetime import datetime


# Classe que representa a tabela saida.
# Esta classe mapeia os dados de SAÍDA dos alunos
# (quando saem da instituição).
class Saida:

    # Método construtor da classe.
    # O construtor inicializa todos os atributos da saída.
    def __init__(self,
                 id_saida=0,
                 id_usuario=0,
                 data_saida=None,
                 motivo="",
                 data_cadastro=None):

        # Código identificador único da saída.
        self.id_saida = id_saida

        # Código identificador do usuário (aluno).
        # Estabelece uma relação com a tabela usuario.
        self.id_usuario = id_usuario

        # Data e hora de saída do aluno.
        # Representa quando o aluno saiu da instituição.
        self.data_saida = data_saida

        # Motivo da saída do aluno.
        # Exemplo: "Aula terminada", "Compromisso pessoal", "Consulta médica"
        self.motivo = motivo

        # Caso nenhuma data seja informada,
        # utiliza a data e hora atuais.
        # Esta data representa quando o registro foi criado.
        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro
