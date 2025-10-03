from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, DateTime

from .. import db


class TokenBlockList(db.Model):
    id = Column(BigInteger(), primary_key=True)
    jti = Column(String(64), nullable=False)
    create_at = Column(DateTime(), default=datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()

