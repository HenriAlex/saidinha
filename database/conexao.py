# Importa a biblioteca responsável por trabalhar com o SQLite.
import sqlite3

# Classe responsável por realizar a conexão com o banco.
class Conexao:

    # Método estático.
    # Pode ser utilizado sem criar um objeto da classe.
    @staticmethod
    def conectar():

        # Cria (caso não exista) ou abre o banco de dados.
        conexao = sqlite3.connect("saidinha.db")

        # Permite acessar as colunas pelo nome.
        conexao.row_factory = sqlite3.Row

        # Retorna a conexão aberta.
        return conexao