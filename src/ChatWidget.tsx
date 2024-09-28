import React, { useState, useEffect, useCallback  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as MessageCircleIcon } from './assets/message-circle.svg';
import { ReactComponent as XIcon } from './assets/x.svg';
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
    PromptButton
  } from './StyledComponents';

  interface Message {
    id: number;
    role: string;
    content: string;
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

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchInitialMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    setShowResetButton(messages.some(message => message.role === 'user'));
  }, [messages]);

  const toggleFullScreen = useCallback(() => {
    if (!isMobile) {
      setIsFullScreen(!isFullScreen);
    }
  }, [isMobile, isFullScreen]);

  useEffect(() => {
    setShowResetButton(messages.some(message => message.role === 'user'));
  }, [messages]);

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

  const fetchInitialMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/initial-message');
      const data = await response.json();
      
      setMessages([{ id: Date.now(), role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error fetching initial message:', error);
    }
  };

  const generateNewPrompts = () => {
    const prompts = [
      'Tell a Joke', 'Ask a Riddle', 'Give a Fun Fact',
      'Suggest a Book', 'Recommend a Movie', 'Share a Quote'
    ];
    const newPrompts = prompts.sort(() => 0.5 - Math.random()).slice(0, 2);
    setCurrentPrompts(newPrompts);
  };

  const sendMessage = async (content: string) => {
    const newUserMessage = { id: Date.now(), role: 'user', content };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setCurrentPrompts([]); // Clear prompts when user sends a message

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });
      const data = await response.json();
      const newAssistantMessage = { id: Date.now(), role: 'assistant', content: data.message };
      setMessages(prevMessages => [...prevMessages, newAssistantMessage]);
      setLastAssistantMessageId(newAssistantMessage.id);
      generateNewPrompts();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
    setCurrentPrompts([]); // Clear prompts after selection
  };

  const deleteMessage = (messageId: number) => {
    setMessages(prevMessages => {
      const indexToDelete = prevMessages.findIndex(msg => msg.id === messageId);
      if (indexToDelete === -1) return prevMessages;
  
      // Remove the user message and the following assistant message (if it exists)
      const newMessages = [...prevMessages];
      newMessages.splice(indexToDelete, indexToDelete + 1 < newMessages.length ? 2 : 1);
      return newMessages;
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const resetChat = () => {
    setMessages([]);
    fetchInitialMessage();
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
              
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <MessageContainer
                    key={message.id}
                    role={message.role}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                  {message.role === 'assistant' && (
                    <AssistantProfilePic src={ava} alt="Ava" />
                  )}

                  {message.role === 'user' && hoveredMessageId === message.id && (
                    <HoverActionsContainer>
                      <Tooltip content="Edit">
                        <Icon as="button" style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 5 }}>
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

                  <MessageBubble role={message.role}>
                    <MessageContent>{message.content}</MessageContent>
                  </MessageBubble>

              </MessageContainer>
              {message.role === 'assistant' && (message.id === lastAssistantMessageId || messages.length == 1) && currentPrompts.length > 0 && (
                    <PromptContainer>
                      {currentPrompts.map((prompt, index) => (
                        <PromptButton key={index} onClick={() => handlePromptClick(prompt)}>
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
                    if (inputMessage.trim() !== '') {
                      sendMessage(inputMessage);
                    }
                  }}
                  style={{ 
                    cursor: inputMessage.trim() === '' ? 'not-allowed' : 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: 0 
                  }}
                >
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