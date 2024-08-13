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
    const intervalId = setInterval(() => {
      fetchStats();
    }, 5000); // 5초마다 통계 데이터를 갱신
  
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 제거
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
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const userIp = ipResponse.data.ip;
      await axios.post('http://10.10.52.39:3001/log_recommendation', {
        user_ip: userIp,
        restaurant: restaurant[0],
        timeout: 3000
      });
    } catch (error) {
      console.error('Error saving selection:', error);
      // 에러 발생 시 재시도 로직 추가
      setTimeout(() => saveSelection(restaurant), 3000); // 3초 후에 재시도
    }
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
        console.log(response.data)
        const advancedRestaurant = response.data.data;
        if (advancedRestaurant) {
          setTimeout(() => {
            setAdvancedRecommended(advancedRestaurant); // 응답을 advancedRecommended에 저장
            setRecommended(null); // 기본 추천 결과를 초기화
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
            <Container 
            maxWidth="xxl" 
            className="main-container" 
            sx={{ 
              padding: { xs: '10px', md: '20px' }, 
              borderRadius: '8px', 
              minHeight: '100vh', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center' 
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} md={5}>
                <Box 
                  className="left-panel" 
                  sx={{ 
                    textAlign: 'center', 
                    padding: { xs: '10px', md: '10px' }, 
                    width: { xs: '100%', sm: '80%', md: '30%' }, 
                    ml: { md: 10 },
                    position: { md: 'fixed', xs: 'relative' } // 모바일에서는 상대 위치로 변경
                  }}
                >
                  {/* 로고 및 이미지 */}
                  <img src={logo} alt="로고" className="logo" style={{ maxWidth: '70%', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <img src={lunchImage} alt="What is lunch?" style={{ width: '45%', height: '150px', marginBottom: '10px' }} />
                    <img src={lunchImage2} alt="What is lunch?" style={{ width: '45%', height: '150px', marginBottom: '10px' }} />
                  </div>
                  {/* 텍스트 및 버튼 */}
                  <Typography variant="h5" align="center" className="title" gutterBottom>
                    온택트 최대 난제: 오늘 점심 뭐먹지?
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, // 모바일에서는 세로 정렬
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: '15px', 
                      gap: '10px' 
                    }}
                  >
                    <Button variant="contained" color="primary" onClick={recommendRestaurant} sx={{ width: '100%', maxWidth: '250px' }}>
                      오늘의 점심은?<br/>랜덤뽑기!
                    </Button>
                    <Button variant="contained" color="secondary" onClick={recommendAdvancedRestaurant} sx={{ width: '100%', maxWidth: '250px' }}>
                      조건부<br/>오늘의 점심은?!
                    </Button>
                  </Box>
                  {/* 입력 필드 */}
                  <TextField 
                    value={advancedPrompt} 
                    onChange={(e) => setAdvancedPrompt(e.target.value)} 
                    placeholder="원하는 메뉴나 조건을 입력하세요" 
                    fullWidth 
                    sx={{ marginBottom: '20px' }}
                  />
                  {/* 추천 결과 */}
                  <Paper elevation={3} className="recommendation" sx={{ padding: '10px', minHeight: '100px' }}>
                    {loading ? (
                      <Typography variant="h5" align="center" className="loading-text">
                        오늘의 점심은....
                      </Typography>
                    ) : (
                      <>
                        {recommended ? (
                          <>
                            <Typography variant="h5" align="center" className="recommendation-name highlight">
                              {recommended[0]} {/* 일반 추천 결과: 가게 이름 */}
                            </Typography>
                            <Typography variant="body1" align="center" className="recommendation-menu">
                              회사와의 거리: {recommended[1]}m {/* 거리 */}
                              <br />
                              <strong style={{ fontSize: '18px' }}>{recommended[2]}</strong> {/* 메뉴 */}
                              <br />
                              가격대: {recommended[3]} {/* 가격대 */}
                            </Typography>
                          </>
                        ) : advancedRecommended ? (
                          <Typography variant="h5" align="center" className="recommendation-name highlight">
                            {advancedRecommended} {/* 고급 추천 결과 텍스트 그대로 표시 */}
                          </Typography>
                        ) : (
                          <Typography variant="h6" align="center" color="textSecondary">
                            아직 추천 결과가 없습니다.
                          </Typography>
                        )}
                      </>
                    )}
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} md={7} sx={{ overflowY: 'auto', height: { md: '150vh', xs: 'auto' }, marginLeft: 'auto' }}>
                <Box className="right-panel" sx={{ width: '100%', maxWidth: { xs: '100%', md: '55%' }, marginTop: { xs: '20px', md: '0' } }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} >
                      <Paper sx={{ padding: '2px' }}>
                        <DailyStatistics />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} >
                      <Paper sx={{ padding: '2px' }}>
                        <WeeklyStatistics />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} >
                      <Paper sx={{ padding: '2px' }}>
                        <MonthlyStatistics />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} >
                      <Paper sx={{ padding: '2px' }}>
                        <WeekdayStatistics />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} container spacing={2} justifyContent="center">
                      <Grid item sx={{ width: '100%', maxWidth: '200px' }}>
                        <Button variant="contained" color="primary" component={Link} to="/list" sx={{ width: '100%' }}>
                          맛집 리스트 보기
                        </Button>
                      </Grid>
                      <Grid item sx={{ width: '100%', maxWidth: '200px' }}>
                        <Button variant="contained" color="secondary" component={Link} to="/add" sx={{ width: '100%' }}>
                          밥집 데이터 추가하기
                        </Button>
                      </Grid>
                      <Grid item sx={{ width: '100%', maxWidth: '200px' }}>
                        <Button variant="contained" color="secondary" onClick={resetSavedData} sx={{ width: '100%' }}>
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
