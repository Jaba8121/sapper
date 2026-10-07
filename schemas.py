from pydantic import BaseModel

class PlayerDto(BaseModel):
    name: str
    time: int



