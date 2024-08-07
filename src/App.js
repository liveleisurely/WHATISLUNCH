import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';

const companyLat = 37.559518;
const companyLon = 126.9479577;

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371.0; // 지구 반지름 (km)
  const toRadians = angle => (angle * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = R * c;
  const distanceM = distanceKm * 1000; // 미터 단위로 변환
  return distanceM;
};

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
          const updatedRestaurants = response.data.restaurants.map(restaurant => ({
            ...restaurant,
            distance: `${Math.round(haversine(companyLat, companyLon, restaurant.latitude, restaurant.longitude))}m`
          }));
          setRestaurants(updatedRestaurants);
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
    const updatedRestaurant = {
      ...newRestaurant,
      distance: `${Math.round(haversine(companyLat, companyLon, newRestaurant.latitude, newRestaurant.longitude))}m`
    };
    setRestaurants([...restaurants, updatedRestaurant]);
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
