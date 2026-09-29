# Importa a classe Conexao.
# Essa classe é responsável por abrir a conexão
# com o banco de dados SQLite.
from database.conexao import Conexao

# Importa a classe Retorno.
# Essa classe representa o modelo da tabela retorno.
from models.retorno import Retorno


# Cria a classe responsável pelo acesso aos dados
# da tabela retorno.
#
# Aqui estão os métodos que realizarão as operações
# de inserção, leitura, atualização e exclusão (CRUD).
class RetornoRepository:

    # ============================================================
    # INSERIR
    # ============================================================

    # Método responsável por inserir um novo registro de retorno
    # no banco de dados.
    #
    # Recebe um objeto da classe Retorno.
    def inserir(self, retorno: Retorno):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor para executar comandos SQL.
        cursor = conexao.cursor()

        # Executa o comando SQL de inserção na tabela retorno.
        # O novo campo retorno_manual é incluído para indicar
        # se foi um retorno com data customizada.
        cursor.execute("""
            INSERT INTO retorno
            (
                id_saida,
                id_usuario,
                data_retorno,
                observacoes,
                retorno_manual,
                data_cadastro
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (

            # Envia o ID da saída relacionada.
            retorno.id_saida,

            # Envia o ID do usuário (aluno).
            retorno.id_usuario,

            # Envia a data e hora de retorno.
            retorno.data_retorno,

            # Envia as observações (pode ser vazio).
            retorno.observacoes,

            # Envia a flag de retorno_manual (0 ou 1).
            # 1 = retorno manual com data customizada
            # 0 = retorno automático com data/hora do servidor
            int(retorno.retorno_manual),

            # Envia a data de cadastro.
            retorno.data_cadastro,
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

    # Método responsável por buscar todos os retornos
    # cadastrados no banco.
    def listar(self):

        # Abre uma conexão com o banco.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa a consulta de todos os retornos.
        #
        # O INNER JOIN permite trazer também
        # os dados do usuário relacionado ao retorno.
        # Inclui o campo retorno_manual para indicar
        # se foi um retorno manual ou automático.
        cursor.execute("""
            SELECT
                r.id_retorno,
                r.id_saida,
                r.id_usuario,
                u.nome,
                u.ra,
                r.data_retorno,
                r.observacoes,
                r.retorno_manual,
                r.data_cadastro,
                s.data_saida,
                s.motivo
            FROM retorno r
            INNER JOIN usuario u
                ON u.id_usuario = r.id_usuario
            INNER JOIN saida s
                ON s.id_saida = r.id_saida
            ORDER BY r.data_retorno DESC
        """)

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros (tuplas) em uma lista de dicionários
        # para facilitar o trabalho com os dados.
        retornos = []
        for registro in registros:
            retornos.append({
                "id_retorno": registro[0],
                "id_saida": registro[1],
                "id_usuario": registro[2],
                "nome_usuario": registro[3],
                "ra_usuario": registro[4],
                "data_retorno": registro[5],
                "observacoes": registro[6],
                "retorno_manual": bool(registro[7]),
                "data_cadastro": registro[8],
                "data_saida": registro[9],
                "motivo_saida": registro[10]
            })

        return retornos


    # ============================================================
    # BUSCAR POR ID
    # ============================================================

    # Método responsável por buscar um retorno
    # utilizando o seu identificador.
    def buscar_por_id(self, id_retorno):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca o retorno pelo ID.
        # Inclui o campo retorno_manual para saber
        # se foi um retorno manual ou automático.
        cursor.execute("""
            SELECT
                r.id_retorno,
                r.id_saida,
                r.id_usuario,
                u.nome,
                u.ra,
                r.data_retorno,
                r.observacoes,
                r.retorno_manual,
                r.data_cadastro,
                s.data_saida,
                s.motivo
            FROM retorno r
            INNER JOIN usuario u
                ON u.id_usuario = r.id_usuario
            INNER JOIN saida s
                ON s.id_saida = r.id_saida
            WHERE r.id_retorno = ?
        """, (

            # Envia o ID como parâmetro.
            id_retorno,
        ))

        # Recupera o primeiro registro encontrado.
        registro = cursor.fetchone()

        # Fecha a conexão.
        conexao.close()

        # Se encontrou o registro, converte para dicionário.
        if registro:
            return {
                "id_retorno": registro[0],
                "id_saida": registro[1],
                "id_usuario": registro[2],
                "nome_usuario": registro[3],
                "ra_usuario": registro[4],
                "data_retorno": registro[5],
                "observacoes": registro[6],
                "retorno_manual": bool(registro[7]),
                "data_cadastro": registro[8],
                "data_saida": registro[9],
                "motivo_saida": registro[10]
            }

        return None


    # ============================================================
    # BUSCAR POR SAÍDA
    # ============================================================

    # Método responsável por buscar todos os retornos
    # relacionados a uma saída específica.
    def buscar_por_saida(self, id_saida):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca todos os retornos da saída.
        # Inclui o campo retorno_manual.
        cursor.execute("""
            SELECT
                r.id_retorno,
                r.id_saida,
                r.id_usuario,
                u.nome,
                u.ra,
                r.data_retorno,
                r.observacoes,
                r.retorno_manual,
                r.data_cadastro,
                s.data_saida,
                s.motivo
            FROM retorno r
            INNER JOIN usuario u
                ON u.id_usuario = r.id_usuario
            INNER JOIN saida s
                ON s.id_saida = r.id_saida
            WHERE r.id_saida = ?
            ORDER BY r.data_retorno DESC
        """, (

            # Envia o ID da saída como parâmetro.
            id_saida,
        ))

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros em uma lista de dicionários.
        retornos = []
        for registro in registros:
            retornos.append({
                "id_retorno": registro[0],
                "id_saida": registro[1],
                "id_usuario": registro[2],
                "nome_usuario": registro[3],
                "ra_usuario": registro[4],
                "data_retorno": registro[5],
                "observacoes": registro[6],
                "retorno_manual": bool(registro[7]),
                "data_cadastro": registro[8],
                "data_saida": registro[9],
                "motivo_saida": registro[10]
            })

        return retornos


    # ============================================================
    # BUSCAR POR USUÁRIO
    # ============================================================

    # Método responsável por buscar todos os retornos
    # de um usuário específico.
    def buscar_por_usuario(self, id_usuario):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Busca todos os retornos do usuário.
        # Inclui o campo retorno_manual.
        cursor.execute("""
            SELECT
                r.id_retorno,
                r.id_saida,
                r.id_usuario,
                u.nome,
                u.ra,
                r.data_retorno,
                r.observacoes,
                r.retorno_manual,
                r.data_cadastro,
                s.data_saida,
                s.motivo
            FROM retorno r
            INNER JOIN usuario u
                ON u.id_usuario = r.id_usuario
            INNER JOIN saida s
                ON s.id_saida = r.id_saida
            WHERE r.id_usuario = ?
            ORDER BY r.data_retorno DESC
        """, (

            # Envia o ID do usuário como parâmetro.
            id_usuario,
        ))

        # Recupera todos os registros encontrados.
        registros = cursor.fetchall()

        # Fecha a conexão.
        conexao.close()

        # Converte os registros em uma lista de dicionários.
        retornos = []
        for registro in registros:
            retornos.append({
                "id_retorno": registro[0],
                "id_saida": registro[1],
                "id_usuario": registro[2],
                "nome_usuario": registro[3],
                "ra_usuario": registro[4],
                "data_retorno": registro[5],
                "observacoes": registro[6],
                "retorno_manual": bool(registro[7]),
                "data_cadastro": registro[8],
                "data_saida": registro[9],
                "motivo_saida": registro[10]
            })

        return retornos


    # ============================================================
    # ATUALIZAR
    # ============================================================

    # Método responsável por atualizar
    # os dados de um registro de retorno.
    def atualizar(self, retorno: Retorno):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando UPDATE para alterar os dados.
        # Agora inclui a atualização do campo retorno_manual.
        cursor.execute("""
            UPDATE retorno
            SET
                data_retorno = ?,
                observacoes = ?,
                retorno_manual = ?
            WHERE id_retorno = ?
        """, (

            # Nova data de retorno.
            retorno.data_retorno,

            # Novas observações.
            retorno.observacoes,

            # Nova flag de retorno_manual.
            int(retorno.retorno_manual),

            # Identifica qual retorno será alterado.
            retorno.id_retorno,
        ))

        # Confirma a alteração.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()


    # ============================================================
    # EXCLUIR
    # ============================================================

    # Método responsável por excluir um registro de retorno
    # do banco de dados.
    def excluir(self, id_retorno):

        # Abre uma conexão.
        conexao = Conexao.conectar()

        # Cria um cursor.
        cursor = conexao.cursor()

        # Executa o comando DELETE para remover o registro.
        cursor.execute("""
            DELETE FROM retorno
            WHERE id_retorno = ?
        """, (

            # Informa qual retorno será excluído.
            id_retorno,
        ))

        # Confirma a exclusão.
        conexao.commit()

        # Fecha a conexão.
        conexao.close()
