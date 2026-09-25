# Importa a classe Conexao.
# Essa classe é responsável por abrir a conexão
# com o banco de dados SQLite.
from database.conexao import Conexao

# Importa a classe Saida.
# Essa classe representa o modelo da tabela saida.
from models.saida import Saida


# Cria a classe responsável pelo acesso aos dados
# da tabela saida.
#
# Aqui estão os métodos que realizarão as operações
# de inserção, leitura, atualização e exclusão (CRUD).
class SaidaRepository:

    # ============================================================
    # INSERIR
    # ============================================================

    # Método responsável por inserir um novo registro de saída
    # no banco de dados.
    #
    # Recebe um objeto da classe Saida.
    def inserir(self, saida: Saida):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Executa o comando SQL de inserção na tabela saida.
        cursor.execute("""
            INSERT INTO saida
            (
                id_usuario,
                data_saida,
                motivo,
                data_cadastro
            )
            VALUES (?, ?, ?, ?)
        """, (

            # Envia o ID do usuário (aluno).
            saida.id_usuario,

            # Envia a data e hora de saída.
            saida.data_saida,

            # Envia o motivo da saída.
            saida.motivo,

            # Envia a data de cadastro.
            saida.data_cadastro,
        ))

        # Obtém o id gerado pelo banco para o registro inserido.
        last_id = cursor.lastrowid

        # Confirma a inserção no banco.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()

        # Retorna o id do novo registro.
        return last_id


    # ============================================================
    # LISTAR
    # ============================================================

    # Método responsável por buscar todas as saídas
    # cadastradas no banco.
    def listar(self):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa a consulta de todas as saídas.
        #
        # O INNER JOIN permite trazer também
        # os dados do usuário relacionado à saída.
        cursor.execute("""
            SELECT
                s.id_saida,
                s.id_usuario,
                u.nome,
                u.ra,
                s.data_saida,
                s.motivo,
                s.data_cadastro
            FROM saida s
            INNER JOIN usuario u
                ON u.id_usuario = s.id_usuario
            ORDER BY s.data_saida DESC
        """)

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros (tuplas) em uma lista de dicionários
        # para facilitar o trabalho com os dados.
        saidas = []
        for registro in registros:
            saidas.append({
                "id_saida": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_saida": registro[4],
                "motivo": registro[5],
                "data_cadastro": registro[6]
            })

        return saidas


    # ============================================================
    # BUSCAR POR ID
    # ============================================================

    # Método responsável por buscar uma saída
    # utilizando o seu identificador.
    def buscar_por_id(self, id_saida):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca a saída pelo ID.
        cursor.execute("""
            SELECT
                s.id_saida,
                s.id_usuario,
                u.nome,
                u.ra,
                s.data_saida,
                s.motivo,
                s.data_cadastro
            FROM saida s
            INNER JOIN usuario u
                ON u.id_usuario = s.id_usuario
            WHERE s.id_saida = ?
        """, (

            # Envia o ID como parâmetro.
            id_saida,
        ))

        # Recupera o primeiro registro encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Se encontrou o registro, converte para dicionário.
        if registro:
            return {
                "id_saida": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_saida": registro[4],
                "motivo": registro[5],
                "data_cadastro": registro[6]
            }

        return None


    # ============================================================
    # BUSCAR POR USUÁRIO
    # ============================================================

    # Método responsável por buscar todas as saídas
    # de um usuário específico.
    #
    # Este método é importante para listar o histórico
    # de saídas de um aluno em particular.
    def buscar_por_usuario(self, id_usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca todas as saídas do usuário.
        cursor.execute("""
            SELECT
                s.id_saida,
                s.id_usuario,
                u.nome,
                u.ra,
                s.data_saida,
                s.motivo,
                s.data_cadastro
            FROM saida s
            INNER JOIN usuario u
                ON u.id_usuario = s.id_usuario
            WHERE s.id_usuario = ?
            ORDER BY s.data_saida DESC
        """, (

            # Envia o ID do usuário como parâmetro.
            id_usuario,
        ))

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros em uma lista de dicionários.
        saidas = []
        for registro in registros:
            saidas.append({
                "id_saida": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_saida": registro[4],
                "motivo": registro[5],
                "data_cadastro": registro[6]
            })

        return saidas


    # ============================================================
    # ATUALIZAR
    # ============================================================

    # Método responsável por atualizar
    # os dados de um registro de saída.
    def atualizar(self, saida: Saida):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando UPDATE para alterar os dados.
        cursor.execute("""
            UPDATE saida
            SET
                id_usuario = ?,
                data_saida = ?,
                motivo = ?
            WHERE id_saida = ?
        """, (

            # Novo ID do usuário.
            saida.id_usuario,

            # Nova data de saída.
            saida.data_saida,

            # Novo motivo.
            saida.motivo,

            # Identifica qual saída será alterada.
            saida.id_saida,
        ))

        # Confirma a alteração.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # EXCLUIR
    # ============================================================

    # Método responsável por excluir um registro de saída
    # do banco de dados.
    def excluir(self, id_saida):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando DELETE para remover o registro.
        cursor.execute("""
            DELETE FROM saida
            WHERE id_saida = ?
        """, (

            # Informa qual saída será excluída.
            id_saida,
        ))

        # Confirma a exclusão.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()
