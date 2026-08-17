from database.conexao import Conexao

class CriarBanco:

    @staticmethod
    def criar():

        # Abre conexão
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Criação da tabela perfil
        cursor.execute("""

        CREATE TABLE IF NOT EXISTS perfil (

            id_perfil INTEGER PRIMARY KEY AUTOINCREMENT,

            ds_perfil TEXT NOT NULL

        )

        """)

        # Criação da tabela usuario
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

        conexao.commit()

        conexao.close()