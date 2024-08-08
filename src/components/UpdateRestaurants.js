import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, TextField, Box } from '@mui/material';
import axios from 'axios';

const UpdateRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleChange = (e) => {
    setSelectedRestaurant({
      ...selectedRestaurant,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.post('http://localhost:5000/update_restaurant', selectedRestaurant);
      fetchRestaurants();
      setSelectedRestaurant(null);
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  return (
    <Container maxWidth="md" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        레스토랑 데이터 업데이트
      </Typography>
      <Box>
        <Typography variant="h6" gutterBottom>
          레스토랑 목록:
        </Typography>
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant.id} onClick={() => handleSelectRestaurant(restaurant)}>
              {restaurant.name}
            </li>
          ))}
        </ul>
      </Box>
      {selectedRestaurant && (
        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            label="가게 이름"
            name="name"
            value={selectedRestaurant.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="주 메뉴"
            name="menu"
            value={selectedRestaurant.menu}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="카테고리"
            name="category"
            value={selectedRestaurant.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="가격대"
            name="price_range"
            value={selectedRestaurant.price_range || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="주소"
            name="address"
            value={selectedRestaurant.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="위도"
            name="latitude"
            value={selectedRestaurant.latitude || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="경도"
            name="longitude"
            value={selectedRestaurant.longitude || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="거리"
            name="distance"
            value={selectedRestaurant.distance || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleUpdate} style={{ marginTop: '20px' }}>
            업데이트
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default UpdateRestaurants;
