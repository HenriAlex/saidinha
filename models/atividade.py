from datetime import datetime


class Atividade:

    def __init__(self,
                 id_atividade=0,
                 id_usuario=0,
                 id_disciplina=0,
                 data_atividade=None,
                 bimestre=0,
                 pontos=0.0,
                 descricao="",
                 data_cadastro=None):

        self.id_atividade = id_atividade
        self.id_usuario = id_usuario
        self.id_disciplina = id_disciplina
        self.data_atividade = data_atividade
        self.bimestre = bimestre
        self.pontos = pontos
        self.descricao = descricao

        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro
