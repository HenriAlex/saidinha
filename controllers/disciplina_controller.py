from fastapi import APIRouter, HTTPException
from datetime import datetime

from models.disciplina import Disciplina
from schemas.disciplina_schema import DisciplinaSchema
from services.disciplina_service import DisciplinaService


router = APIRouter(
    prefix="/disciplinas",
    tags=["Disciplinas"]
)

service = DisciplinaService()


@router.post("/", status_code=201)
def registrar(disciplina_schema: DisciplinaSchema):

    disciplina = Disciplina(
        descricao=disciplina_schema.descricao,
        data_cadastro=datetime.now().isoformat()
    )

    try:
        novo_id = service.cadastrar(disciplina)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "mensagem": "Disciplina registrada com sucesso.",
        "id_disciplina": novo_id
    }


@router.get("/")
def listar():
    disciplinas = service.listar()
    return disciplinas


@router.get("/{id_disciplina}")
def buscar_por_id(id_disciplina: int):

    try:
        disciplina = service.buscar_por_id(id_disciplina)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return disciplina


@router.put("/{id_disciplina}")
def atualizar(id_disciplina: int, disciplina_schema: DisciplinaSchema):

    disciplina = Disciplina(
        id_disciplina=id_disciplina,
        descricao=disciplina_schema.descricao
    )

    try:
        service.atualizar(disciplina)
    except ValueError as e:
        status_code = 404 if "não encontrado" in str(e) else 400
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Disciplina atualizada com sucesso."}


@router.delete("/{id_disciplina}")
def excluir(id_disciplina: int):

    try:
        service.excluir(id_disciplina)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Disciplina excluída com sucesso."}
