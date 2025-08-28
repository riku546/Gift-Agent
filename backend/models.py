from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from settings import Base
import uuid


class TodoModel(Base):
    __tablename__ = 'todo'

    id = Column(Integer, primary_key=True)
    title = Column(String)
    created_date = Column(DateTime, default=datetime.now)




class UserModel(Base):
    __tablename__ = 'user'

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    session_token = Column(String, default=lambda: str(uuid.uuid4()))
    create_at = Column(DateTime, default=datetime.now)
    update_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)