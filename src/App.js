import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';
import Statistics from './components/Statistics'; // 통계 컴포넌트 임포트
import './App.css';
import logo from './logo.svg';

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/restaurants.json')
      .then(response => {
        const updatedRestaurants = response.data.restaurants.map(restaurant => ({
          ...restaurant,
          distance: `${restaurant.distance.toLocaleString()}m`
        }));
        setRestaurants(updatedRestaurants);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const saveSelection = (restaurant) => {
    const savedData = JSON.parse(localStorage.getItem('restaurantStats')) || [];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 0부터 시작하므로 +1
    const weekNumber = Math.ceil(currentDate.getDate() / 7);
    const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  
    const newEntry = {
      date: date,
      name: restaurant.name,
      month: `${year}-${month}`, // YYYY-MM 형식으로 월 저장
      week: `${year}-${month}-${weekNumber}주차`, // YYYY-MM-주차 형식으로 주차 저장
    };
  
    savedData.push(newEntry);
    localStorage.setItem('restaurantStats', JSON.stringify(savedData));
  };
  

  const recommendRestaurant = () => {
    setLoading(true);
    setTimeout(() => {
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      setRecommended(randomRestaurant);
      saveSelection(randomRestaurant); // 선택된 레스토랑 저장
      setLoading(false);
    }, 3000); // 3초 지연
  };

  const addRestaurant = (newRestaurant) => {
    const updatedRestaurant = {
      ...newRestaurant,
      distance: `${newRestaurant.distance.toLocaleString()}m`
    };
    setRestaurants([...restaurants, updatedRestaurant]);
  };

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={
          <Container maxWidth="md" className="main-container">
            <Box className="header">
              <img src={logo} alt="로고" className="logo" />
              <Typography variant="h3" align="center" className="title" gutterBottom>
                온택트헬스 최대 난제:
                <br />
                오늘 점심은 뭐 먹지?
              </Typography>
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Button variant="contained" color="primary" onClick={recommendRestaurant} style={{ marginBottom: '20px' }}>
                오늘의 점심은?!
              </Button>
            </Box>
            {loading && (
              <Paper elevation={3} className="loading-container">
                <Typography variant="h5" align="center" className="loading-text">
                  오늘의 점심은....
                </Typography>
              </Paper>
            )}
            {recommended && !loading && (
              <Paper elevation={3} className="recommendation">
                <Typography variant="h5" align="center" className="recommendation-name highlight">
                  {recommended.name}
                </Typography>
                <Typography variant="body1" align="center" className="recommendation-menu">
                  회사와의 거리: {recommended.distance}
                  <br />
                  <strong>{recommended.menu}</strong>
                  <br />
                  가격대: {recommended.price_range}
                </Typography>
              </Paper>
            )}
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <Button variant="contained" color="primary" component={Link} to="/add">
                밥집 데이터 추가하기 (추후 구현)
              </Button>
              <Button variant="contained" color="secondary" component={Link} to="/list" style={{ marginLeft: '20px' }}>
                맛집 리스트 보기
              </Button>
            </Box>
            <Statistics /> {/* 통계 컴포넌트를 추가 */}
          </Container>
        } />
        <Route path="/add" element={<AddRestaurant addRestaurant={addRestaurant} />} />
        <Route path="/list" element={<RestaurantList restaurants={restaurants} />} />
      </Routes>
    </Router>
  );
};

export default App;
