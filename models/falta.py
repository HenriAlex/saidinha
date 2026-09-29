# Importa a classe datetime.
# Ela será utilizada para trabalhar com datas e horas.
from datetime import datetime


# Classe que representa a tabela falta.
# Esta classe mapeia os dados de FALTAS dos alunos
# (quando estão ausentes sem justificativa ou com justificativa).
class Falta:

    # Método construtor da classe.
    # O construtor inicializa todos os atributos da falta.
    def __init__(self,
                 id_falta=0,
                 id_usuario=0,
                 data_falta=None,
                 motivo="",
                 observacoes="",
                 data_cadastro=None):

        # Código identificador único da falta.
        self.id_falta = id_falta

        # Código identificador do usuário (aluno).
        # Estabelece uma relação com a tabela usuario.
        # Identifica qual aluno está faltando.
        self.id_usuario = id_usuario

        # Data da falta do aluno.
        # Representa a data em que o aluno faltou.
        # Formato: "YYYY-MM-DD"
        self.data_falta = data_falta

        # Motivo da falta do aluno (opcional).
        # Exemplo: "Doença", "Compromisso pessoal", "Não informado"
        # Este campo é opcional e pode ser deixado em branco
        # para faltas não justificadas.
        self.motivo = motivo

        # Observações adicionais sobre a falta.
        # Campo opcional para anotações, justificativas ou
        # informações relevantes sobre a falta.
        self.observacoes = observacoes

        # Caso nenhuma data seja informada,
        # utiliza a data e hora atuais.
        # Esta data representa quando o registro foi criado.
        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro
