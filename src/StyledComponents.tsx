import styled from '@emotion/styled';
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
  height: 700px;
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
    border-radius: 0;
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
  padding: 15px;
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
    // width: 12px;
    // height: 12px;
    }
`;  

export const FooterText = styled.div`
  display: flex;
  align-items: center;
`;

