# Importa a classe responsável pela conexão com o banco.
from database.conexao import Conexao


# Classe responsável pela criação do banco
# e das tabelas do sistema.
class CriarBanco:

    # Método estático.
    # Pode ser executado sem criar um objeto da classe.
    @staticmethod
    def criar():

        # Abre uma conexão com o banco SQLite.
        #
        # Caso o arquivo saidinha.db não exista,
        # o SQLite irá criá-lo automaticamente.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Cria a tabela PERFIL caso ela ainda não exista.
        cursor.execute("""

        CREATE TABLE IF NOT EXISTS perfil (

            id_perfil INTEGER PRIMARY KEY AUTOINCREMENT,

            ds_perfil TEXT NOT NULL

        )

        """)

        # Cria a tabela USUARIO caso ela ainda não exista.
        cursor.execute("""

        CREATE TABLE IF NOT EXISTS usuario (

            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,

            ra TEXT NOT NULL,

            nome TEXT NOT NULL,

            id_perfil INTEGER NOT NULL,

            email TEXT NOT NULL,

            senha TEXT NOT NULL,

            data_cadastro TEXT NOT NULL,

            FOREIGN KEY(id_perfil)
                REFERENCES perfil(id_perfil)

        )

        """)

        # Confirma as alterações realizadas no banco.
        conexao.commit()

        # Fecha a conexão com o banco.
        conexao.close()


# Executa o método responsável por criar
# o banco de dados e suas tabelas.
CriarBanco.criar()