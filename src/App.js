import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, TextField, Paper } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';
import DailyStatistics from './components/DailyStatistics'; 
import WeeklyStatistics from './components/WeeklyStatistics';
import MonthlyStatistics from './components/MonthlyStatistics';
import WeekdayStatistics from './components/WeekdayStatistics'; 
import './App.css';
import logo from './logo.svg';
import lunchImage from './mukbang.jfif';
import lunchImage2 from './mukbang2.jfif';

// Context 생성
export const StatsContext = createContext(); // export 추가

// Custom Hook for using stats
export const useStats = () => { // export 추가
  return useContext(StatsContext);
};

// Context Provider
const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    weekday: []
  });

  const fetchStats = useCallback(() => {
    const fetchDaily = axios.get('http://10.10.52.39:3001/api/stats/daily');
    const fetchWeekly = axios.get('http://10.10.52.39:3001/api/stats/weekly');
    const fetchMonthly = axios.get('http://10.10.52.39:3001/api/stats/monthly');
    const fetchWeekday = axios.get('http://10.10.52.39:3001/api/stats/weekday');

    Promise.all([fetchDaily, fetchWeekly, fetchMonthly, fetchWeekday])
      .then(([dailyRes, weeklyRes, monthlyRes, weekdayRes]) => {
        setStats({
          daily: dailyRes.data.data,
          weekly: weeklyRes.data.data,
          monthly: monthlyRes.data.data,
          weekday: weekdayRes.data.data
        });
      })
      .catch(error => console.error('Error fetching stats:', error));
  }, []);

  useEffect(() => {
    fetchStats();
    console.log('Stats fetched:', stats);
  }, [fetchStats]);

  return (
    <StatsContext.Provider value={stats}>
      {children}
    </StatsContext.Provider>
  );
};

const App = () => {
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advancedPrompt, setAdvancedPrompt] = useState(''); 
  const [advancedRecommended, setAdvancedRecommended] = useState(null);

  const saveSelection = useCallback(async (restaurant) => {
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const userIp = ipResponse.data.ip;
    await axios.post('http://10.10.52.39:3001/log_recommendation', {
      user_ip: userIp,
      restaurant: restaurant[0],
    });
  }, []);

  const recommendRestaurant = useCallback(() => {
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
  }, [saveSelection]);

  const recommendAdvancedRestaurant = useCallback(() => {
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
  }, [advancedPrompt]);

  const resetSavedData = useCallback(() => {
    const adminApiKey = prompt("관리자 API 키를 입력하세요:");
    axios.delete(`http://10.10.52.39:3001/api/stats/reset?api_key=${adminApiKey}`)
      .then(response => {
        if (response.data.status === 'success') {
          alert('통계가 초기화되었습니다.');
        } else {
          alert('통계 초기화에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error resetting stats:', error);
        alert('통계 초기화에 실패했습니다.');
      });
  }, []);

  return (
    <StatsProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={
            <Container maxWidth="xxl" className="main-container" sx={{ padding: '0 24px' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box className="left-panel" sx={{ textAlign: 'center', padding: '20px', position: { md: 'fixed' }, width: { xs: '100%', md: '35%' } }}>
                    <img src={logo} alt="로고" className="logo" style={{ maxWidth: '80%', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <img src={lunchImage} alt="What is lunch?" style={{ width: '55%', height: '200px', marginBottom: '10px' }} />
                      <img src={lunchImage2} alt="What is lunch?" style={{ width: '55%', height: '200px', marginBottom: '10px' }} />
                    </div>
                    <Typography variant="h4" align="center" className="title" gutterBottom>
                      온택트 최대 난제: 오늘 점심 뭐먹지?
                    </Typography>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                      <Button variant="contained" color="primary" onClick={recommendRestaurant} style={{ marginBottom: '10px', width: '100%' }}>
                        오늘의 점심은?!
                      </Button>
                    </Box>
                    {loading && (
                      <Paper elevation={3} className="loading-container" style={{ padding: '20px', textAlign: 'center' }}>
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
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                      <TextField 
                        value={advancedPrompt} 
                        onChange={(e) => setAdvancedPrompt(e.target.value)} 
                        placeholder="원하는 메뉴나 조건을 입력하세요" 
                        fullWidth 
                        style={{ marginBottom: '10px' }}
                      />
                      <Button variant="contained" color="secondary" onClick={recommendAdvancedRestaurant} style={{ width: '100%' }}>
                        오늘의 점심은? (고급)
                      </Button>
                    </Box>
                    {advancedRecommended && !loading && (
                      <Paper elevation={3} className="recommendation" style={{ padding: '20px' }}>
                        <Typography variant="body" align="center" className="recommendation-name highlight">
                          {advancedRecommended}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={7} style={{ overflowY: 'auto', height: '150vh', marginLeft: 'auto' }}>
                  <Box className="right-panel" sx={{ width: '100%' }}>
                    <Grid container spacing={5}>
                      <Grid item xs={6}>
                        <Paper style={{ padding: '5px' }}>
                          <DailyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper style={{ padding: '5px' }}>
                          <WeeklyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper style={{ padding: '5px' }}>
                          <MonthlyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper style={{ padding: '5px' }}>
                          <WeekdayStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} container spacing={2} justifyContent="center">
                        <Grid item style={{ width: '100%', maxWidth: '200px' }}>
                          <Button variant="contained" color="primary" component={Link} to="/list" style={{ width: '100%' }}>
                            맛집 리스트 보기
                          </Button>
                        </Grid>
                        <Grid item style={{ width: '100%', maxWidth: '200px' }}>
                          <Button variant="contained" color="secondary" component={Link} to="/add" style={{ width: '100%' }}>
                            밥집 데이터 추가하기
                          </Button>
                        </Grid>
                        <Grid item style={{ width: '100%', maxWidth: '200px' }}>
                          <Button variant="contained" color="secondary" onClick={resetSavedData} style={{ width: '100%' }}>
                            통계 리셋
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Container>
          } />
          <Route path="/list" element={<RestaurantList />} />
          <Route path="/add" element={<AddRestaurant />} />
        </Routes>
      </Router>
    </StatsProvider>
  );
};

export default App;
