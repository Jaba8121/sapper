from db import engine,Base,get_db
from schemas import PlayerDto
from repository import create_player, get_all_player
from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

def init_db():
    Base.metadata.create_all(bind=engine)

init_db()



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/add_player")
def add_player(dto:PlayerDto,session: Session = Depends(get_db)) -> PlayerDto:
    return create_player(session ,dto)

@app.get("/player")
def get_players_top(session: Session = Depends(get_db)) -> list[PlayerDto]:
    return get_all_player(session)




