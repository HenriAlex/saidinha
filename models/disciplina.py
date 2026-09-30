from datetime import datetime


class Disciplina:

    def __init__(self,
                 id_disciplina=0,
                 descricao="",
                 data_cadastro=None):

        self.id_disciplina = id_disciplina
        self.descricao = descricao

        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro
