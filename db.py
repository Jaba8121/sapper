from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

DATABASE = "sqlite:///top.db"

engine = create_engine(DATABASE, future=True)
SessionLocal = sessionmaker(autoflush=False, bind=engine, class_=Session, expire_on_commit=False)

Base = declarative_base()

def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
