import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import FileBase64 from 'react-file-base64';
import * as XLSX from 'xlsx';

const AddRestaurant = ({ addRestaurant }) => {
  const [formData, setFormData] = useState({
    name: '',
    menu: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRestaurant = {
      ...formData,
      distance: '0m',  // 임시 거리 값
      latitude: 0,     // 임시 위도 값
      longitude: 0,    // 임시 경도 값
      category: '기타' // 임시 카테고리 값
    };
    addRestaurant(newRestaurant);
    setFormData({ name: '', menu: '', address: '' });
  };

  const handleFileUpload = (file) => {
    const binaryStr = atob(file.base64.split(',')[1]);
    const wb = XLSX.read(binaryStr, { type: 'binary' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    data.slice(1).forEach(row => {
      const [name, menu, address] = row;
      const newRestaurant = {
        name,
        menu,
        address,
        distance: '0m',  // 임시 거리 값
        latitude: 0,     // 임시 위도 값
        longitude: 0,    // 임시 경도 값
        category: '기타' // 임시 카테고리 값
      };
      addRestaurant(newRestaurant);
    });
  };

  return (
    <Container maxWidth="md" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        밥집 데이터 추가하기
      </Typography>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <Box style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
          <TextField
            label="가게명"
            name="name"
            placeholder="ex) 홍콩반점"
            variant="outlined"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="주메뉴"
            name="menu"
            placeholder="ex) 짜장면"
            variant="outlined"
            fullWidth
            value={formData.menu}
            onChange={handleChange}
            required
          />
          <TextField
            label="가게 주소"
            name="address"
            placeholder="ex) 서울특별시 서대문구 이화여대길 50-5"
            variant="outlined"
            fullWidth
            value={formData.address}
            onChange={handleChange}
            required
          />
        </Box>
        <Button variant="contained" color="primary" type="submit">
          저장
        </Button>
      </form>
      <Typography variant="h5" align="center" gutterBottom style={{ marginTop: '40px' }}>
        엑셀 형태로 데이터 추가
      </Typography>
      <FileBase64
        multiple={false}
        onDone={handleFileUpload}
      />
      <a href="/restaurants.json" download>
        엑셀 템플릿 다운로드
      </a>
    </Container>
  );
};

export default AddRestaurant;
