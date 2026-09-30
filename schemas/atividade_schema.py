from pydantic import BaseModel


class AtividadeSchema(BaseModel):

    id_usuario: int

    id_disciplina: int

    data_atividade: str

    bimestre: int

    pontos: float

    descricao: str = ""

    id_usuario_logado: int = 0

    id_perfil_logado: int = 0
