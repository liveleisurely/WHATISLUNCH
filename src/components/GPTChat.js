import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';

const GPTChat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);


  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // 사용자가 입력한 메시지
    const userMessage = { sender: 'user', text: message };

    // 채팅 기록에 사용자의 메시지를 먼저 추가
    setChatHistory([...chatHistory, userMessage]);

    try {
      // 서버에 요청을 보내 GPT의 응답을 가져옴
      const response = await axios.post('http://10.10.52.39:3001/recommend/advanced', { prompt: message });

      // 서버로부터 받은 GPT 응답 메시지
      const gptMessage = { sender: 'gpt', text: response.data.data };

      // GPT의 응답을 채팅 기록에 추가
      setChatHistory(prevChatHistory => [...prevChatHistory, gptMessage]);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      const errorMessage = { sender: 'gpt', text: '죄송합니다. 현재 요청을 처리할 수 없습니다.' };
      setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
    }

    // 입력 필드 초기화
    setMessage('');
  };

  return (
    <Paper elevation={3} sx={{ padding: '10px', marginTop: '10px', maxWidth: '600px', margin: 'auto', zIndex: 1 }}> 
      <Typography variant="h6" gutterBottom>
        GPT 3.5 기반 채팅
      </Typography>
      <div 
        style={{ 
          height: '150px', 
          overflowY: 'scroll', 
          marginBottom: '10px', 
          padding: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '4px'
        }}
      >
        {chatHistory.map((chat, index) => (
          <Typography 
            key={index} 
            align={chat.sender === 'user' ? 'right' : 'left'} 
            style={{ marginBottom: '5px' }}
          >
            <strong>{chat.sender === 'user' ? '나' : 'GPT'}:</strong> {chat.text}
          </Typography>
        ))}
      </div>
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        sx={{ marginBottom: '10px' }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        onClick={handleSendMessage}
      >
        보내기
      </Button>
    </Paper>
  );
};

export default GPTChat;
