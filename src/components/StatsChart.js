import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper } from '@mui/material';

const StatsChart = ({ title, labels, datasets, indexAxis = 'x' }) => {
  const chartData = useMemo(() => ({
    labels,
    datasets,
  }), [labels, datasets]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
    },
    indexAxis,
  }), [title, indexAxis]);

  return (
    <Paper style={{ padding: '20px' }}>
      <h3>{title}</h3>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};

export default StatsChart;
