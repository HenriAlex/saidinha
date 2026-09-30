from database.conexao import Conexao
from models.atividade import Atividade


class AtividadeRepository:

    def inserir(self, atividade: Atividade):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute(
            """
            INSERT INTO atividade (id_usuario, id_disciplina, data_atividade, bimestre, pontos, descricao, data_cadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                atividade.id_usuario,
                atividade.id_disciplina,
                atividade.data_atividade,
                atividade.bimestre,
                atividade.pontos,
                atividade.descricao,
                atividade.data_cadastro,
            ),
        )

        last_id = cursor.lastrowid
        conexao.commit()
        conexao.close()

        return last_id


    def listar(self):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_atividade,
                id_usuario,
                id_disciplina,
                data_atividade,
                bimestre,
                pontos,
                descricao,
                data_cadastro
            FROM atividade
            ORDER BY data_atividade DESC
        """)

        registros = cursor.fetchall()
        conexao.close()

        atividades = []
        for registro in registros:
            atividades.append({
                "id_atividade": registro[0],
                "id_usuario": registro[1],
                "id_disciplina": registro[2],
                "data_atividade": registro[3],
                "bimestre": registro[4],
                "pontos": registro[5],
                "descricao": registro[6],
                "data_cadastro": registro[7]
            })

        return atividades


    def buscar_por_id(self, id_atividade):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_atividade,
                id_usuario,
                id_disciplina,
                data_atividade,
                bimestre,
                pontos,
                descricao,
                data_cadastro
            FROM atividade
            WHERE id_atividade = ?
        """, (id_atividade,))

        registro = cursor.fetchone()
        conexao.close()

        if registro:
            return {
                "id_atividade": registro[0],
                "id_usuario": registro[1],
                "id_disciplina": registro[2],
                "data_atividade": registro[3],
                "bimestre": registro[4],
                "pontos": registro[5],
                "descricao": registro[6],
                "data_cadastro": registro[7]
            }

        return None


    def buscar_por_usuario(self, id_usuario):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_atividade,
                id_usuario,
                id_disciplina,
                data_atividade,
                bimestre,
                pontos,
                descricao,
                data_cadastro
            FROM atividade
            WHERE id_usuario = ?
            ORDER BY data_atividade DESC
        """, (id_usuario,))

        registros = cursor.fetchall()
        conexao.close()

        atividades = []
        for registro in registros:
            atividades.append({
                "id_atividade": registro[0],
                "id_usuario": registro[1],
                "id_disciplina": registro[2],
                "data_atividade": registro[3],
                "bimestre": registro[4],
                "pontos": registro[5],
                "descricao": registro[6],
                "data_cadastro": registro[7]
            })

        return atividades


    def buscar_por_bimestre(self, bimestre):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_atividade,
                id_usuario,
                id_disciplina,
                data_atividade,
                bimestre,
                pontos,
                descricao,
                data_cadastro
            FROM atividade
            WHERE bimestre = ?
            ORDER BY id_usuario, id_disciplina
        """, (bimestre,))

        registros = cursor.fetchall()
        conexao.close()

        atividades = []
        for registro in registros:
            atividades.append({
                "id_atividade": registro[0],
                "id_usuario": registro[1],
                "id_disciplina": registro[2],
                "data_atividade": registro[3],
                "bimestre": registro[4],
                "pontos": registro[5],
                "descricao": registro[6],
                "data_cadastro": registro[7]
            })

        return atividades


    def buscar_por_usuario_disciplina_bimestre(self, id_usuario, id_disciplina, bimestre):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_atividade,
                id_usuario,
                id_disciplina,
                data_atividade,
                bimestre,
                pontos,
                descricao,
                data_cadastro
            FROM atividade
            WHERE id_usuario = ? AND id_disciplina = ? AND bimestre = ?
            ORDER BY data_atividade DESC
        """, (id_usuario, id_disciplina, bimestre))

        registros = cursor.fetchall()
        conexao.close()

        atividades = []
        for registro in registros:
            atividades.append({
                "id_atividade": registro[0],
                "id_usuario": registro[1],
                "id_disciplina": registro[2],
                "data_atividade": registro[3],
                "bimestre": registro[4],
                "pontos": registro[5],
                "descricao": registro[6],
                "data_cadastro": registro[7]
            })

        return atividades


    def atualizar(self, atividade: Atividade):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE atividade
            SET id_usuario = ?, id_disciplina = ?, data_atividade = ?, bimestre = ?, pontos = ?, descricao = ?
            WHERE id_atividade = ?
        """, (
            atividade.id_usuario,
            atividade.id_disciplina,
            atividade.data_atividade,
            atividade.bimestre,
            atividade.pontos,
            atividade.descricao,
            atividade.id_atividade,
        ))

        conexao.commit()
        conexao.close()


    def excluir(self, id_atividade):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            DELETE FROM atividade
            WHERE id_atividade = ?
        """, (id_atividade,))

        conexao.commit()
        conexao.close()
