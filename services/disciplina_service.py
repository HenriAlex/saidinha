from models.disciplina import Disciplina
from repositories.disciplina_repository import DisciplinaRepository


class DisciplinaService:

    def __init__(self):
        self.repository = DisciplinaRepository()


    def cadastrar(self, disciplina: Disciplina):

        if not disciplina.descricao:
            raise ValueError("A descrição da disciplina é obrigatória.")

        disciplinas = self.repository.listar()

        for disc_existente in disciplinas:
            desc = disc_existente.get('descricao') if isinstance(disc_existente, dict) else getattr(disc_existente, 'descricao', None)
            if desc and desc.lower() == disciplina.descricao.lower():
                raise ValueError("Já existe uma disciplina com esta descrição.")

        return self.repository.inserir(disciplina)


    def listar(self):
        return self.repository.listar()


    def buscar_por_id(self, id_disciplina):

        if not id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        disciplina = self.repository.buscar_por_id(id_disciplina)

        if not disciplina:
            raise ValueError("Disciplina não encontrada.")

        return disciplina


    def atualizar(self, disciplina: Disciplina):

        if not disciplina.id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        if not disciplina.descricao:
            raise ValueError("A descrição da disciplina é obrigatória.")

        disciplina_existente = self.repository.buscar_por_id(disciplina.id_disciplina)

        if not disciplina_existente:
            raise ValueError("Disciplina não encontrada.")

        disciplinas = self.repository.listar()

        for disc_item in disciplinas:
            desc = disc_item.get('descricao') if isinstance(disc_item, dict) else getattr(disc_item, 'descricao', None)
            disc_id = disc_item.get('id_disciplina') if isinstance(disc_item, dict) else getattr(disc_item, 'id_disciplina', None)
            if desc and desc.lower() == disciplina.descricao.lower() and disc_id != disciplina.id_disciplina:
                raise ValueError("Já existe outra disciplina com esta descrição.")

        self.repository.atualizar(disciplina)


    def excluir(self, id_disciplina):

        if not id_disciplina:
            raise ValueError("O ID da disciplina é obrigatório.")

        disciplina = self.repository.buscar_por_id(id_disciplina)

        if not disciplina:
            raise ValueError("Disciplina não encontrada.")

        self.repository.excluir(id_disciplina)
