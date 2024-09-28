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
    Tooltip
  } from './StyledComponents';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('onboarding');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showResetButton, setShowResetButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      setMessages([{ role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error fetching initial message:', error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
        bottom: 0,
        width: '100%',
        height: '100%',
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
      height: isFullScreen ? 'calc(100% - 40px)' : '80%',
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
              {
                messages.map((message, index) => (
                  <MessageContainer key={index} role={message.role}>
                    {message.role === 'assistant' && (
                      <AssistantProfilePic src={ava} alt="Ava" />
                    )}
                    <MessageBubble role={message.role}>
                      <MessageContent>{message.content}</MessageContent>
                    </MessageBubble>
                  </MessageContainer>
                ))
              }
            </ChatBody>
            
            <BorderLine />
            <ChatInputContainer>
                <ProfileImageRound src={profilePic} alt="Profile" />
                <ChatInput
                  type="text"
                  placeholder="Your question"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
                <Icon as="button" onClick={sendMessage} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
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