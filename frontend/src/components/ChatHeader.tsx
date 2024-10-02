import React from 'react';
import { ChatHeader as StyledChatHeader, IconContainer, Icon } from '../styles/StyledComponents';
import { ReactComponent as Maximize } from '../assets/maximize-2.svg';
import { ReactComponent as Minimize } from '../assets/minimize-2.svg';
import { ReactComponent as Sidebar } from '../assets/sidebar.svg';
import { ReactComponent as XIcon } from '../assets/x.svg';

interface ChatHeaderProps {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  toggleChat: () => void;
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isFullScreen, toggleFullScreen, toggleChat, isMobile }) => (
  <StyledChatHeader>
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
      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      <XIcon />
    </Icon>
  </StyledChatHeader>
);

export default ChatHeader;