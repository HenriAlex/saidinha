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

        # ============================================================
        # INSERIR PERFIS PADRÕES
        # ============================================================

        # Verifica se já existem perfis cadastrados
        cursor.execute("SELECT COUNT(*) FROM perfil")
        count_perfis = cursor.fetchone()[0]

        # Se não houver perfis, insere os padrões do sistema
        if count_perfis == 0:

            # Insere o perfil de Aluno (ID = 1)
            cursor.execute(
                "INSERT INTO perfil (id_perfil, ds_perfil) VALUES (1, ?)",
                ("Aluno",)
            )

            # Insere o perfil de Professor (ID = 2)
            cursor.execute(
                "INSERT INTO perfil (id_perfil, ds_perfil) VALUES (2, ?)",
                ("Professor",)
            )

            # Insere o perfil de Equipe de Apoio (ID = 3)
            cursor.execute(
                "INSERT INTO perfil (id_perfil, ds_perfil) VALUES (3, ?)",
                ("Equipe de Apoio",)
            )

        # ============================================================
        # INSERIR ALUNOS PRIMÁRIOS
        # ============================================================

        # Verifica se já existem alunos cadastrados
        cursor.execute("SELECT COUNT(*) FROM usuario WHERE id_perfil = 1")
        count_alunos = cursor.fetchone()[0]

        # Se não houver alunos, insere a lista padrão
        if count_alunos == 0:
            from datetime import datetime

            # Lista de alunos com seus dados
            alunos = [
                ("00001220989435", "ANDY YAIR ALIZO LINEROS", "00001220989435sp@al.educacao.sp.gov.br", "1234"),
                ("00001118222180", "BEATRIZ DA SILVA ROCHA RODRIGUES", "00001118222180sp@al.educacao.sp.gov.br", "1234"),
                ("00001104885347", "BEATRIZ DE OLIVEIRA ALARCON", "00001104885347sp@al.educacao.sp.gov.br", "1234"),
                ("00001099909132", "CAMILLE DE GODOY NASCIMENTO", "00001099909132sp@al.educacao.sp.gov.br", "1234"),
                ("00001116327508", "CAMILLE VICTORYA CANARIO DE ARANTES", "00001116327508sp@al.educacao.sp.gov.br", "1234"),
                ("00001096495223", "EDUARDO GARCIA FREIRE", "00001096495223sp@al.educacao.sp.gov.br", "1234"),
                ("00001099380790", "EMILLY HANA ESCARANELLI SILVA", "00001099380790sp@al.educacao.sp.gov.br", "1234"),
                ("00001116328239", "GABRIEL DIAS DOS SANTOS", "00001116328239sp@al.educacao.sp.gov.br", "1234"),
                ("00001109429617", "GABRIEL STELLA SANTANA", "00001109429617sp@al.educacao.sp.gov.br", "1234"),
                ("00001107709775", "IASMYM DA SILVA MATOS", "00001107709775sp@al.educacao.sp.gov.br", "1234"),
                ("00001116071228", "ISABELLY MARTINS OLIVEIRA", "00001116071228sp@al.educacao.sp.gov.br", "1234"),
                ("0000109653972x", "JOAO ERNESTO BUENO SANDRINI", "0000109653972xsp@al.educacao.sp.gov.br", "1234"),
                ("00001249789217", "JOAO GABRIEL SILVA BISPO", "00001249789217sp@al.educacao.sp.gov.br", "1234"),
                ("00001100950540", "JOAO VITOR DE VASCONCELLOS", "00001100950540sp@al.educacao.sp.gov.br", "1234"),
                ("00001242770586", "JOSE GUSTAVO RIBEIRO DA COSTA", "00001242770586sp@al.educacao.sp.gov.br", "1234"),
                ("00001131880857", "KARINA SOARES SILVA", "00001131880857sp@al.educacao.sp.gov.br", "1234"),
                ("00001115717947", "KATHLEN SILVA SANTOS", "00001115717947sp@al.educacao.sp.gov.br", "1234"),
                ("00001107320902", "KETLLYN VITORIA DO NASCIMENTO SANTOS", "00001107320902sp@al.educacao.sp.gov.br", "1234"),
                ("00001116316201", "LAURA TAVARES PINTO", "00001116316201sp@al.educacao.sp.gov.br", "1234"),
                ("00001142575858", "LIDIA AGOSTINHO FELIX", "00001142575858sp@al.educacao.sp.gov.br", "1234"),
                ("00001116756584", "MARCOS VINICIUS SANTOS GOMES", "00001116756584sp@al.educacao.sp.gov.br", "1234"),
                ("00001118374654", "MARIA BEATRIZ FERREIRA DE ALMEIDA", "00001118374654sp@al.educacao.sp.gov.br", "1234"),
                ("00001101454854", "NICOLAS GABRIEL CARVALHO FERREIRA", "00001101454854sp@al.educacao.sp.gov.br", "1234"),
                ("00001116075568", "RAPHAELA RODRIGUES FERNANDES", "00001116075568sp@al.educacao.sp.gov.br", "1234"),
                ("00001110455719", "RYAN KAIQUE LEME DA SILVA", "00001110455719sp@al.educacao.sp.gov.br", "1234"),
                ("00001111792331", "SOPHIA ELOA MAZIERO CORREIA", "00001111792331sp@al.educacao.sp.gov.br", "1234"),
                ("00001113435926", "VITORIA BEATRIZ BATISTA PEREIRA", "00001113435926sp@al.educacao.sp.gov.br", "1234"),
            ]

            # Data/hora atual para cadastro
            data_cadastro = datetime.now().isoformat()

            # Insere cada aluno na tabela
            for ra, nome, email, senha in alunos:
                cursor.execute(
                    "INSERT INTO usuario (ra, nome, id_perfil, email, senha, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)",
                    (ra, nome, 1, email, senha, data_cadastro)
                )

        # Confirma as alterações realizadas no banco.
        conexao.commit()

        # Fecha a conexão com o banco.
        conexao.close()


# Executa o método responsável por criar
# o banco de dados e suas tabelas.
CriarBanco.criar()