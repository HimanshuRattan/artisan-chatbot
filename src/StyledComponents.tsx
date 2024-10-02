import styled from '@emotion/styled';
import { keyframes } from '@emotion/react'; 
import { motion } from 'framer-motion';

export const WidgetButton = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #8442FF;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

export const ChatWindow = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 400px;
  height: 80%;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 20px;
  }
`;

export const ChatHeader = styled.div`
  background-color: #fff;
  padding: 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`;

export const ChatInput = styled.input`
  width: 100%;
  padding: 15px;
  border: none;

  &:focus {
    outline: none; // Ensure there's no outline on focus
  }
`;

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  color: #A9A9A9;
`;

export const Icon = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const IntroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 10px 0;
`;

export const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
`;

export const Greeting = styled.h2`
  margin: 0;
`;

export const WaveImage = styled.img`
  width: 20px;
  height: 20px; 
  vertical-align: middle;
`;

export const AskAnything = styled.p`
  margin: 0;
  color: gray;
`;

export const ChatInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 15px;
`;

export const ProfileImageRound = styled.img`
  width: 30px;
  height: 30px; 
  border-radius: 50%;
`;

export const BorderLine = styled.div`
  width: 90%;
  height: 1px;
  background-color: #D3D3D3; 
  margin: 5px auto;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 6px 20px 6px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: white;
  appearance: none;
  cursor: pointer;
  background-color: #e8e8e8; 
  margin-left: 10px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const SelectWrapper = styled.div`
    position: relative;
    margin-left: 10px;

    svg {
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    }
`;  

export const FooterText = styled.div`
  display: flex;
  align-items: center;
`;


export const MessageContainer = styled.div<{ role: string }>`
  display: flex;
  flex-direction: ${props => props.role === 'user' ? 'row-reverse' : 'row'};
  margin-bottom: 10px;
  margin-top: 30px;
`;

export const MessageBubble = styled.div<{ role: string }>`
  background-color: ${props => props.role === 'user' ? '#8E2DE2' : '#F5F5F5'};
  color: ${props => props.role === 'user' ? 'white' : 'black'};
  border-radius: ${props => props.role === 'user' ? '18px 2px 18px 18px' : '2px 18px 18px 18px'};
  padding: 10px 15px;
  max-width: 70%;
  word-wrap: break-word;
`;

export const MessageContent = styled.p`
  margin: 0;
  font-size: 14px;
`;

export const AssistantProfilePic = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const Tooltip = styled.div<{ content: string }>`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: "${props => props.content}";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;


export const HoverActionsContainer = styled.div`
  transition: all 5s ease-in-out;
`;

export const PromptContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  position: relative;
  left: 40px;
  width: 80%
`;

export const PromptButton = styled.button`
  background-color: #fff;
  border: 1px solid #8E2DE2;
  color: #8E2DE2;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #8E2DE2;
    color: #fff;
  }
`;

export const EditInput = styled.input`
  width: 80%;
  padding: 15px;
  border: none;
  color: #fff;
  background-color: #8E2DE2;


  &:focus {
    outline: none;
  }
`;


export const DeletedMessageBubble = styled.div`
  background-color: #f0f0f0;
  color: #888;
  padding: 10px 15px;
  border-radius: 18px;
  font-style: italic;
  max-width: 80%;
  margin: 5px 0;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
`;

const loadingAnimation = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
`;

export const LoadingIndicator = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;

  div {
    width: 8px;
    height: 8px;
    margin: 0 2px;
    background-color: ${props => props.theme === 'user' ? '#fff' : '#8E2DE2'};
    border-radius: 50%;
    display: inline-block;
    animation: ${loadingAnimation} 1.4s infinite ease-in-out both;

    &:nth-of-type(1) {
      animation-delay: -0.32s;
    }

    &:nth-of-type(2) {
      animation-delay: -0.16s;
    }
  }
`;