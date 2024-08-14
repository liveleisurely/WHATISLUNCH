import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, TextField, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import AddRestaurant from './components/AddRestaurant';
import RestaurantList from './components/RestaurantList';
import DailyStatistics from './components/DailyStatistics'; 
import WeeklyStatistics from './components/WeeklyStatistics';
import MonthlyStatistics from './components/MonthlyStatistics';
import WeekdayStatistics from './components/WeekdayStatistics';
import GPTChat from './components/GPTChat';
import './App.css';
import logo from './logo.svg';
import lunchImage from './mukbang.jfif';
import lunchImage2 from './mukbang2.jfif';

export const StatsContext = createContext();

export const useStats = () => {
  return useContext(StatsContext);
};

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
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  return (
    <StatsContext.Provider value={stats}>
      {children}
    </StatsContext.Provider>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          onLogin(true);
          setLoginError('');
        } else {
          setLoginError('유효하지 않은 API 키입니다.');
        }
      } else {
        setLoginError('서버 오류가 발생했습니다.');
      }
    } catch (error) {
      setLoginError('로그인 요청 실패');
    }
  };

  return (
    <Dialog open={true} onClose={() => onLogin(false)}>
      <DialogTitle>관리자 로그인</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="API 키"
          type="password"
          fullWidth
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        {loginError && <Typography color="error">{loginError}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onLogin(false)} color="primary">
          취소
        </Button>
        <Button onClick={handleLogin} color="primary">
          로그인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const App = () => {
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [advancedRecommended, setAdvancedRecommended] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);  // 로그인 상태 추가
  const [openLoginDialog, setOpenLoginDialog] = useState(false); // 관리자 로그인 다이얼로그 상태 추가

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
      setTimeout(() => saveSelection(restaurant), 3000);
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
        const advancedRestaurant = response.data.data;
        if (advancedRestaurant) {
          setTimeout(() => {
            setAdvancedRecommended(advancedRestaurant);
            setRecommended(null);
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
      })
      .finally(() => {
        setOpenDialog(false);  // 다이얼로그 닫기
        setAdminApiKey('');    // API 키 초기화
      });
  }, [adminApiKey]);

  const resetTodayData = useCallback(() => {
    axios.delete(`http://10.10.52.39:3001/api/stats/reset/today?api_key=${adminApiKey}`)
      .then(response => {
        if (response.data.status === 'success') {
          alert('오늘 날짜의 통계가 초기화되었습니다.');
        } else {
          alert('통계 초기화에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error resetting today\'s stats:', error);
        alert('오늘 날짜의 통계 초기화에 실패했습니다.');
      })
      .finally(() => {
        setOpenDialog(false);  // 다이얼로그 닫기
        setAdminApiKey('');    // API 키 초기화
      });
  }, [adminApiKey]);

  const handleOpenDialog = (action) => {
    setOpenDialog(action);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogin = (loggedIn) => {
    setIsAdminLoggedIn(loggedIn);
    setOpenLoginDialog(false);  // 로그인 후 다이얼로그 닫기
  };

  return (
    <StatsProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={
            <Container 
              maxWidth="xxl" 
              className="main-container" 
              sx={{ 
                padding: '20px', 
                borderRadius: '8px', 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={12} md={5} style={{ overflowY: 'auto'}}>
                  <Box className="left-panel" sx={{ textAlign: 'center', padding: '10px', position: { md: 'fixed' }, width: { xs: '100%', sm: '80%', md: '30%' }, ml: { md: 10 } }}>
                    <img src={logo} alt="로고" className="logo" style={{ maxWidth: '70%', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <img src={lunchImage} alt="What is lunch?" style={{ width: '55%', height: '200px', marginBottom: '10px' }} />
                      <img src={lunchImage2} alt="What is lunch?" style={{ width: '55%', height: '200px', marginBottom: '10px' }} />
                    </div>
                    <Typography variant="h5" align="center" className="title" gutterBottom>
                      온택트 최대 난제: 오늘 점심 뭐먹지?
                    </Typography>
                    <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', gap: '10px' }}>
                      <Button variant="contained" color="primary" onClick={recommendRestaurant} style={{ width: '250px' }}>
                        오늘의 점심은? 랜덤뽑기!
                      </Button>
                    </Box>

                    <Paper elevation={3} className="recommendation" style={{ padding: '10px', minHeight: '100px' }}>
                      {loading ? (
                        <Typography variant="h5" align="center" className="loading-text">
                          오늘의 점심은....
                        </Typography>
                      ) : (
                        <>
                          {recommended ? (
                            <>
                              <Typography variant="h5" align="center" className="recommendation-name highlight">
                                {recommended[0]}
                              </Typography>
                              <Typography variant="body1" align="center" className="recommendation-menu">
                                회사와의 거리: {recommended[1]}m <br />
                                <strong style={{ fontSize: '18px' }}>{recommended[2]}</strong> <br />
                                가격대: {recommended[3]}
                              </Typography>
                            </>
                          ) : advancedRecommended ? (
                            <Typography variant="h5" align="center" className="recommendation-name highlight">
                              {advancedRecommended}
                            </Typography>
                          ) : (
                            <Typography variant="h6" align="center" color="textSecondary">
                              아직 추천 결과가 없습니다.
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>

                    {/* GPT 채팅창 추가 */}
                    <GPTChat />

                  </Box>
                </Grid>
                <Grid item xs={12} md={7} style={{ overflowY: 'auto', height: '150vh', marginLeft: 'auto' }}>
                  <Box className="right-panel" sx={{ width: { xs: '100%', md: '55%' }, position: { md: 'fixed' }, marginTop: { xs: '20px', md: '0' } }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '2px' }}>
                          <DailyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '2px' }}>
                          <WeeklyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '2px' }}>
                          <MonthlyStatistics />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '2px' }}>
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
                        { isAdminLoggedIn && ( 
                          <>
                            <Grid item style={{ width: '100%', maxWidth: '200px' }}>
                              <Button variant="contained" color="secondary" onClick={() => handleOpenDialog('today')} style={{ width: '100%' }}>
                                오늘 통계 리셋
                              </Button>
                            </Grid>
                            <Grid item style={{ width: '100%', maxWidth: '200px' }}>
                              <Button variant="contained" color="secondary" onClick={() => handleOpenDialog('all')} style={{ width: '100%' }}>
                                전체 통계 리셋
                              </Button>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
              {/* 관리자 로그인 버튼 */}
              {!isAdminLoggedIn && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenLoginDialog(true)}
                  style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1200 // 다이얼로그보다 높은 z-index
                  }}
                >
                  관리자 로그인
                </Button>
              )}
              {/* 관리자 API 키 입력 Dialog */}
              <Dialog open={openDialog !== false} onClose={handleCloseDialog}>
                <DialogTitle>관리자 API 키 입력</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="API 키"
                    type="password"
                    fullWidth
                    value={adminApiKey}
                    onChange={(e) => setAdminApiKey(e.target.value)}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog} color="primary">
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      if (openDialog === 'today') {
                        resetTodayData();
                      } else {
                        resetSavedData();
                      }
                    }}
                    color="primary"
                  >
                    확인
                  </Button>
                </DialogActions>
              </Dialog>
              {/* 관리자 로그인 다이얼로그 */}
              <Dialog open={openLoginDialog} onClose={() => setOpenLoginDialog(false)}>
                <AdminLogin onLogin={handleLogin} />
              </Dialog>
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
