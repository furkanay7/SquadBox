from sqlalchemy import Column, Integer, String, JSON
from database import Base


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


class TrueFalse(Base):
    __tablename__ = "truefalse"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, unique=True, index=True)
    answer = Column(String)  # "true" veya "false"
    explanation = Column(String)
    difficulty = Column(String, index=True)  # "easy", "medium", "hard"


class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    words = Column(JSON)
