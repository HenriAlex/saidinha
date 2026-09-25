# Importa a classe Retorno.
# Essa classe representa o modelo dos dados do retorno.
from models.retorno import Retorno


# Importa o Repository responsável pelo acesso
# aos dados da tabela retorno no banco SQLite.
from repositories.retorno_repository import RetornoRepository

# Importa o Repository responsável pelo acesso
# aos dados da tabela saida.
# Será utilizado para validar se a saída existe.
from repositories.saida_repository import SaidaRepository

# Importa o Repository responsável pelo acesso
# aos dados da tabela usuario.
# Será utilizado para validar se o usuário existe.
from repositories.usuario_repository import UsuarioRepository


# Cria a classe responsável pelas regras de negócio
# relacionadas aos retornos dos alunos.
#
# Aqui serão validadas as informações antes de
# serem gravadas no banco de dados.
class RetornoService:

    # Método construtor da classe.
    def __init__(self):

        # Cria uma instância do RetornoRepository.
        #
        # O Service utilizará o Repository sempre que
        # precisar consultar ou alterar o banco de dados
        # da tabela retorno.
        self.repository = RetornoRepository()

        # Cria uma instância do SaidaRepository.
        #
        # Será utilizado para validar a existência
        # da saída durante o cadastro de retorno.
        self.saida_repository = SaidaRepository()

        # Cria uma instância do UsuarioRepository.
        #
        # Será utilizado para validar a existência
        # do usuário durante o cadastro de retorno.
        self.usuario_repository = UsuarioRepository()


    # ============================================================
    # REGISTRAR RETORNO
    # ============================================================

    # Método responsável por registrar um novo RETORNO
    # de um aluno (quando volta após uma saída).
    def registrar(self, retorno: Retorno):

        # Verifica se o ID da saída foi informado.
        if not retorno.id_saida:

            # Interrompe a execução e informa o problema.
            raise ValueError("O ID da saída é obrigatório.")


        # Verifica se o ID do usuário foi informado.
        if not retorno.id_usuario:

            # Interrompe a execução e informa o problema.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se a data de retorno foi informada.
        if not retorno.data_retorno:

            # Interrompe a execução e informa o problema.
            raise ValueError("A data de retorno é obrigatória.")


        # Consulta o banco para verificar se a saída existe.
        saida = self.saida_repository.buscar_por_id(retorno.id_saida)


        # Verifica se foi encontrada a saída.
        if not saida:

            # Impede o registro de um retorno para uma saída inexistente.
            raise ValueError("A saída informada não existe.")


        # Consulta o banco para verificar se o usuário existe.
        usuario = self.usuario_repository.buscar_por_id(retorno.id_usuario)


        # Verifica se foi encontrado o usuário.
        if not usuario:

            # Impede o registro de um retorno para um usuário inexistente.
            raise ValueError("O usuário informado não existe.")


        # Depois que todas as regras foram validadas,
        # envia o retorno para o Repository realizar
        # a gravação no banco e retorna o id criado.
        return self.repository.inserir(retorno)


    # ============================================================
    # LISTAR RETORNOS
    # ============================================================

    # Método responsável por buscar todos os retornos
    # registrados no banco.
    def listar(self):

        # Solicita ao Repository todos os retornos
        # cadastrados no banco.
        return self.repository.listar()


    # ============================================================
    # BUSCAR RETORNO POR ID
    # ============================================================

    # Método responsável por buscar um retorno
    # utilizando o seu identificador.
    def buscar_por_id(self, id_retorno):

        # Verifica se o ID foi informado.
        if not id_retorno:

            # Interrompe a execução caso o ID não tenha sido informado.
            raise ValueError("O ID do retorno é obrigatório.")


        # Solicita ao Repository o retorno pelo ID.
        retorno = self.repository.buscar_por_id(id_retorno)


        # Verifica se nenhum retorno foi encontrado.
        if not retorno:

            # Informa que o retorno não existe.
            raise ValueError("Retorno não encontrado.")


        # Retorna o retorno encontrado.
        return retorno


    # ============================================================
    # BUSCAR RETORNOS DE UMA SAÍDA
    # ============================================================

    # Método responsável por buscar todos os retornos
    # relacionados a uma saída específica.
    def buscar_por_saida(self, id_saida):

        # Verifica se o ID da saída foi informado.
        if not id_saida:

            # Interrompe a execução caso não tenha sido informado.
            raise ValueError("O ID da saída é obrigatório.")


        # Solicita ao Repository os retornos da saída.
        retornos = self.repository.buscar_por_saida(id_saida)

        # Retorna o resultado da busca.
        return retornos


    # ============================================================
    # BUSCAR RETORNOS DE UM USUÁRIO
    # ============================================================

    # Método responsável por buscar o histórico de retornos
    # de um usuário específico.
    def buscar_por_usuario(self, id_usuario):

        # Verifica se o ID do usuário foi informado.
        if not id_usuario:

            # Interrompe a execução caso não tenha sido informado.
            raise ValueError("O ID do usuário é obrigatório.")


        # Solicita ao Repository os retornos do usuário.
        retornos = self.repository.buscar_por_usuario(id_usuario)

        # Retorna o resultado da busca.
        return retornos


    # ============================================================
    # ATUALIZAR RETORNO
    # ============================================================

    # Método responsável por atualizar um registro
    # de retorno existente.
    def atualizar(self, retorno: Retorno):

        # Verifica se o ID do retorno foi informado.
        if not retorno.id_retorno:

            # Interrompe a operação caso não exista um ID.
            raise ValueError("O ID do retorno é obrigatório.")


        # Verifica se o retorno realmente existe.
        retorno_existente = self.repository.buscar_por_id(
            retorno.id_retorno
        )


        # Se não encontrou o retorno, não permite a atualização.
        if not retorno_existente:

            # Informa que o retorno não foi encontrado.
            raise ValueError("Retorno não encontrado.")


        # Verifica se a data de retorno foi informada.
        if not retorno.data_retorno:

            # Impede a atualização sem data de retorno.
            raise ValueError("A data de retorno é obrigatória.")


        # Depois de todas as validações,
        # solicita ao Repository a atualização.
        self.repository.atualizar(retorno)


    # ============================================================
    # EXCLUIR RETORNO
    # ============================================================

    # Método responsável por excluir um registro de retorno.
    def excluir(self, id_retorno):

        # Verifica se o ID foi informado.
        if not id_retorno:

            # Impede a exclusão sem identificar o retorno.
            raise ValueError("O ID do retorno é obrigatório.")


        # Verifica se o retorno existe.
        retorno = self.repository.buscar_por_id(id_retorno)


        # Caso não exista, não permite a exclusão.
        if not retorno:

            # Informa que o retorno não foi encontrado.
            raise ValueError("Retorno não encontrado.")


        # Solicita ao Repository a exclusão do retorno.
        self.repository.excluir(id_retorno)
