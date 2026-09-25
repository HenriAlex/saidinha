# Importa a classe Saida.
# Essa classe representa o modelo dos dados da saída.
from models.saida import Saida


# Importa o Repository responsável pelo acesso
# aos dados da tabela saida no banco SQLite.
from repositories.saida_repository import SaidaRepository

# Importa o Repository responsável pelo acesso
# aos dados da tabela usuario.
# Será utilizado para validar se o usuário existe.
from repositories.usuario_repository import UsuarioRepository


# Cria a classe responsável pelas regras de negócio
# relacionadas às saídas dos alunos.
#
# Aqui serão validadas as informações antes de
# serem gravadas no banco de dados.
class SaidaService:

    # Método construtor da classe.
    def __init__(self):

        # Cria uma instância do SaidaRepository.
        #
        # O Service utilizará o Repository sempre que
        # precisar consultar ou alterar o banco de dados
        # da tabela saida.
        self.repository = SaidaRepository()

        # Cria uma instância do UsuarioRepository.
        #
        # Será utilizado para validar a existência
        # do usuário durante o cadastro de saída.
        self.usuario_repository = UsuarioRepository()


    # ============================================================
    # REGISTRAR SAÍDA
    # ============================================================

    # Método responsável por registrar uma nova saída
    # de um aluno.
    def registrar(self, saida: Saida):

        # Verifica se o ID do usuário foi informado.
        if not saida.id_usuario:

            # Interrompe a execução e informa o problema.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se a data de entrada foi informada.
        if not saida.data_entrada:

            # Interrompe a execução e informa o problema.
            raise ValueError("A data de entrada é obrigatória.")


        # Verifica se a data de saída foi informada.
        if not saida.data_saida:

            # Interrompe a execução e informa o problema.
            raise ValueError("A data de saída é obrigatória.")


        # Verifica se o motivo foi informado.
        if not saida.motivo:

            # Interrompe a execução e informa o problema.
            raise ValueError("O motivo da saída é obrigatório.")


        # Verifica se o motivo possui pelo menos 3 caracteres.
        if len(saida.motivo) < 3:

            # Impede o cadastro de um motivo muito curto.
            raise ValueError(
                "O motivo da saída deve ter pelo menos 3 caracteres."
            )


        # Consulta o banco para verificar se o usuário existe.
        usuario = self.usuario_repository.buscar_por_id(saida.id_usuario)


        # Verifica se foi encontrado o usuário.
        if not usuario:

            # Impede o registro de uma saída para um usuário inexistente.
            raise ValueError("O usuário informado não existe.")


        # Depois que todas as regras foram validadas,
        # envia a saída para o Repository realizar
        # a gravação no banco e retorna o id criado.
        return self.repository.inserir(saida)


    # ============================================================
    # LISTAR SAÍDAS
    # ============================================================

    # Método responsável por buscar todas as saídas
    # registradas no banco.
    def listar(self):

        # Solicita ao Repository todas as saídas
        # cadastradas no banco.
        return self.repository.listar()


    # ============================================================
    # BUSCAR SAÍDA POR ID
    # ============================================================

    # Método responsável por buscar uma saída
    # utilizando o seu identificador.
    def buscar_por_id(self, id_saida):

        # Verifica se o ID foi informado.
        if not id_saida:

            # Interrompe a execução caso o ID não tenha sido informado.
            raise ValueError("O ID da saída é obrigatório.")


        # Solicita ao Repository a saída pelo ID.
        saida = self.repository.buscar_por_id(id_saida)


        # Verifica se nenhuma saída foi encontrada.
        if not saida:

            # Informa que a saída não existe.
            raise ValueError("Saída não encontrada.")


        # Retorna a saída encontrada.
        return saida


    # ============================================================
    # BUSCAR SAÍDAS DE UM USUÁRIO
    # ============================================================

    # Método responsável por buscar o histórico de saídas
    # de um usuário específico.
    #
    # Este método é importante para que um aluno possa
    # visualizar todo o seu histórico de saídas.
    def buscar_por_usuario(self, id_usuario):

        # Verifica se o ID do usuário foi informado.
        if not id_usuario:

            # Interrompe a execução caso não tenha sido informado.
            raise ValueError("O ID do usuário é obrigatório.")


        # Solicita ao Repository as saídas do usuário.
        saidas = self.repository.buscar_por_usuario(id_usuario)

        # Retorna o resultado da busca.
        return saidas


    # ============================================================
    # ATUALIZAR SAÍDA
    # ============================================================

    # Método responsável por atualizar um registro
    # de saída existente.
    def atualizar(self, saida: Saida):

        # Verifica se o ID da saída foi informado.
        if not saida.id_saida:

            # Interrompe a operação caso não exista um ID.
            raise ValueError("O ID da saída é obrigatório.")


        # Verifica se a saída realmente existe.
        saida_existente = self.repository.buscar_por_id(
            saida.id_saida
        )


        # Se não encontrou a saída, não permite a atualização.
        if not saida_existente:

            # Informa que a saída não foi encontrada.
            raise ValueError("Saída não encontrada.")


        # Verifica se o ID do usuário foi informado.
        if not saida.id_usuario:

            # Impede a atualização sem ID de usuário.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se a data de entrada foi informada.
        if not saida.data_entrada:

            # Impede a atualização sem data de entrada.
            raise ValueError("A data de entrada é obrigatória.")


        # Verifica se a data de saída foi informada.
        if not saida.data_saida:

            # Impede a atualização sem data de saída.
            raise ValueError("A data de saída é obrigatória.")


        # Verifica se o motivo foi informado.
        if not saida.motivo:

            # Impede a atualização sem motivo.
            raise ValueError("O motivo da saída é obrigatório.")


        # Verifica se o usuário existe.
        usuario = self.usuario_repository.buscar_por_id(saida.id_usuario)


        # Caso o usuário não exista, não permite a atualização.
        if not usuario:

            # Informa que o usuário não foi encontrado.
            raise ValueError("O usuário informado não existe.")


        # Depois de todas as validações,
        # solicita ao Repository a atualização.
        self.repository.atualizar(saida)


    # ============================================================
    # EXCLUIR SAÍDA
    # ============================================================

    # Método responsável por excluir um registro de saída.
    def excluir(self, id_saida):

        # Verifica se o ID foi informado.
        if not id_saida:

            # Impede a exclusão sem identificar a saída.
            raise ValueError("O ID da saída é obrigatório.")


        # Verifica se a saída existe.
        saida = self.repository.buscar_por_id(id_saida)


        # Caso não exista, não permite a exclusão.
        if not saida:

            # Informa que a saída não foi encontrada.
            raise ValueError("Saída não encontrada.")


        # Solicita ao Repository a exclusão da saída.
        self.repository.excluir(id_saida)
