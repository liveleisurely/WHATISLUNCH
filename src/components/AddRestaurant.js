import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import FileBase64 from 'react-file-base64';
import * as XLSX from 'xlsx';
import axios from 'axios';

const AddRestaurant = ({ addRestaurant }) => {
  const [formData, setFormData] = useState({
    name: '',
    menu: '',
    address: '',
    category: '기타'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (event, newCategory) => {
    setFormData({
      ...formData,
      category: newCategory || formData.category
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://10.10.52.39:5000/add_restaurant', formData);
      addRestaurant(response.data);
      setFormData({ name: '', menu: '', address: '', category: '기타' });
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  const handleFileUpload = (file) => {
    const binaryStr = atob(file.base64.split(',')[1]);
    const wb = XLSX.read(binaryStr, { type: 'binary' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    data.slice(1).forEach(async (row) => {
      const [name, menu, address, category] = row;
      const newRestaurant = {
        name,
        menu,
        address,
        category: category || '기타'
      };
      try {
        await axios.post('http://10.10.52.39:5000/add_restaurant', newRestaurant);
      } catch (error) {
        console.error('Error adding restaurant from file:', error);
      }
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
        <ToggleButtonGroup
          value={formData.category}
          exclusive
          onChange={handleCategoryChange}
          aria-label="음식 카테고리"
          style={{ marginTop: '20px', marginBottom: '20px' }}
        >
          <ToggleButton value="한식">한식</ToggleButton>
          <ToggleButton value="일식">일식</ToggleButton>
          <ToggleButton value="중식">중식</ToggleButton>
          <ToggleButton value="양식">양식</ToggleButton>
          <ToggleButton value="분식">분식</ToggleButton>
          <ToggleButton value="기타">기타</ToggleButton>
        </ToggleButtonGroup>
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
      <Button variant="contained" color="primary" href="http://10.10.52.39:5000/download_template" download>
        엑셀 템플릿 다운로드
      </Button>
    </Container>
  );
};

export default AddRestaurant;
