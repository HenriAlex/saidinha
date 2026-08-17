# Importa a classe Conexao.
# Essa classe é responsável por abrir a conexão
# com o banco de dados SQLite.
from database.conexao import Conexao


# Importa a classe Perfil.
# Essa classe representa o modelo da tabela perfil.
from models.perfil import Perfil


# Cria a classe responsável pelo acesso aos dados
# da tabela perfil.
class PerfilRepository:

    # ============================================================
    # INSERIR
    # ============================================================

    # Método responsável por inserir um novo perfil
    # no banco de dados.
    #
    # Recebe um objeto da classe Perfil.
    def inserir(self, perfil: Perfil):

        # Abre uma conexão com o banco de dados.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Executa o comando SQL para inserir o perfil.
        #
        # O símbolo ? representa um parâmetro.
        cursor.execute("""
            INSERT INTO perfil
            (
                ds_perfil
            )
            VALUES (?)
        """, (

            # Envia a descrição do perfil para o banco.
            perfil.ds_perfil,
        ))

        # Confirma a alteração realizada no banco.
        conexao.commit()

        # Fecha a conexão com o banco.
        conexao.close()


    # ============================================================
    # LISTAR
    # ============================================================

    # Método responsável por buscar todos os perfis
    # cadastrados no banco.
    def listar(self):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar o comando SQL.
        cursor = conexao.cursor()

        # Executa uma consulta buscando todos os perfis.
        cursor.execute("""
            SELECT
                id_perfil,
                ds_perfil
            FROM perfil
            ORDER BY ds_perfil
        """)

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão com o banco.
        conexao.close()

        # Retorna os registros encontrados.
        return registros


    # ============================================================
    # BUSCAR POR ID
    # ============================================================

    # Método responsável por buscar um perfil
    # utilizando o seu identificador.
    def buscar_por_id(self, id_perfil):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar o comando SQL.
        cursor = conexao.cursor()

        # Executa a consulta buscando o perfil pelo ID.
        cursor.execute("""
            SELECT
                id_perfil,
                ds_perfil
            FROM perfil
            WHERE id_perfil = ?
        """, (

            # Envia o ID como parâmetro da consulta.
            id_perfil,
        ))

        # Recupera o primeiro registro encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Retorna o registro encontrado.
        # Caso não exista, será retornado None.
        return registro


    # ============================================================
    # ATUALIZAR
    # ============================================================

    # Método responsável por alterar um perfil
    # já existente no banco.
    def atualizar(self, perfil: Perfil):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar o SQL.
        cursor = conexao.cursor()

        # Executa o comando UPDATE.
        cursor.execute("""
            UPDATE perfil
            SET
                ds_perfil = ?
            WHERE id_perfil = ?
        """, (

            # Novo valor da descrição do perfil.
            perfil.ds_perfil,

            # Identifica qual perfil será alterado.
            perfil.id_perfil,
        ))

        # Confirma a alteração no banco.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # EXCLUIR
    # ============================================================

    # Método responsável por excluir um perfil
    # do banco de dados.
    def excluir(self, id_perfil):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar o comando SQL.
        cursor = conexao.cursor()

        # Executa o comando DELETE.
        cursor.execute("""
            DELETE FROM perfil
            WHERE id_perfil = ?
        """, (

            # Informa qual perfil será excluído.
            id_perfil,
        ))

        # Confirma a exclusão no banco.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()