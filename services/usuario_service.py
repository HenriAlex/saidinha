# Importa a classe Usuario.
# Essa classe representa o modelo dos dados do usuário.
from models.usuario import Usuario


# Importa o Repository responsável pelo acesso
# aos dados da tabela usuario no banco SQLite.
from repositories.usuario_repository import UsuarioRepository


# Cria a classe responsável pelas regras de negócio
# relacionadas aos usuários.
class UsuarioService:

    # Método construtor da classe.
    def __init__(self):

        # Cria uma instância do UsuarioRepository.
        #
        # O Service utilizará o Repository sempre que
        # precisar consultar ou alterar o banco de dados.
        self.repository = UsuarioRepository()


    # ============================================================
    # CADASTRAR USUÁRIO
    # ============================================================

    # Método responsável por cadastrar um novo usuário.
    def cadastrar(self, usuario: Usuario):

        # Verifica se o nome foi informado.
        if not usuario.nome:

            # Interrompe a execução e informa o problema.
            raise ValueError("O nome do usuário é obrigatório.")


        # Verifica se o RA foi informado.
        if not usuario.ra:

            # Interrompe a execução e informa o problema.
            raise ValueError("O RA do usuário é obrigatório.")


        # Verifica se o e-mail foi informado.
        if not usuario.email:

            # Interrompe a execução e informa o problema.
            raise ValueError("O e-mail do usuário é obrigatório.")


        # Verifica se a senha foi informada.
        if not usuario.senha:

            # Interrompe a execução e informa o problema.
            raise ValueError("A senha do usuário é obrigatória.")


        # Verifica se o perfil foi informado.
        if not usuario.id_perfil:

            # Interrompe a execução e informa o problema.
            raise ValueError("O perfil do usuário é obrigatório.")


        # Consulta o banco para verificar se já existe
        # um usuário utilizando o mesmo e-mail.
        usuario_existente = self.repository.buscar_por_email(
            usuario.email
        )


        # Verifica se foi encontrado algum usuário.
        if usuario_existente:

            # Impede o cadastro de um e-mail duplicado.
            raise ValueError(
                "Já existe um usuário cadastrado com este e-mail."
            )


        # Depois que todas as regras foram validadas,
        # envia o usuário para o Repository realizar
        # a gravação no banco.
        self.repository.inserir(usuario)


    # ============================================================
    # LISTAR USUÁRIOS
    # ============================================================

    # Método responsável por buscar todos os usuários.
    def listar(self):

        # Solicita ao Repository todos os usuários
        # cadastrados no banco.
        return self.repository.listar()


    # ============================================================
    # BUSCAR USUÁRIO POR ID
    # ============================================================

    # Método responsável por buscar um usuário
    # utilizando o seu identificador.
    def buscar_por_id(self, id_usuario):

        # Verifica se o ID foi informado.
        if not id_usuario:

            # Interrompe a execução caso o ID não tenha sido informado.
            raise ValueError("O ID do usuário é obrigatório.")


        # Solicita ao Repository o usuário pelo ID.
        usuario = self.repository.buscar_por_id(id_usuario)


        # Verifica se nenhum usuário foi encontrado.
        if not usuario:

            # Informa que o usuário não existe.
            raise ValueError("Usuário não encontrado.")


        # Retorna o usuário encontrado.
        return usuario


    # ============================================================
    # ATUALIZAR USUÁRIO
    # ============================================================

    # Método responsável por atualizar um usuário existente.
    def atualizar(self, usuario: Usuario):

        # Verifica se o ID do usuário foi informado.
        if not usuario.id_usuario:

            # Interrompe a operação caso não exista um ID.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se o usuário realmente existe.
        usuario_existente = self.repository.buscar_por_id(
            usuario.id_usuario
        )


        # Se não encontrou o usuário, não permite a atualização.
        if not usuario_existente:

            # Informa que o usuário não foi encontrado.
            raise ValueError("Usuário não encontrado.")


        # Verifica se o nome foi informado.
        if not usuario.nome:

            # Impede a atualização sem nome.
            raise ValueError("O nome do usuário é obrigatório.")


        # Verifica se o RA foi informado.
        if not usuario.ra:

            # Impede a atualização sem RA.
            raise ValueError("O RA do usuário é obrigatório.")


        # Verifica se o e-mail foi informado.
        if not usuario.email:

            # Impede a atualização sem e-mail.
            raise ValueError("O e-mail do usuário é obrigatório.")


        # Verifica se o perfil foi informado.
        if not usuario.id_perfil:

            # Impede a atualização sem perfil.
            raise ValueError("O perfil do usuário é obrigatório.")


        # Verifica se já existe outro usuário utilizando
        # o mesmo e-mail.
        usuario_email = self.repository.buscar_por_email(
            usuario.email
        )


        # Caso exista um usuário com o mesmo e-mail,
        # verifica se ele é diferente do usuário atual.
        if usuario_email:

            # Compara os IDs dos usuários.
            if usuario_email.id_usuario != usuario.id_usuario:

                # Impede a utilização de e-mail duplicado.
                raise ValueError(
                    "O e-mail informado já está sendo utilizado."
                )


        # Depois de todas as validações,
        # solicita ao Repository a atualização.
        self.repository.atualizar(usuario)


    # ============================================================
    # EXCLUIR USUÁRIO
    # ============================================================

    # Método responsável por excluir um usuário.
    def excluir(self, id_usuario):

        # Verifica se o ID foi informado.
        if not id_usuario:

            # Impede a exclusão sem identificar o usuário.
            raise ValueError("O ID do usuário é obrigatório.")


        # Verifica se o usuário existe.
        usuario = self.repository.buscar_por_id(id_usuario)


        # Caso não exista, não permite a exclusão.
        if not usuario:

            # Informa que o usuário não foi encontrado.
            raise ValueError("Usuário não encontrado.")


        # Solicita ao Repository a exclusão do usuário.
        self.repository.excluir(id_usuario)


    # ============================================================
    # LOGIN
    # ============================================================

    # Método responsável pelo processo de autenticação.
    #
    # Aqui está a regra de negócio do LOGIN.
    def login(self, email, senha):

        # Verifica se o e-mail foi informado.
        if not email:

            # Interrompe o processo de autenticação.
            raise ValueError("O e-mail é obrigatório.")


        # Verifica se a senha foi informada.
        if not senha:

            # Interrompe o processo de autenticação.
            raise ValueError("A senha é obrigatória.")


        # Busca no banco o usuário utilizando o e-mail.
        #
        # Observe que o Repository não está validando
        # o login. Ele apenas busca o usuário.
        usuario = self.repository.buscar_por_email(email)


        # Verifica se o usuário foi encontrado.
        if not usuario:

            # Não informa se o problema foi o e-mail ou senha.
            # Isso é uma boa prática de segurança.
            raise ValueError("E-mail ou senha inválidos.")


        # Compara a senha informada pelo usuário
        # com a senha armazenada.
        if usuario.senha != senha:

            # Caso as senhas sejam diferentes,
            # o login será recusado.
            raise ValueError("E-mail ou senha inválidos.")


        # Se chegou até aqui, significa que todas
        # as validações foram aprovadas.
        #
        # Retorna o usuário autenticado.
        return usuario