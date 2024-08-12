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
  const [stats, setStats] = useState([]); // 통계 데이터를 관리하는 상태

  // 레스토랑 데이터를 서버에서 가져오는 부분
  useEffect(() => {
    axios.get('http://10.10.52.39/:3001/restaurants')
      .then(response => {
        setRestaurants(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
      
  }, []);

  // 선택된 레스토랑을 저장하는 함수
  const saveSelection = (restaurant) => {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 저장
    const newEntry = { name: restaurant[0], date: currentDate, month: currentDate.slice(0, 7) };

    setStats(prevStats => [...prevStats, newEntry]); // 새로운 데이터를 stats에 추가
    localStorage.setItem('restaurantStats', JSON.stringify([...stats, newEntry])); // localStorage에 저장
  };

  // 추천 레스토랑을 서버에서 가져오는 부분
  const recommendRestaurant = () => {
    setLoading(true);
    axios.get('http://10.10.52.39:3001/recommend')
      .then(response => {
        const randomRestaurant = response.data.data;
        if (randomRestaurant) {
            console.log('Received data:', randomRestaurant);  // 데이터를 콘솔에 출력해서 확인
          // 2초간 로딩 상태를 유지한 후 데이터 표시
          setTimeout(() => {
            setRecommended(randomRestaurant);
            saveSelection(randomRestaurant); // 선택된 레스토랑 저장
            setLoading(false);
          }, 2000); // 2초 후에 로딩을 false로 설정
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

  // 새로운 레스토랑을 추가하는 함수
  const addRestaurant = (newRestaurant) => {
    const updatedRestaurant = {
      ...newRestaurant,
      distance: `${newRestaurant.distance.toLocaleString()}m`
    };
    setRestaurants([...restaurants, updatedRestaurant]);
  };

  // 저장된 통계 데이터를 리셋하는 함수
  const resetSavedData = () => {
    setStats([]); // 통계 데이터를 초기화
    localStorage.removeItem('restaurantStats'); // localStorage에서 데이터 삭제
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
              <Button variant="contained" color="secondary" onClick={resetSavedData} style={{ marginLeft: '20px', marginBottom: '20px' }}>
                통계 리셋
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

            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <Button variant="contained" color="primary" component={Link} to="/add">
                밥집 데이터 추가하기 (추후 구현)
              </Button>
              <Button variant="contained" color="secondary" component={Link} to="/list" style={{ marginLeft: '20px' }}>
                맛집 리스트 보기
              </Button>
            </Box>
            <br></br>
            <Statistics stats={stats} />
          </Container>
        } />
        <Route path="/add" element={<AddRestaurant addRestaurant={addRestaurant} />} />
        <Route path="/list" element={<RestaurantList restaurants={restaurants} />} />
      </Routes>
    </Router>
  );
};

export default App;
