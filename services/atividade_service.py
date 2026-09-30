from models.atividade import Atividade
from repositories.atividade_repository import AtividadeRepository


class AtividadeService:

    def __init__(self):
        self.repository = AtividadeRepository()


    def registrar(self, atividade: Atividade):

        if not atividade.id_usuario:
            raise ValueError("O ID do usuário é obrigatório.")

        if not atividade.id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        if not atividade.data_atividade:
            raise ValueError("A data da atividade é obrigatória.")

        if not (1 <= atividade.bimestre <= 4):
            raise ValueError("O bimestre deve ser entre 1 e 4.")

        if atividade.pontos < 0:
            raise ValueError("Os pontos não podem ser negativos.")

        return self.repository.inserir(atividade)


    def listar(self):
        return self.repository.listar()


    def buscar_por_id(self, id_atividade):

        if not id_atividade:
            raise ValueError("O ID da atividade é obrigatório.")

        atividade = self.repository.buscar_por_id(id_atividade)

        if not atividade:
            raise ValueError("Atividade não encontrada.")

        return atividade


    def buscar_por_usuario(self, id_usuario):

        if not id_usuario:
            raise ValueError("O ID do usuário é obrigatório.")

        return self.repository.buscar_por_usuario(id_usuario)


    def buscar_por_bimestre(self, bimestre):

        if not (1 <= bimestre <= 4):
            raise ValueError("O bimestre deve ser entre 1 e 4.")

        return self.repository.buscar_por_bimestre(bimestre)


    def buscar_por_usuario_disciplina_bimestre(self, id_usuario, id_disciplina, bimestre):

        if not id_usuario:
            raise ValueError("O ID do usuário é obrigatório.")

        if not id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        if not (1 <= bimestre <= 4):
            raise ValueError("O bimestre deve ser entre 1 e 4.")

        return self.repository.buscar_por_usuario_disciplina_bimestre(id_usuario, id_disciplina, bimestre)


    def atualizar(self, atividade: Atividade):

        if not atividade.id_atividade:
            raise ValueError("O ID da atividade é obrigatório.")

        if not atividade.id_usuario:
            raise ValueError("O ID do usuário é obrigatório.")

        if not atividade.id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        if not atividade.data_atividade:
            raise ValueError("A data da atividade é obrigatória.")

        if not (1 <= atividade.bimestre <= 4):
            raise ValueError("O bimestre deve ser entre 1 e 4.")

        if atividade.pontos < 0:
            raise ValueError("Os pontos não podem ser negativos.")

        atividade_existente = self.repository.buscar_por_id(atividade.id_atividade)

        if not atividade_existente:
            raise ValueError("Atividade não encontrada.")

        self.repository.atualizar(atividade)


    def excluir(self, id_atividade):

        if not id_atividade:
            raise ValueError("O ID da atividade é obrigatório.")

        atividade = self.repository.buscar_por_id(id_atividade)

        if not atividade:
            raise ValueError("Atividade não encontrada.")

        self.repository.excluir(id_atividade)
