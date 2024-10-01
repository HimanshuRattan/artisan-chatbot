import React, { useState, useEffect, useCallback  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as MessageCircleIcon } from './assets/message-circle.svg';
import { ReactComponent as XIcon } from './assets/x.svg';
import { ReactComponent as XWhite } from './assets/xwhite.svg';
import { ReactComponent as Maximize } from './assets/maximize-2.svg';
import { ReactComponent as Minimize } from './assets/minimize-2.svg';
import { ReactComponent as Sidebar } from './assets/sidebar.svg';
import { ReactComponent as Send } from './assets/send.svg';
import { ReactComponent as Settings } from './assets/settings.svg';
import profilePic from './assets/profile.png';
import ava from './assets/ava.png';
import waveImage from './assets/wave.png';
import { ReactComponent as RefreshIcon } from './assets/refresh-cw.svg';
import { ReactComponent as ChevronIcon } from './assets/down.svg';
import { ReactComponent as EditIcon } from './assets/edit.svg';
import { ReactComponent as TrashIcon } from './assets/trash-2.svg';
import { ReactComponent as Check } from './assets/check.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    WidgetButton,
    ChatWindow,
    ChatHeader,
    ChatBody,
    ChatInput,
    IconContainer,
    Footer,
    Icon,
    IntroContainer,
    ProfileImage,
    Greeting,
    WaveImage,
    AskAnything,
    ChatInputContainer,
    ProfileImageRound,
    BorderLine,
    FooterText,
    StyledSelect,
    SelectWrapper,
    MessageContainer,
    MessageBubble,
    MessageContent,
    AssistantProfilePic,
    Tooltip,
    HoverActionsContainer,
    PromptContainer,
    PromptButton,
    EditInput,
    DeletedMessageBubble,
    // LoadingDots
  } from './StyledComponents';

  interface Message {
    id: number;
    content: string;
    is_user_message: boolean;
    created_at: string;
    is_deleted?: boolean;
    updated_at?: string;
  }

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('onboarding');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showResetButton, setShowResetButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [currentPrompts, setCurrentPrompts] = useState<string[]>(['Tell a Joke', 'Ask a Riddle']);
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChat();
    }
  }, [isOpen]);

  // useEffect(() => {
  //   if (!isInitialized) {
  //     initializeChat();
  //   }
  // }, []);

  const initializeChat = async () => {
    await fetchConversation();
    if (messages.length === 0) {
      await fetchInitialMessage();
    }
    setIsInitialized(true);
  };

  useEffect(() => {
    setShowResetButton(messages.some(message => message.is_user_message === true));
  }, [messages]);

  const toggleFullScreen = useCallback(() => {
    if (!isMobile) {
      setIsFullScreen(!isFullScreen);
    }
  }, [isMobile, isFullScreen]);

  // useEffect(() => {
  //   setShowResetButton(messages.some(message => message.role === 'user'));
  // }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation. Please try again.', {});
    }
  };


  const fetchInitialMessage = async () => {
    console.log("🎉 Congratulations on the seed round 🎉");
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/initial-message', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Message = await response.json();
    setMessages(prevMessages => [...prevMessages, data]);
  } catch (error) {
    console.error('Error fetching initial message:', error);
    toast.error('Failed to start the conversation. Please try again.', {});
  }
};

  const generateNewPrompts = useCallback(() => {
    const prompts = [
      'Tell a Joke', 'Ask a Riddle', 'Give a Fun Fact', 'What is AI', 'What is a BDR'
    ];
    const newPrompts = prompts.sort(() => 0.5 - Math.random()).slice(0, 2);
    setCurrentPrompts(newPrompts);
  }, []);

  const sendMessage = async (content: string) => {
    if (content.trim() === '') {
      toast.warn('Please enter a message before sending.', {});
      return;
    }

    setIsLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Message = await response.json();
      console.log(data);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: data.id-1,
          content: content,
          is_user_message: true,
          created_at: new Date().toISOString()
        },
        data
      ]);
      setInputMessage('');
      setLastAssistantMessageId(data.id);
      generateNewPrompts();
      console.log(messages);
    } catch (error) {
      console.error('I swear it worked on my machine');
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.', {});
    } finally {
      setIsLoading(false); 
    }
    // console.log(messages)
  };


  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
    setCurrentPrompts([]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.is_user_message) {
        setLastAssistantMessageId(lastMessage.id);
        generateNewPrompts();
      }
    }
  }, [messages, generateNewPrompts]);

  const deleteMessage = async (messageId: number) => {
    console.log(messageId)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, is_deleted: true } : msg
      ));
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message. Please try again.', {});
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const resetChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/reset-conversation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const initialMessage: Message = await response.json();
      setMessages([initialMessage]);
      setLastAssistantMessageId(initialMessage.id);
      generateNewPrompts();
      toast.success('Chat has been reset successfully.');
    } catch (error) {
      console.error('Error resetting conversation:', error);
      toast.error('Failed to reset conversation. Please try again.', {});
    }
  };

  //edit message functions
  const handleEditClick = (messageId: number, content: string) => {
    console.log(messageId);
    console.log(messages);
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleEditSave = async () => {
    if (!editingMessageId) return;

    console.log(editingMessageId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/messages/${editingMessageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      //this took so much time :/
      const updatedMessage: Message[] = await response.json();
      console.log(updatedMessage)
      setMessages(prevMessages => 
        prevMessages.map(prevMsg => {
          // Find the updated message in the array of updatedMessages
          const updatedMsg = updatedMessage.find(msg => msg.id === prevMsg.id);
          
          // update the msg with the smae id
          return updatedMsg 
            ? { ...prevMsg, content: updatedMsg.content } 
            : prevMsg;
        })
      );

      setEditingMessageId(null);
      setEditedContent('');
      toast.success('Message updated successfully!');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message. Please try again.', {});
    }
  };



  const getChatWindowStyle = useCallback(() => {
    if (isMobile) {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 20,
        width: '100%',
        height: '90%',
        maxWidth: 'none',
        borderRadius: '0',
      };
    }
    return {
      position: 'fixed' as const,
      top: isFullScreen ? '20px' : 'auto',
      left: isFullScreen ? '20px' : 'auto',
      right: isFullScreen ? '20px' : '20px',
      bottom: isFullScreen ? '20px' : '100px',
      width: isFullScreen ? 'calc(100% - 40px)' : '400px',
      height: isFullScreen ? 'calc(90% - 40px)' : '80%',
      maxWidth: isFullScreen ? 'none' : '400px',
      borderRadius: '20px',
      transition: 'all 0.0s ease-in-out',
    };
  }, [isFullScreen, isMobile]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} 
                      closeOnClick pauseOnHover draggable 
                      theme="colored" />
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={getChatWindowStyle()}
        >
            <ChatHeader>
              <IconContainer>
              {!isMobile && (
                    <Icon as="button" onClick={toggleFullScreen} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                      {isFullScreen ? <Minimize /> : <Maximize />}
                    </Icon>
                )}
                <Icon>
                  <Sidebar />
                </Icon>
              </IconContainer>
              <Icon 
                as="button"
                onClick={toggleChat} 
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                <XIcon />
              </Icon>
            </ChatHeader>

            <ChatBody>

            <IntroContainer>
                  <ProfileImage src={ava} alt="Profile" />
                  <Greeting>
                    Hey <WaveImage src={waveImage} alt="Wave" />, I'm Ava
                  </Greeting>
                  <AskAnything>Ask me anything or pick a place to start</AskAnything>
                </IntroContainer>

                {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                <MessageContainer
                  key={message.id}
                  role={message.is_user_message ? 'user' : 'assistant'}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {!message.is_user_message && (
                    <AssistantProfilePic src={ava} alt="Ava" />
                  )}

                  {message.is_user_message && hoveredMessageId === message.id && !message.is_deleted && (
                    <HoverActionsContainer>
                      <Tooltip content="Edit">
                        <Icon as="button" onClick={() => handleEditClick(message.id, message.content)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 5 }}>
                          <EditIcon />
                        </Icon>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Icon as="button" onClick={() => deleteMessage(message.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 5 }}>
                          <TrashIcon />
                        </Icon>
                      </Tooltip>
                    </HoverActionsContainer>
                  )}

              {message.is_deleted ? (
                <DeletedMessageBubble role={message.is_user_message ? 'user' : 'assistant'}>
                  Deleted message
                </DeletedMessageBubble>
              ) : (
                <MessageBubble role={message.is_user_message ? 'user' : 'assistant'}>
                  {editingMessageId === message.id ? (
                    <>
                      <EditInput
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditSave();
                          }
                        }}
                      />
                      <Icon
                        as="button"
                        onClick={handleEditSave}
                        style={{ 
                          cursor:'pointer', 
                          background: 'none', 
                          border: 'none', 
                          padding: 0 
                        }}
                      >
                        <Check />
                      </Icon>
                      <Icon
                        as="button"
                        onClick={handleEditCancel}
                        style={{ 
                          cursor:'pointer', 
                          background: 'none', 
                          border: 'none', 
                          padding: 0,
                          color: '#fff'
                        }}
                      >
                        <XWhite />
                      </Icon>
                    </>
                  ) : (

                      <MessageContent>{message.content}</MessageContent>
                    )}
                  </MessageBubble>
                   )}
                </MessageContainer>


                {!message.is_user_message && message.id === lastAssistantMessageId && currentPrompts.length > 0 && (
                  <PromptContainer>
                    {currentPrompts.map((prompt, promptIndex) => (
                      <PromptButton key={promptIndex} onClick={() => handlePromptClick(prompt)}>
                        {prompt}
                      </PromptButton>
                    ))}
                  </PromptContainer>
                )}
              </React.Fragment>

                
              ))}
            </ChatBody>
            
            <BorderLine />
            <ChatInputContainer>
                <ProfileImageRound src={profilePic} alt="Profile" />
                <ChatInput
                  type="text"
                  placeholder="Your question"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputMessage.trim() !== '') {
                      sendMessage(inputMessage);
                    }
                  }}
                />
            </ChatInputContainer>
            
            <Footer>
            <FooterText>
              <span>Context</span>

                <SelectWrapper>
                    <StyledSelect value={selectedRole} onChange={handleRoleChange}>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    </StyledSelect>
                    <ChevronIcon />
                </SelectWrapper>
            </FooterText>


              <IconContainer>
              {showResetButton && (
                  <Tooltip content="Reset chat">
                    <Icon as="button" onClick={resetChat} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginTop: 5 }}>
                      <RefreshIcon />
                    </Icon>
                  </Tooltip>
                )}

                <Icon>
                  <Settings />
                </Icon> 
                <Icon
                  as="button"
                  onClick={() => {
                      sendMessage(inputMessage);
                  }}
                  style={{ 
                    cursor:'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: 0 
                  }}>
                  <Send />
                </Icon>
              </IconContainer>
            </Footer>
          </ChatWindow>
        )}
      </AnimatePresence>
      <WidgetButton
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon>
          <MessageCircleIcon />
        </Icon>
      </WidgetButton>
    </>
  );
};

export default ChatWidget;