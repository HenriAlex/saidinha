# A palavra 'class' indica que estamos criando uma classe.
# A classe representa uma entidade do nosso sistema.
class Perfil:

    # O método __init__ é chamado automaticamente sempre que um
    # novo objeto da classe Perfil é criado.
    def __init__(self,
                 id_perfil=0,
                 ds_perfil=""):

        # self representa o próprio objeto criado.

        # Armazena o código do perfil.
        self.id_perfil = id_perfil

        # Armazena a descrição do perfil.
        # Exemplo: Aluno, Professor, Inspetor...
        self.ds_perfil = ds_perfil