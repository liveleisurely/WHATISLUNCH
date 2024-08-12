import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid } from '@mui/material';
import axios from 'axios';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios.get('http://10.10.52.39:3001/restaurants')
      .then(response => {
        setRestaurants(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // 데이터를 카테고리별로 분류하는 로직
  const categorizedRestaurants = {};
  restaurants.forEach(restaurant => {
    const category = restaurant[4]; // 카테고리 정보는 배열의 5번째 원소(인덱스 4)
    if (!categorizedRestaurants[category]) {
      categorizedRestaurants[category] = [];
    }
    categorizedRestaurants[category].push({
      name: restaurant[0], // 가게명
      menu: restaurant[2], // 메뉴
      distance: `${restaurant[1]}m` // 거리
    });
  });

  return (
    <Grid container spacing={3} style={{ marginTop: '40px' }}>
      {Object.keys(categorizedRestaurants).map(category => (
        <Grid item xs={12} sm={6} key={category}>
          <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 'bold' }}>
            {category}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: '#e0f7fa' }}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>가게명</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>주요메뉴</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>거리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorizedRestaurants[category].map((restaurant, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{restaurant.name}</TableCell>
                    <TableCell align="center">{restaurant.menu}</TableCell>
                    <TableCell align="center">{restaurant.distance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ))}
    </Grid>
  );
};

export default RestaurantList;
