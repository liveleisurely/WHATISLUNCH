import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, Grid, useMediaQuery, createTheme, ThemeProvider } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';
import './App.css';
import logo from './logo.svg';

const theme = createTheme();

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

  const recommendRestaurant = () => {
    setLoading(true);
    setTimeout(() => {
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      setRecommended(randomRestaurant);
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

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert("어디서 감히 오른쪽 클릭을!");
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route exact path="/" element={
            <Container maxWidth="md" className="main-container">
              <Grid container alignItems="center" className="header">
                <Grid item xs={12} sm={3} className="logo-container">
                  <img src={logo} alt="로고" className="logo" />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="h3" align={isSmallScreen ? 'center' : 'left'} className="title" gutterBottom>
                    온택트헬스 최대 난제:
                    <br />
                    오늘 점심은 뭐 먹지?
                  </Typography>
                </Grid>
              </Grid>
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
                    {recommended.distance}
                    <br />
                    {recommended.menu}
                    <br />
                    가격대: {recommended.price_range}
                  </Typography>
                </Paper>
              )}
              <Typography variant="h4" align="center" gutterBottom className="category-title" style={{ marginTop: '40px' }}>
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
    </ThemeProvider>
  );
};

export default App;
