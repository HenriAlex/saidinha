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

        # Cria a tabela SAIDA caso ela ainda não exista.
        # Esta tabela armazena os registros de SAÍDA dos alunos
        # com informações sobre quando e por qual motivo saíram.
        cursor.execute("""

        CREATE TABLE IF NOT EXISTS saida (

            id_saida INTEGER PRIMARY KEY AUTOINCREMENT,

            id_usuario INTEGER NOT NULL,

            data_saida TEXT NOT NULL,

            motivo TEXT NOT NULL,

            data_cadastro TEXT NOT NULL,

            FOREIGN KEY(id_usuario)
                REFERENCES usuario(id_usuario)

        )

        """)

        # Cria a tabela RETORNO caso ela ainda não exista.
        # Esta tabela armazena os registros de RETORNO dos alunos
        # relacionando quando retornaram a uma saída anterior.
        cursor.execute("""

        CREATE TABLE IF NOT EXISTS retorno (

            id_retorno INTEGER PRIMARY KEY AUTOINCREMENT,

            id_saida INTEGER NOT NULL,

            id_usuario INTEGER NOT NULL,

            data_retorno TEXT NOT NULL,

            observacoes TEXT,

            data_cadastro TEXT NOT NULL,

            FOREIGN KEY(id_saida)
                REFERENCES saida(id_saida),

            FOREIGN KEY(id_usuario)
                REFERENCES usuario(id_usuario)

        )

        """)

        # Confirma as alterações realizadas no banco.
        conexao.commit()

        # Fecha a conexão com o banco.
        conexao.close()


# Executa o método responsável por criar
# o banco de dados e suas tabelas.
CriarBanco.criar()