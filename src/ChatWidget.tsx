import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as MessageCircleIcon } from './assets/message-circle.svg';
import { ReactComponent as XIcon } from './assets/x.svg';
import { ReactComponent as Maximize } from './assets/maximize-2.svg';
import { ReactComponent as Sidebar } from './assets/sidebar.svg';
import { ReactComponent as Send } from './assets/send.svg';
import { ReactComponent as Settings } from './assets/settings.svg';
import profilePic from './assets/profile.png';
import ava from './assets/ava.png';
import waveImage from './assets/wave.png';
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
    SelectWrapper
  } from './StyledComponents';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('onboarding');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ChatHeader>
              <IconContainer>
                <Icon>
                  <Maximize />
                </Icon>
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
            </ChatBody>
            
            <BorderLine />
            <ChatInputContainer>
                <ProfileImageRound src={profilePic} alt="Profile" />
                <ChatInput type="text" placeholder="Your question" />
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
                <Icon>
                  <Settings />
                </Icon> 
                <Icon>
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
