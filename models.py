from db import Base
from sqlalchemy import Integer, String, Column


class PlayerTop(Base):

    __tablename__ = "top"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    time = Column(Integer, nullable=False)