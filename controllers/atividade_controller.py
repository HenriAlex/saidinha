from fastapi import APIRouter, HTTPException
from datetime import datetime

from models.atividade import Atividade
from schemas.atividade_schema import AtividadeSchema
from services.atividade_service import AtividadeService


router = APIRouter(
    prefix="/atividades",
    tags=["Atividades"]
)

service = AtividadeService()


@router.post("/", status_code=201)
def registrar(atividade_schema: AtividadeSchema):

    atividade = Atividade(
        id_usuario=atividade_schema.id_usuario,
        id_disciplina=atividade_schema.id_disciplina,
        data_atividade=atividade_schema.data_atividade,
        bimestre=atividade_schema.bimestre,
        pontos=atividade_schema.pontos,
        descricao=atividade_schema.descricao,
        data_cadastro=datetime.now().isoformat()
    )

    try:
        novo_id = service.registrar(atividade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "mensagem": "Atividade registrada com sucesso.",
        "id_atividade": novo_id
    }


@router.get("/")
def listar():
    atividades = service.listar()
    return atividades


@router.get("/{id_atividade}")
def buscar_por_id(id_atividade: int):

    try:
        atividade = service.buscar_por_id(id_atividade)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return atividade


@router.get("/usuario/{id_usuario}")
def buscar_por_usuario(id_usuario: int):

    try:
        atividades = service.buscar_por_usuario(id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return atividades


@router.get("/bimestre/{bimestre}")
def buscar_por_bimestre(bimestre: int):

    try:
        atividades = service.buscar_por_bimestre(bimestre)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return atividades


@router.get("/usuario/{id_usuario}/disciplina/{id_disciplina}/bimestre/{bimestre}")
def buscar_por_usuario_disciplina_bimestre(id_usuario: int, id_disciplina: int, bimestre: int):

    try:
        atividades = service.buscar_por_usuario_disciplina_bimestre(id_usuario, id_disciplina, bimestre)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return atividades


@router.put("/{id_atividade}")
def atualizar(id_atividade: int, atividade_schema: AtividadeSchema):

    atividade = Atividade(
        id_atividade=id_atividade,
        id_usuario=atividade_schema.id_usuario,
        id_disciplina=atividade_schema.id_disciplina,
        data_atividade=atividade_schema.data_atividade,
        bimestre=atividade_schema.bimestre,
        pontos=atividade_schema.pontos,
        descricao=atividade_schema.descricao
    )

    try:
        service.atualizar(atividade)
    except ValueError as e:
        status_code = 404 if "não encontrado" in str(e) else 400
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Atividade atualizada com sucesso."}


@router.delete("/{id_atividade}")
def excluir(id_atividade: int):

    try:
        service.excluir(id_atividade)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Atividade excluída com sucesso."}
