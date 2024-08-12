import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, Grid, TextField } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';
import Statistics from './components/Statistics'; // 통계 컴포넌트 임포트
import './App.css';
import logo from './logo.svg';
import lunchImage from './mukbang.jfif'; // 점심 이미지 추가
import lunchImage2 from './mukbang2.jfif'; // 점심 이미지 추가

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [advancedPrompt, setAdvancedPrompt] = useState(''); // 고급 추천 프롬프트 상태 추가
  const [advancedRecommended, setAdvancedRecommended] = useState(null); // 고급 추천 결과 상태 추가

  useEffect(() => {
    axios.get('http://10.10.52.39:3001/restaurants')
      .then(response => {
        setRestaurants(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert("감히 우클릭을 할 수가 없음을 양해 바랍니다.");
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const saveSelection = async (restaurant) => {
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const userIp = ipResponse.data.ip;
    await axios.post('http://10.10.52.39:3001/log_recommendation', {
      user_ip: userIp,
      restaurant: restaurant[0],
    });
    setStats(stats => [...stats]);
  };

  const recommendRestaurant = () => {
    setLoading(true);
    axios.get('http://10.10.52.39:3001/recommend')
      .then(response => {
        const randomRestaurant = response.data.data;
        if (randomRestaurant) {
          setTimeout(() => {
            setRecommended(randomRestaurant);
            saveSelection(randomRestaurant);
            setLoading(false);
          }, 500);
        } else {
          console.error('No data received');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  const recommendAdvancedRestaurant = () => {
    setLoading(true);
    axios.post('http://10.10.52.39:3001/recommend/advanced', { prompt: advancedPrompt })
      .then(response => {
        const advancedRestaurant = response.data.data;
        if (advancedRestaurant) {
          setTimeout(() => {
            setAdvancedRecommended(advancedRestaurant);
            setLoading(false);
          }, 500);
        } else {
          console.error('No data received');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  const addRestaurant = (newRestaurant) => {
    const updatedRestaurant = {
      ...newRestaurant,
      distance: `${newRestaurant.distance.toLocaleString()}m`
    };
    setRestaurants([...restaurants, updatedRestaurant]);
  };

  const resetSavedData = () => {
    const adminApiKey = prompt("관리자 API 키를 입력하세요:");
    axios.delete(`http://10.10.52.39:3001/api/stats/reset?api_key=${adminApiKey}`)
      .then(response => {
        if (response.data.status === 'success') {
          alert('통계가 초기화되었습니다.');
          axios.get('http://10.10.52.39:3001/api/stats/daily')
            .then(response => setStats(response.data.data))
            .catch(error => console.error('Error fetching stats:', error));
        } else {
          alert('통계 초기화에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error resetting stats:', error);
        alert('통계 초기화에 실패했습니다.');
      });
  };

  return (
    <Router>
      <Container maxWidth="xl" className="main-container" sx={{ padding: '0 24px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box className="left-panel" sx={{ textAlign: 'center', padding: '20px', position: { md: 'fixed' }, width: { xs: '100%', md: '30%' } }}>
              <img src={logo} alt="로고" className="logo" style={{ maxWidth: '50%', marginBottom: '10px' }} />
              <br></br>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src={lunchImage} alt="What is lunch?" style={{ maxWidth: '60%', height: '180px', marginBottom: '10px' }} />
              <img src={lunchImage2} alt="What is lunch?" style={{ maxWidth: '60%', height: '180px', marginBottom: '10px' }} />
            </div>
              <Typography variant="h4" align="center" className="title" gutterBottom>
                오늘 점심은 뭐 먹지?
              </Typography>
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <Button variant="contained" color="primary" onClick={recommendRestaurant} style={{ marginBottom: '10px', width: '100%' }}>
                  오늘의 점심은?!
                </Button>
                <Button variant="contained" color="secondary" onClick={resetSavedData} style={{ marginBottom: '10px', width: '100%' }}>
                  통계 리셋
                </Button>
              </Box>
              {loading && (
                <Paper elevation={3} className="loading-container" style={{ padding: '10px', textAlign: 'center' }}>
                  <Typography variant="h5" align="center" className="loading-text">
                    오늘의 점심은....
                  </Typography>
                </Paper>
              )}
              {recommended && !loading && (
                <Paper elevation={3} className="recommendation" style={{ padding: '10px' }}>
                  <Typography variant="h5" align="center" className="recommendation-name highlight">
                    {recommended[0]} {/* name */}
                  </Typography>
                  <Typography variant="body1" align="center" className="recommendation-menu">
                    회사와의 거리: {recommended[1]}m {/* dist */}
                    <br />
                    <strong style={{ fontSize: '18px' }}>{recommended[2]}</strong> {/* menu */}
                    <br />
                    가격대: {recommended[3]} {/* price_range */}
                  </Typography>
                </Paper>
              )}
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <TextField 
                  value={advancedPrompt} 
                  onChange={(e) => setAdvancedPrompt(e.target.value)} 
                  placeholder="원하는 메뉴나 조건을 입력하세요" 
                  fullWidth 
                  style={{ marginBottom: '10px' }}
                />
                <Button variant="contained" color="primary" onClick={recommendAdvancedRestaurant} style={{ width: '100%' }}>
                  오늘의 점심은? (고급)
                </Button>
              </Box>
              {advancedRecommended && !loading && (
                <Paper elevation={3} className="recommendation" style={{ padding: '20px' }}>
                  <Typography variant="h5" align="center" className="recommendation-name highlight">
                    {advancedRecommended}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={7} style={{ overflowY: 'auto', height: '100vh', marginLeft: 'auto' }}>
            <Box className="right-panel" sx={{ padding: '20px' }}>
              <Statistics stats={stats} />
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Routes>
        <Route path="/add" element={<AddRestaurant addRestaurant={addRestaurant} />} />
        <Route path="/list" element={<RestaurantList restaurants={restaurants} />} />
      </Routes>
    </Router>
  );
};

export default App;
