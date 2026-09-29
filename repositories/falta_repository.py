# Importa a classe Conexao.
# Essa classe é responsável por abrir a conexão
# com o banco de dados SQLite.
from database.conexao import Conexao

# Importa a classe Falta.
# Essa classe representa o modelo da tabela falta.
from models.falta import Falta


# Cria a classe responsável pelo acesso aos dados
# da tabela falta.
#
# Aqui estão os métodos que realizarão as operações
# de inserção, leitura, atualização e exclusão (CRUD).
class FaltaRepository:

    # ============================================================
    # INSERIR
    # ============================================================

    # Método responsável por inserir um novo registro de falta
    # no banco de dados.
    #
    # Recebe um objeto da classe Falta.
    def inserir(self, falta: Falta):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Executa o comando SQL de inserção na tabela falta.
        cursor.execute("""
            INSERT INTO falta
            (
                id_usuario,
                data_falta,
                motivo,
                observacoes,
                data_cadastro
            )
            VALUES (?, ?, ?, ?, ?)
        """, (

            # Envia o ID do usuário (aluno).
            falta.id_usuario,

            # Envia a data da falta.
            falta.data_falta,

            # Envia o motivo da falta (pode ser vazio).
            falta.motivo,

            # Envia as observações (pode ser vazio).
            falta.observacoes,

            # Envia a data de cadastro.
            falta.data_cadastro,
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

    # Método responsável por buscar todas as faltas
    # cadastradas no banco.
    def listar(self):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa a consulta de todas as faltas.
        #
        # O INNER JOIN permite trazer também
        # os dados do usuário relacionado à falta.
        cursor.execute("""
            SELECT
                f.id_falta,
                f.id_usuario,
                u.nome,
                u.ra,
                f.data_falta,
                f.motivo,
                f.observacoes,
                f.data_cadastro
            FROM falta f
            INNER JOIN usuario u
                ON u.id_usuario = f.id_usuario
            ORDER BY f.data_falta DESC
        """)

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros (tuplas) em uma lista de dicionários
        # para facilitar o trabalho com os dados.
        faltas = []
        for registro in registros:
            faltas.append({
                "id_falta": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_falta": registro[4],
                "motivo": registro[5],
                "observacoes": registro[6],
                "data_cadastro": registro[7]
            })

        return faltas


    # ============================================================
    # BUSCAR POR ID
    # ============================================================

    # Método responsável por buscar uma falta
    # utilizando o seu identificador.
    def buscar_por_id(self, id_falta):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca a falta pelo ID.
        cursor.execute("""
            SELECT
                f.id_falta,
                f.id_usuario,
                u.nome,
                u.ra,
                f.data_falta,
                f.motivo,
                f.observacoes,
                f.data_cadastro
            FROM falta f
            INNER JOIN usuario u
                ON u.id_usuario = f.id_usuario
            WHERE f.id_falta = ?
        """, (

            # Envia o ID como parâmetro.
            id_falta,
        ))

        # Recupera o primeiro registro encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Se encontrou o registro, converte para dicionário.
        if registro:
            return {
                "id_falta": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_falta": registro[4],
                "motivo": registro[5],
                "observacoes": registro[6],
                "data_cadastro": registro[7]
            }

        return None


    # ============================================================
    # BUSCAR POR USUÁRIO
    # ============================================================

    # Método responsável por buscar todas as faltas
    # de um usuário específico.
    def buscar_por_usuario(self, id_usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca todas as faltas do usuário.
        cursor.execute("""
            SELECT
                f.id_falta,
                f.id_usuario,
                u.nome,
                u.ra,
                f.data_falta,
                f.motivo,
                f.observacoes,
                f.data_cadastro
            FROM falta f
            INNER JOIN usuario u
                ON u.id_usuario = f.id_usuario
            WHERE f.id_usuario = ?
            ORDER BY f.data_falta DESC
        """, (

            # Envia o ID do usuário como parâmetro.
            id_usuario,
        ))

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros em uma lista de dicionários.
        faltas = []
        for registro in registros:
            faltas.append({
                "id_falta": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_falta": registro[4],
                "motivo": registro[5],
                "observacoes": registro[6],
                "data_cadastro": registro[7]
            })

        return faltas


    # ============================================================
    # BUSCAR POR DATA
    # ============================================================

    # Método responsável por buscar todas as faltas
    # de uma data específica.
    def buscar_por_data(self, data_falta):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca todas as faltas da data.
        cursor.execute("""
            SELECT
                f.id_falta,
                f.id_usuario,
                u.nome,
                u.ra,
                f.data_falta,
                f.motivo,
                f.observacoes,
                f.data_cadastro
            FROM falta f
            INNER JOIN usuario u
                ON u.id_usuario = f.id_usuario
            WHERE f.data_falta = ?
            ORDER BY u.nome ASC
        """, (

            # Envia a data como parâmetro.
            data_falta,
        ))

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros em uma lista de dicionários.
        faltas = []
        for registro in registros:
            faltas.append({
                "id_falta": registro[0],
                "id_usuario": registro[1],
                "nome_usuario": registro[2],
                "ra_usuario": registro[3],
                "data_falta": registro[4],
                "motivo": registro[5],
                "observacoes": registro[6],
                "data_cadastro": registro[7]
            })

        return faltas


    # ============================================================
    # ATUALIZAR
    # ============================================================

    # Método responsável por atualizar
    # os dados de um registro de falta.
    def atualizar(self, falta: Falta):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando UPDATE para alterar os dados.
        cursor.execute("""
            UPDATE falta
            SET
                data_falta = ?,
                motivo = ?,
                observacoes = ?
            WHERE id_falta = ?
        """, (

            # Nova data da falta.
            falta.data_falta,

            # Novo motivo.
            falta.motivo,

            # Novas observações.
            falta.observacoes,

            # Identifica qual falta será alterada.
            falta.id_falta,
        ))

        # Confirma a alteração.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # EXCLUIR
    # ============================================================

    # Método responsável por excluir um registro de falta
    # do banco de dados.
    def excluir(self, id_falta):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando DELETE para remover o registro.
        cursor.execute("""
            DELETE FROM falta
            WHERE id_falta = ?
        """, (

            # Informa qual falta será excluída.
            id_falta,
        ))

        # Confirma a exclusão.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()
