# Importa a classe Conexao.
# Essa classe é responsável por abrir a conexão
# com o banco de dados SQLite.
from database.conexao import Conexao

# Importa a classe Usuario.
# Essa classe representa o modelo da tabela usuario.
from models.usuario import Usuario


# Cria a classe responsável pelo acesso aos dados
# da tabela usuario.
class UsuarioRepository:

    # ============================================================
    # INSERIR
    # ============================================================

    # Método responsável por inserir um novo usuário
    # no banco de dados.
    #
    # Recebe um objeto da classe Usuario.
    def inserir(self, usuario: Usuario):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Executa o comando SQL de inserção.
        cursor.execute("""
            INSERT INTO usuario
            (
                ra,
                nome,
                id_perfil,
                email,
                senha,
                data_cadastro
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (

            # Envia o RA do usuário.
            usuario.ra,

            # Envia o nome do usuário.
            usuario.nome,

            # Envia o ID do perfil.
            usuario.id_perfil,

            # Envia o e-mail.
            usuario.email,

            # Envia a senha.
            usuario.senha,

            # Envia a data de cadastro.
            usuario.data_cadastro,
        ))

        # Confirma a inserção no banco.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # LISTAR
    # ============================================================

    # Método responsável por buscar todos os usuários
    # cadastrados no banco.
    def listar(self):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa a consulta dos usuários.
        #
        # O INNER JOIN permite trazer também
        # a descrição do perfil do usuário.
        cursor.execute("""
            SELECT
                u.id_usuario,
                u.ra,
                u.nome,
                u.id_perfil,
                p.ds_perfil,
                u.email,
                u.senha,
                u.data_cadastro
            FROM usuario u
            INNER JOIN perfil p
                ON p.id_perfil = u.id_perfil
            ORDER BY u.nome
        """)

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Retorna os registros.
        return registros


    # ============================================================
    # BUSCAR POR ID
    # ============================================================

    # Método responsável por buscar um usuário
    # utilizando o seu identificador.
    def buscar_por_id(self, id_usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca o usuário pelo ID.
        cursor.execute("""
            SELECT
                u.id_usuario,
                u.ra,
                u.nome,
                u.id_perfil,
                p.ds_perfil,
                u.email,
                u.senha,
                u.data_cadastro
            FROM usuario u
            INNER JOIN perfil p
                ON p.id_perfil = u.id_perfil
            WHERE u.id_usuario = ?
        """, (

            # Envia o ID como parâmetro.
            id_usuario,
        ))

        # Recupera o primeiro registro encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Retorna o registro.
        #
        # Caso o usuário não exista,
        # será retornado None.
        return registro


    # ============================================================
    # BUSCAR POR E-MAIL
    # ============================================================

    # Método responsável por buscar um usuário
    # utilizando o endereço de e-mail.
    #
    # Essa função será utilizada posteriormente
    # no processo de login.
    def buscar_por_email(self, email):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa a consulta utilizando o e-mail.
        cursor.execute("""
            SELECT
                u.id_usuario,
                u.ra,
                u.nome,
                u.id_perfil,
                p.ds_perfil,
                u.email,
                u.senha,
                u.data_cadastro
            FROM usuario u
            INNER JOIN perfil p
                ON p.id_perfil = u.id_perfil
            WHERE u.email = ?
        """, (

            # Envia o e-mail como parâmetro.
            email,
        ))

        # Recupera o usuário encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Retorna o usuário encontrado.
        #
        # Caso não exista, será retornado None.
        return registro


    # ============================================================
    # ATUALIZAR
    # ============================================================

    # Método responsável por atualizar
    # os dados de um usuário.
    def atualizar(self, usuario: Usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando UPDATE.
        cursor.execute("""
            UPDATE usuario
            SET
                ra = ?,
                nome = ?,
                id_perfil = ?,
                email = ?,
                senha = ?,
                data_cadastro = ?
            WHERE id_usuario = ?
        """, (

            # Novo RA.
            usuario.ra,

            # Novo nome.
            usuario.nome,

            # Novo perfil.
            usuario.id_perfil,

            # Novo e-mail.
            usuario.email,

            # Nova senha.
            usuario.senha,

            # Nova data de cadastro.
            usuario.data_cadastro,

            # Identifica o usuário que será alterado.
            usuario.id_usuario,
        ))

        # Confirma a alteração.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # EXCLUIR
    # ============================================================

    # Método responsável por excluir um usuário
    # do banco de dados.
    def excluir(self, id_usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando DELETE.
        cursor.execute("""
            DELETE FROM usuario
            WHERE id_usuario = ?
        """, (

            # Informa qual usuário será excluído.
            id_usuario,
        ))

        # Confirma a exclusão.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()