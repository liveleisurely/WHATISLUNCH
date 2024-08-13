import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper } from '@mui/material';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 필요한 스케일과 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyStatistics = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [title, setTitle] = useState('');

  useEffect(() => {
    let isMounted = true;

    axios.get('http://10.10.52.39:3001/api/stats/daily')
      .then(response => {
        const dailyData = response.data.data;
        setChartData({
          labels: dailyData.map(item => item[0]), // 레스토랑 이름
          datasets: [
            {
              label: '일별 선택 횟수',
              data: dailyData.map(item => item[1]), // 선택 횟수
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        });
        setTitle('일별 선택 통계');
      })
      .catch(error => console.error('Error fetching daily stats:', error));
  }, []);

  return (
    <Paper style={{ padding: '20px' }}>
      <h3>{title}</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title },
          },
        }}
      />
    </Paper>

  );

  return () => {
    isMounted = false;
  };
};

export default DailyStatistics;
