from pydantic import BaseModel


class DisciplinaSchema(BaseModel):

    descricao: str

    id_usuario_logado: int = 0
    id_perfil_logado: int = 0
