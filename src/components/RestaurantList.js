import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid } from '@mui/material';

const RestaurantList = ({ restaurants }) => {
  const categorizedRestaurants = {
    '한식': [],
    '일식': [],
    '중식': [],
    '양식': [],
    '분식': [],
    '기타': []
  };

  restaurants.forEach(restaurant => {
    categorizedRestaurants[restaurant.category].push(restaurant);
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
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>가게이름</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>주요메뉴</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>회사와의 거리</TableCell>
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
