from sqlalchemy.orm import Session

from models import PlayerTop
from schemas import *

def create_player(session: Session, top: PlayerDto) -> PlayerDto:

    db_top = PlayerTop(name = top.name,time = top.time)
    session.add(db_top)
    session.commit()
    session.refresh(db_top)

    return PlayerDto(name=db_top.name,time=db_top.time)

def get_all_player(session: Session) -> list[PlayerDto]:

    top = session.query(PlayerTop).order_by(PlayerTop.time).limit(10).all()

    return [PlayerDto(name=db_top.name,time=db_top.time) for db_top in top]




