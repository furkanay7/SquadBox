from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import AsyncGenerator


import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '.env'),
        extra='ignore'
    )

    DATABASE_URL: str


settings = Settings()


async_engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_factory = async_sessionmaker(async_engine, expire_on_commit=False)

Base = declarative_base()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
        await session.commit()