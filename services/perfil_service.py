# Importa a classe Perfil.
# Essa classe representa o modelo dos dados do perfil.
from models.perfil import Perfil

# Importa o Repository responsável pelo acesso
# aos dados da tabela perfil.
from repositories.perfil_repository import PerfilRepository

# Cria a classe responsável pelas regras de negócio
# relacionadas aos perfis.
class PerfilService:

    # Método construtor da classe.
    def __init__(self):

        # Cria uma instância do PerfilRepository.
        #
        # O Service utilizará essa classe para acessar
        # os dados armazenados no banco.
        self.repository = PerfilRepository()


    # ============================================================
    # CADASTRAR PERFIL
    # ============================================================

    # Método responsável por cadastrar um novo perfil.
    def cadastrar(self, perfil: Perfil):

        # Verifica se a descrição foi informada.
        if not perfil.ds_perfil:

            # Interrompe o cadastro caso a descrição esteja vazia.
            raise ValueError(
                "A descrição do perfil é obrigatória."
            )


        # Solicita ao Repository a lista de perfis existentes.
        perfis = self.repository.listar()


        # Percorre todos os perfis encontrados.
        for perfil_existente in perfis:

            # Compara as descrições ignorando maiúsculas
            # e minúsculas.
            if perfil_existente.ds_perfil.lower() == perfil.ds_perfil.lower():

                # Impede o cadastro de perfis duplicados.
                raise ValueError(
                    "Já existe um perfil com esta descrição."
                )


        # Depois das validações,
        # envia o perfil para o Repository.
        self.repository.inserir(perfil)


    # ============================================================
    # LISTAR PERFIS
    # ============================================================

    # Método responsável por listar todos os perfis.
    def listar(self):

        # Solicita ao Repository os perfis cadastrados.
        return self.repository.listar()


    # ============================================================
    # BUSCAR PERFIL POR ID
    # ============================================================

    # Método responsável por buscar um perfil
    # utilizando o seu identificador.
    def buscar_por_id(self, id_perfil):

        # Verifica se o ID foi informado.
        if not id_perfil:

            # Impede a busca sem um identificador.
            raise ValueError("O ID do perfil é obrigatório.")


        # Solicita ao Repository o perfil pelo ID.
        perfil = self.repository.buscar_por_id(id_perfil)


        # Verifica se o perfil não foi encontrado.
        if not perfil:

            # Informa que o perfil não existe.
            raise ValueError("Perfil não encontrado.")


        # Retorna o perfil encontrado.
        return perfil


    # ============================================================
    # ATUALIZAR PERFIL
    # ============================================================

    # Método responsável por atualizar um perfil existente.
    def atualizar(self, perfil: Perfil):

        # Verifica se o ID foi informado.
        if not perfil.id_perfil:

            # Impede a atualização sem identificar o perfil.
            raise ValueError("O ID do perfil é obrigatório.")


        # Verifica se a descrição foi informada.
        if not perfil.ds_perfil:

            # Impede a atualização sem descrição.
            raise ValueError(
                "A descrição do perfil é obrigatória."
            )


        # Verifica se o perfil existe.
        perfil_existente = self.repository.buscar_por_id(
            perfil.id_perfil
        )


        # Caso o perfil não exista,
        # não permite a atualização.
        if not perfil_existente:

            # Informa que o perfil não foi encontrado.
            raise ValueError("Perfil não encontrado.")


        # Busca todos os perfis para verificar
        # se existe outra descrição igual.
        perfis = self.repository.listar()


        # Percorre os perfis existentes.
        for perfil_item in perfis:

            # Verifica se encontrou outro perfil
            # com a mesma descrição.
            if (
                perfil_item.ds_perfil.lower()
                == perfil.ds_perfil.lower()
                and perfil_item.id_perfil != perfil.id_perfil
            ):

                # Impede a duplicidade.
                raise ValueError(
                    "Já existe outro perfil com esta descrição."
                )


        # Depois das validações,
        # solicita a atualização ao Repository.
        self.repository.atualizar(perfil)


    # ============================================================
    # EXCLUIR PERFIL
    # ============================================================

    # Método responsável por excluir um perfil.
    def excluir(self, id_perfil):

        # Verifica se o ID foi informado.
        if not id_perfil:

            # Impede a exclusão sem identificar o perfil.
            raise ValueError("O ID do perfil é obrigatório.")


        # Verifica se o perfil existe.
        perfil = self.repository.buscar_por_id(id_perfil)


        # Caso o perfil não exista,
        # não permite a exclusão.
        if not perfil:

            # Informa que o perfil não foi encontrado.
            raise ValueError("Perfil não encontrado.")


        # Solicita ao Repository a exclusão do perfil.
        self.repository.excluir(id_perfil)