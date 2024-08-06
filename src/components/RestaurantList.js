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
    <Grid container spacing={3}>
      {Object.keys(categorizedRestaurants).map(category => (
        <Grid item xs={12} sm={6} key={category}>
          <Typography variant="h5" align="center" gutterBottom>
            {category}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>가게이름</TableCell>
                  <TableCell>주요메뉴</TableCell>
                  <TableCell>회사와의 거리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorizedRestaurants[category].map((restaurant, index) => (
                  <TableRow key={index}>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell>{restaurant.menu}</TableCell>
                    <TableCell>{restaurant.distance}</TableCell>
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
