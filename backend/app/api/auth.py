from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import authenticate_user, create_access_token, get_current_user
from app.db.database import get_db
from app.models.user import User

router = APIRouter()

#Handles user login and returns an access token
@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


#Verifies if a token is valid
@router.get("/verify-token")
def verify_token(current_user: User = Depends(get_current_user)):
    return {"message": "Token is valid", "username": current_user.username}