import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Grid, Paper } from '@mui/material';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = (stats) => {
  const [dailyChartData, setDailyChartData] = useState({ labels: [], datasets: [] });
  const [weeklyChartData, setWeeklyChartData] = useState({ labels: [], datasets: [] });
  const [monthlyChartData, setMonthlyChartData] = useState({ labels: [], datasets: [] });
  const [weekdayChartData, setWeekdayChartData] = useState({ labels: [], datasets: [] });
  const [titles, setTitles] = useState({
    dailyTitle: '',
    weeklyTitle: '',
    monthlyTitle: '',
    weekdayTitle: '',
  });

  

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const weekNumber = Math.ceil(date / 7);

    // Fetch Daily Stats
    axios.get('http://10.10.52.39:3001/api/stats/daily')
        .then(response => {
            const dailyData = response.data.data;
            setDailyChartData({
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
            setTitles(prev => ({
                ...prev,
                dailyTitle: `${year}년 ${month}월 ${date}일 오늘의 선택 통계`
            }));
        })
        .catch(error => console.error('Error fetching daily stats:', error));

    // Fetch Weekly Stats

    // Fetch Weekly Stats
    axios.get('http://10.10.52.39:3001/api/stats/weekly')
    .then(response => {
      const weeklyData = response.data.data;
  
      const weeks = ["1주차", "2주차", "3주차", "4주차"];
      const datasets = [];
  
      weeks.forEach((weekName, index) => {
        const weekData = weeklyData.filter(item => item[1] === index + 2);
        const top3 = weekData.slice(0, 3);
  
        top3.forEach(([month, week_of_month, restaurant, count], i) => {
          if (!datasets[i]) {
            datasets[i] = {
              label: `Top ${i + 1}`,
              data: Array(weeks.length).fill(0),
              backgroundColor: `rgba(54, 162, 235, ${0.2 + i * 0.1})`,
              borderColor: `rgba(54, 162, 235, 1)`,
              borderWidth: 1,
            };
          }
          datasets[i].data[index] = count;
          datasets[i].label = `${restaurant} (${count}회)`;
        });
      });
  
      setWeeklyChartData({
        labels: weeks,
        datasets,
      });
      setTitles(prev => ({
        ...prev,
        weeklyTitle: `${year}년 ${month}월 주차별 선택 통계`
      }));
    })
    .catch(error => console.error('Error fetching weekly stats:', error));


    // Fetch Monthly Stats
    axios.get('http://10.10.52.39:3001/api/stats/monthly')
        .then(response => {
            const monthlyData = response.data.data;
            const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
            const datasets = [];

            months.forEach((monthName, index) => {
                const monthData = monthlyData.filter(item => item[0] === index + 1);
                const top3 = monthData.slice(0, 3);

                top3.forEach(([month, restaurant, count], i) => {
                    if (!datasets[i]) {
                        datasets[i] = {
                            label: `Top ${i + 1}`,
                            data: Array(months.length).fill(0),
                            backgroundColor: `rgba(75, 192, 192, ${0.2 + i * 0.1})`,
                            borderColor: `rgba(75, 192, 192, 1)`,
                            borderWidth: 1,
                        };
                    }
                    datasets[i].data[index] = count;
                    datasets[i].label = `${restaurant} (${count}회)`;
                });
            });

            setMonthlyChartData({
                labels: months,
                datasets,
            });
            setTitles(prev => ({
                ...prev,
                monthlyTitle: `${year}년 월별 선택 통계`
            }));
        })
        .catch(error => console.error('Error fetching monthly stats:', error));

    // Fetch Weekday Stats
    axios.get('http://10.10.52.39:3001/api/stats/weekday')
        .then(response => {
            const weekdayData = response.data.data;
            const weekdays = ["월요일", "화요일", "수요일", "목요일", "금요일"];
            const datasets = [];

            weekdays.forEach((dayName, index) => {
                const dayData = weekdayData.filter(item => item[0] === index + 2);
                const top3 = dayData.slice(0, 3);

                top3.forEach(([weekday, restaurant, count], i) => {
                    if (!datasets[i]) {
                        datasets[i] = {
                            label: `Top ${i + 1}`,
                            data: Array(weekdays.length).fill(0),
                            backgroundColor: `rgba(153, 102, 255, ${0.2 + i * 0.1})`,
                            borderColor: `rgba(153, 102, 255, 1)`,
                            borderWidth: 1,
                        };
                    }
                    datasets[i].data[index] = count;
                    datasets[i].label = `${restaurant} (${count}회)`;
                });
            });

            setWeekdayChartData({
                labels: weekdays,
                datasets,
            });
            setTitles(prev => ({
                ...prev,
                weekdayTitle: `요일별 선택 통계`
            }));
        })
        .catch(error => console.error('Error fetching weekday stats:', error));
}, [stats]);


  return (
    <Grid container spacing={2} direction="column">
      <Grid item xs={12}>
        <Paper style={{ padding: '20px' }}>
          <h3>{titles.dailyTitle}</h3>
          <Bar
            data={dailyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: '선택 건수 통계',
                },
              },
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '20px' }}>
            <h3>{titles.weeklyTitle}</h3>
            <Bar
              data={weeklyChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: titles.weeklyTitle,
                  },
                },
                indexAxis: 'y', // 가로 막대그래프 설정
              }}
            />
          </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '20px' }}>
          <h3>{titles.monthlyTitle}</h3>
          <Bar
            data={monthlyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: titles.monthlyTitle,
                },
              },
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ padding: '20px' }}>
          <h3>{titles.weekdayTitle}</h3>
          <Bar
            data={weekdayChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: '요일별 선택된 가게 통계',
                },
              },
              indexAxis: 'y', // 가로 막대그래프 설정
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Statistics;
