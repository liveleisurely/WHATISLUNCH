import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [recommended, setRecommended] = useState(null);

  useEffect(() => {
    const localData = localStorage.getItem('restaurants');
    if (localData) {
      setRestaurants(JSON.parse(localData));
    } else {
      axios.get('/restaurants.json')
        .then(response => {
          setRestaurants(response.data.restaurants);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  const recommendRestaurant = () => {
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    setRecommended(randomRestaurant);
  };

  const addRestaurant = (newRestaurant) => {
    setRestaurants([...restaurants, newRestaurant]);
  };

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={
          <Container maxWidth="md" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <Typography variant="h3" align="center" gutterBottom>
              오늘 점심은?
            </Typography>
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Button variant="contained" color="primary" onClick={recommendRestaurant} style={{ marginBottom: '20px' }}>
                오늘의 점심은?!
              </Button>
            </Box>
            {recommended && (
              <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
                {recommended.name} - {recommended.menu}
              </Typography>
            )}
            <Typography variant="h4" align="center" gutterBottom>
              맛집 리스트
            </Typography>
            <RestaurantList restaurants={restaurants} />
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <Button variant="contained" color="primary" component={Link} to="/add">
                밥집 데이터 추가하기
              </Button>
            </Box>
          </Container>
        } />
        <Route path="/add" element={<AddRestaurant addRestaurant={addRestaurant} />} />
      </Routes>
    </Router>
  );
};

export default App;
