# Importa a classe datetime.
# Ela será utilizada para trabalhar com datas.
from datetime import datetime


# Classe que representa a tabela usuario.
class Usuario:

    # Método construtor da classe.
    def __init__(self,
                 id_usuario=0,
                 ra="",
                 nome="",
                 id_perfil=0,
                 email="",
                 senha="",
                 data_cadastro=None):

        # Código identificador do usuário.
        self.id_usuario = id_usuario

        # Registro Acadêmico (RA) ou matrícula.
        self.ra = ra

        # Nome completo do usuário.
        self.nome = nome

        # Código do perfil do usuário.
        self.id_perfil = id_perfil

        # E-mail utilizado para login.
        self.email = email

        # Senha do usuário.
        self.senha = senha

        # Caso nenhuma data seja informada,
        # utiliza a data e hora atuais.
        if data_cadastro is None:
            self.data_cadastro = datetime.now()
        else:
            self.data_cadastro = data_cadastro