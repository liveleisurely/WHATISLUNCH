import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';

const GPTChat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // 사용자가 입력한 메시지
    const userMessage = { sender: 'user', text: message };

    // 채팅 기록에 사용자의 메시지를 먼저 추가
    setChatHistory([...chatHistory, userMessage]);

    try {
      // 서버에 요청을 보내 GPT의 응답을 가져옴
      const response = await axios.post('http://10.10.52.39:3001/recommend/advanced', { 
        prompt: message,
        num_recommendations: 3  // 이 값은 원하는 추천 개수로 설정할 수 있습니다.
      });

      // 서버로부터 받은 GPT 응답 메시지
      const gptMessages = response.data.data;

      // GPT의 응답을 채팅 기록에 추가 (여러 개의 추천을 처리)
      const formattedGPTMessages = gptMessages.map((msg, index) => ({
        sender: 'gpt',
        text: `${index + 1}. ${msg}`  // 각 메시지를 번호로 구분
      }));

      setChatHistory(prevChatHistory => [...prevChatHistory, ...formattedGPTMessages]);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      const errorMessage = { sender: 'gpt', text: '죄송합니다. 현재 요청을 처리할 수 없습니다.' };
      setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
    }

    // 입력 필드 초기화
    setMessage('');
  };

  return (
    <Paper elevation={3} sx={{ padding: '10px', marginTop: '10px', maxWidth: '600px', margin: 'auto' }}>
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
