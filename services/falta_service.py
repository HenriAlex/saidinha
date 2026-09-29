# Importa a classe Falta.
# Essa classe representa o modelo dos dados da falta.
from models.falta import Falta


# Importa o Repository responsável pelo acesso
# aos dados da tabela falta no banco SQLite.
from repositories.falta_repository import FaltaRepository

# Importa o Repository responsável pelo acesso
# aos dados da tabela usuario.
# Será utilizado para validar se o usuário existe.
from repositories.usuario_repository import UsuarioRepository


# Cria a classe responsável pelas regras de negócio
# relacionadas às faltas dos alunos.
#
# Aqui serão validadas as informações antes de
# serem gravadas no banco de dados.
class FaltaService:

    # Método construtor da classe.
    def __init__(self):

        # Cria uma instância do FaltaRepository.
        #
        # O Service utilizará o Repository sempre que
        # precisar consultar ou alterar o banco de dados
        # da tabela falta.
        self.repository = FaltaRepository()

        # Cria uma instância do UsuarioRepository.
        #
        # Será utilizado para validar a existência
        # do usuário durante o cadastro de falta.
        self.usuario_repository = UsuarioRepository()


    # ============================================================
    # REGISTRAR FALTA
    # ============================================================

    # Método responsável por registrar uma nova FALTA
    # de um aluno.
    def registrar(self, falta: Falta):

        # Verifica se o ID do usuário foi informado.
        if not falta.id_usuario:

            # Interrompe a execução e informa o problema.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se a data da falta foi informada.
        if not falta.data_falta:

            # Interrompe a execução e informa o problema.
            raise ValueError("A data da falta é obrigatória.")


        # Consulta o banco para verificar se o usuário existe.
        usuario = self.usuario_repository.buscar_por_id(falta.id_usuario)


        # Verifica se foi encontrado o usuário.
        if not usuario:

            # Impede o registro de uma falta para um usuário inexistente.
            raise ValueError("O usuário informado não existe.")


        # Depois que todas as regras foram validadas,
        # envia a falta para o Repository realizar
        # a gravação no banco e retorna o id criado.
        return self.repository.inserir(falta)


    # ============================================================
    # LISTAR FALTAS
    # ============================================================

    # Método responsável por buscar todas as faltas
    # registradas no banco.
    def listar(self):

        # Solicita ao Repository todas as faltas
        # cadastradas no banco.
        return self.repository.listar()


    # ============================================================
    # BUSCAR FALTA POR ID
    # ============================================================

    # Método responsável por buscar uma falta
    # utilizando o seu identificador.
    def buscar_por_id(self, id_falta):

        # Verifica se o ID foi informado.
        if not id_falta:

            # Interrompe a execução caso o ID não tenha sido informado.
            raise ValueError("O ID da falta é obrigatório.")


        # Solicita ao Repository a falta pelo ID.
        falta = self.repository.buscar_por_id(id_falta)


        # Verifica se nenhuma falta foi encontrada.
        if not falta:

            # Informa que a falta não existe.
            raise ValueError("Falta não encontrada.")


        # Retorna a falta encontrada.
        return falta


    # ============================================================
    # BUSCAR FALTAS DE UM USUÁRIO
    # ============================================================

    # Método responsável por buscar o histórico de faltas
    # de um usuário específico.
    def buscar_por_usuario(self, id_usuario):

        # Verifica se o ID do usuário foi informado.
        if not id_usuario:

            # Interrompe a execução caso não tenha sido informado.
            raise ValueError("O ID do usuário é obrigatório.")


        # Solicita ao Repository as faltas do usuário.
        faltas = self.repository.buscar_por_usuario(id_usuario)

        # Retorna o resultado da busca.
        return faltas


    # ============================================================
    # BUSCAR FALTAS DE UMA DATA
    # ============================================================

    # Método responsável por buscar todas as faltas
    # de uma data específica.
    def buscar_por_data(self, data_falta):

        # Verifica se a data foi informada.
        if not data_falta:

            # Interrompe a execução caso a data não tenha sido informada.
            raise ValueError("A data da falta é obrigatória.")


        # Solicita ao Repository as faltas da data.
        faltas = self.repository.buscar_por_data(data_falta)

        # Retorna o resultado da busca.
        return faltas


    # ============================================================
    # ATUALIZAR FALTA
    # ============================================================

    # Método responsável por atualizar um registro
    # de falta existente.
    def atualizar(self, falta: Falta):

        # Verifica se o ID da falta foi informado.
        if not falta.id_falta:

            # Interrompe a operação caso não exista um ID.
            raise ValueError("O ID da falta é obrigatório.")


        # Verifica se a falta realmente existe.
        falta_existente = self.repository.buscar_por_id(
            falta.id_falta
        )


        # Se não encontrou a falta, não permite a atualização.
        if not falta_existente:

            # Informa que a falta não foi encontrada.
            raise ValueError("Falta não encontrada.")


        # Verifica se a data da falta foi informada.
        if not falta.data_falta:

            # Impede a atualização sem data de falta.
            raise ValueError("A data da falta é obrigatória.")


        # Depois de todas as validações,
        # solicita ao Repository a atualização.
        self.repository.atualizar(falta)


    # ============================================================
    # EXCLUIR FALTA
    # ============================================================

    # Método responsável por excluir um registro de falta.
    def excluir(self, id_falta):

        # Verifica se o ID foi informado.
        if not id_falta:

            # Impede a exclusão sem identificar a falta.
            raise ValueError("O ID da falta é obrigatório.")


        # Verifica se a falta existe.
        falta = self.repository.buscar_por_id(id_falta)


        # Caso não exista, não permite a exclusão.
        if not falta:

            # Informa que a falta não foi encontrada.
            raise ValueError("Falta não encontrada.")


        # Solicita ao Repository a exclusão da falta.
        self.repository.excluir(id_falta)
