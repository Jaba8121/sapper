from fastapi import APIRouter

router = APIRouter()

@router.get("/OCENKI")
def ocenki():
    return {ocenki}
