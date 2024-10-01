from typing import List
import openai
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from models import User, Conversation, Message
from database import SessionLocal, engine
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in environment variables")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# Add CORS middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    content: str
    is_user_message: bool
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    password: str

class MessageUpdate(BaseModel):
    content: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


#Creates a new user
@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

def authenticate_user(username: str, password: str, db: Session):
    user = get_user(db, username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


#Handles user login and returns an access token
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user


#Verifies if a token is valid
@app.get("/verify-token")
def verify_token(current_user: User = Depends(get_current_user)):
    return {"message": "Token is valid", "username": current_user.username}


# Handles sending and receiving messages
@app.post("/chat", response_model=MessageResponse)
async def chat(message: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).first()
    if not conversation:
        conversation = Conversation(user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    user_message = Message(conversation_id=conversation.id, content=message.content, is_user_message=True)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Fetch all messages for this conversation
    all_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at).all()
    
    # Prepare messages for OpenAI API
    openai_messages = [{"role": "system", "content": "You are a helpful assistant named Ava."}]
    for msg in all_messages:
        role = "user" if msg.is_user_message else "assistant"
        openai_messages.append({"role": role, "content": msg.content})

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=openai_messages
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    ai_message = Message(conversation_id=conversation.id, content=ai_content, is_user_message=False)
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return ai_message


#Retrieves all messages for a user.
@app.get("/messages", response_model=List[MessageResponse])
async def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).first()
    if not conversation:
        return []
    messages = db.query(Message).filter(Message.conversation_id == conversation.id, Message.is_deleted == False).order_by(Message.created_at).all()
    return [MessageResponse(
        id=message.id,
        content=message.content,
        is_user_message=message.is_user_message,
        created_at=message.created_at
    ) for message in messages]


#Generates an initial greeting message
@app.get("/initial-message", response_model=MessageResponse)
async def get_initial_message(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print("fetching initial message")
    conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).first()
    if not conversation:
        conversation = Conversation(user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant named Ava. Greet the user and ask how you can help them today."}
            ]
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    ai_message = Message(conversation_id=conversation.id, content=ai_content, is_user_message=False)
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return MessageResponse(
        id=ai_message.id,
        content=ai_message.content,
        is_user_message=ai_message.is_user_message,
        created_at=ai_message.created_at
    )


# Allows updating specific messages
@app.put("/messages/{message_id}", response_model=List[MessageResponse])
async def update_message(
    message_id: int, 
    message: MessageUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Find the user message
    user_message = db.query(Message).filter(Message.id == message_id).first()
    if not user_message or user_message.conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Message not found")
    if not user_message.is_user_message:
        raise HTTPException(status_code=400, detail="Can only edit user messages")
    
    # Update the user message
    user_message.content = message.content
    user_message.updated_at = datetime.utcnow()
    
    # Find the AI reply (next message in the conversation)
    ai_reply = db.query(Message).filter(
        Message.conversation_id == user_message.conversation_id,
        Message.id > user_message.id,
        Message.is_user_message == False
    ).first()
    
    if ai_reply:
        # Fetch the conversation context
        conversation = db.query(Message).filter(
            Message.conversation_id == user_message.conversation_id,
            Message.id <= ai_reply.id
        ).order_by(Message.id).all()
        
        # Prepare messages for OpenAI API
        openai_messages = [{"role": "system", "content": "You are a helpful assistant named Ava."}]
        for msg in conversation:
            role = "user" if msg.is_user_message else "assistant"
            openai_messages.append({"role": role, "content": msg.content})
        
        # Generate new AI response
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages
            )
            new_ai_content = response.choices[0].message.content
            
            # Update AI reply
            ai_reply.content = new_ai_content
            ai_reply.updated_at = datetime.utcnow()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    db.commit()
    db.refresh(user_message)
    if ai_reply:
        db.refresh(ai_reply)
    
    print(user_message)
    print(ai_reply)
    
    # Return both updated messages
    return [
        MessageResponse(
            id=user_message.id,
            content=user_message.content,
            is_user_message=user_message.is_user_message,
            created_at=user_message.created_at
        ),
        MessageResponse(
            id=ai_reply.id,
            content=ai_reply.content,
            is_user_message=ai_reply.is_user_message,
            created_at=ai_reply.created_at
        ) if ai_reply else None
    ]


# Allows deleting specific messages
@app.delete("/messages/{message_id}")
async def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if not db_message or db_message.conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Message not found")
    if not db_message.is_user_message:
        raise HTTPException(status_code=400, detail="Can only delete user messages")
    db_message.is_deleted = True
    db.commit()
    return {"detail": "Message deleted"}


#reset chat and fetch initial message again
@app.post("/reset-conversation")
async def reset_conversation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Delete all messages for the user's conversation
    conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).first()
    if conversation:
        db.query(Message).filter(Message.conversation_id == conversation.id).delete()
        db.delete(conversation)
        db.commit()

    # Create a new conversation
    new_conversation = Conversation(user_id=current_user.id)
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    # Generate and add initial message
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant named Ava. Greet the user and ask how you can help them today."}
            ]
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    initial_message = Message(conversation_id=new_conversation.id, content=ai_content, is_user_message=False)
    db.add(initial_message)
    db.commit()
    db.refresh(initial_message)

    return MessageResponse(
        id=initial_message.id,
        content=initial_message.content,
        is_user_message=initial_message.is_user_message,
        created_at=initial_message.created_at
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)