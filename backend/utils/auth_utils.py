import os

from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models import User


load_dotenv()


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "temporary-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (JWTError, ValueError):
        raise credentials_exception

    current_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if current_user is None:
        raise credentials_exception

    if not current_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    return current_user
import bcrypt


def get_password_hash(password: str) -> str:
    """Hash a plain-text password for storage."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False