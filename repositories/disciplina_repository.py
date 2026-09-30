from database.conexao import Conexao
from models.disciplina import Disciplina


class DisciplinaRepository:

    def inserir(self, disciplina: Disciplina):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute(
            """
            INSERT INTO disciplina (descricao, data_cadastro)
            VALUES (?, ?)
        """,
            (
                disciplina.descricao,
                disciplina.data_cadastro,
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
                id_disciplina,
                descricao,
                data_cadastro
            FROM disciplina
            ORDER BY descricao
        """)

        registros = cursor.fetchall()
        conexao.close()

        disciplinas = []
        for registro in registros:
            disciplinas.append({
                "id_disciplina": registro[0],
                "descricao": registro[1],
                "data_cadastro": registro[2]
            })

        return disciplinas


    def buscar_por_id(self, id_disciplina):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id_disciplina,
                descricao,
                data_cadastro
            FROM disciplina
            WHERE id_disciplina = ?
        """, (id_disciplina,))

        registro = cursor.fetchone()
        conexao.close()

        if registro:
            return {
                "id_disciplina": registro[0],
                "descricao": registro[1],
                "data_cadastro": registro[2]
            }

        return None


    def atualizar(self, disciplina: Disciplina):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE disciplina
            SET descricao = ?
            WHERE id_disciplina = ?
        """, (
            disciplina.descricao,
            disciplina.id_disciplina,
        ))

        conexao.commit()
        conexao.close()


    def excluir(self, id_disciplina):

        conexao = Conexao.conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            DELETE FROM disciplina
            WHERE id_disciplina = ?
        """, (id_disciplina,))

        conexao.commit()
        conexao.close()
