from sqlalchemy import Column, Integer, String, JSON
from backend.database import Base


class Taboo(Base):
    __tablename__ = "taboo"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    word = Column(String, unique=True, index=True)
    forbidden_words = Column(JSON)


class Spyfall(Base):
    __tablename__ = "spyfall"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, unique=True, index=True)
    roles = Column(JSON)
