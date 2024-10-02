from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.security import get_current_user
from app.core.config import settings
from pydantic import BaseModel
import openai
from datetime import datetime

router = APIRouter()

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    content: str
    is_user_message: bool
    created_at: datetime

class MessageUpdate(BaseModel):
    content: str


# Handles sending and receiving messages
@router.post("/chat", response_model=MessageResponse)
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

    all_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at).all()
    
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
@router.get("/messages", response_model=List[MessageResponse])
async def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).first()
    if not conversation:
        return []
    messages = db.query(Message).filter(Message.conversation_id == conversation.id, Message.is_deleted == False).order_by(Message.created_at).all()
    return messages


#Generates an initial greeting message
@router.get("/initial-message", response_model=MessageResponse)
async def get_initial_message(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

    return ai_message


# Allows updating specific messages
@router.put("/messages/{message_id}", response_model=List[MessageResponse])
async def update_message(
    message_id: int, 
    message: MessageUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    user_message = db.query(Message).filter(Message.id == message_id).first()
    if not user_message or user_message.conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Message not found")
    if not user_message.is_user_message:
        raise HTTPException(status_code=400, detail="Can only edit user messages")
    
    user_message.content = message.content
    user_message.updated_at = datetime.utcnow()
    
    ai_reply = db.query(Message).filter(
        Message.conversation_id == user_message.conversation_id,
        Message.id > user_message.id,
        Message.is_user_message == False
    ).first()
    
    if ai_reply:
        conversation = db.query(Message).filter(
            Message.conversation_id == user_message.conversation_id,
            Message.id <= ai_reply.id
        ).order_by(Message.id).all()
        
        openai_messages = [{"role": "system", "content": "You are a helpful assistant named Ava."}]
        for msg in conversation:
            role = "user" if msg.is_user_message else "assistant"
            openai_messages.append({"role": role, "content": msg.content})
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages
            )
            new_ai_content = response.choices[0].message.content
            
            ai_reply.content = new_ai_content
            ai_reply.updated_at = datetime.utcnow()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    db.commit()
    db.refresh(user_message)
    if ai_reply:
        db.refresh(ai_reply)
    
    return [user_message, ai_reply] if ai_reply else [user_message]


# Allows deleting specific messages
@router.delete("/messages/{message_id}")
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
@router.post("/reset-conversation")
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

    return initial_message
