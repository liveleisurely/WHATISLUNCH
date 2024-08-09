import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid } from '@mui/material';
import axios from 'axios';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/restaurants')
      .then(response => {
        setRestaurants(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const categorizedRestaurants = {
    '한식': [],
    '일식': [],
    '중식': [],
    '양식': [],
    '분식': [],
    '기타': []
  };

  restaurants.forEach(restaurant => {
    // Assume the 4th item in the restaurant array (index 3) is the category
    categorizedRestaurants[restaurant[4]].push({
      name: restaurant[0], // name
      menu: restaurant[2], // menu
      distance: restaurant[1], // distance
      category: restaurant[4], // category
    });
  });

  return (
    <Grid container spacing={3} style={{ marginTop: '40px' }}>
      {Object.keys(categorizedRestaurants).map(category => (
        <Grid item xs={12} sm={6} key={category} style={{ marginBottom: '40px' }}>
          <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 'bold' }}>
            {category}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: '#e0f7fa' }}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>가게명</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>주요메뉴</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>거리 (m)</TableCell>
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
