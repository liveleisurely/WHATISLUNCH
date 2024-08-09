import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Grid, Paper } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = ({ stats }) => {
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

    const weekdayNames = ["월요일", "화요일", "수요일", "목요일", "금요일"];
    const weekNames = ["1주차", "2주차", "3주차", "4주차", "5주차"];
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

    // 일별 통계
    const dailyData = stats.reduce((acc, entry) => {
      if (acc[entry.name]) {
        acc[entry.name] += 1;
      } else {
        acc[entry.name] = 1;
      }
      return acc;
    }, {});

    // 주별 통계
    const weeklyData = stats.reduce((acc, entry) => {
      const week = Math.ceil(new Date(entry.date).getDate() / 7);
      const weekLabel = `${week}주차`;
      if (!acc[weekLabel]) {
        acc[weekLabel] = {};
      }
      if (!acc[weekLabel][entry.name]) {
        acc[weekLabel][entry.name] = 0;
      }
      acc[weekLabel][entry.name] += 1;
      return acc;
    }, {});

    const weekLabels = weekNames;
    const weekDatasets = [];

    weekNames.forEach(week => {
      const weekData = weeklyData[week] || {};
      const top3 = Object.entries(weekData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      top3.forEach(([name, count], index) => {
        if (!weekDatasets[index]) {
          weekDatasets[index] = {
            label: `Top ${index + 1}`,
            data: Array(weekNames.length).fill(0),
            backgroundColor: `rgba(54, 162, 235, ${0.2 + index * 0.1})`,
            borderColor: `rgba(54, 162, 235, 1)`,
            borderWidth: 1,
          };
        }
        weekDatasets[index].data[weekLabels.indexOf(week)] = count;
        weekDatasets[index].label = `${name} (${count}회)`;
      });
    });

    setWeeklyChartData({
      labels: weekNames,
      datasets: weekDatasets,
    });

    // 월별 통계
    const monthlyData = stats.reduce((acc, entry) => {
      const monthKey = entry.month;
      if (!acc[monthKey]) {
        acc[monthKey] = {};
      }
      if (!acc[monthKey][entry.name]) {
        acc[monthKey][entry.name] = 0;
      }
      acc[monthKey][entry.name] += 1;
      return acc;
    }, {});

    const monthLabels = monthNames;
    const monthDatasets = [];

    monthNames.forEach((month, index) => {
      const monthData = monthlyData[year + "-" + String(index + 1).padStart(2, "0")] || {};
      const top3 = Object.entries(monthData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      top3.forEach(([name, count], index) => {
        if (!monthDatasets[index]) {
          monthDatasets[index] = {
            label: `Top ${index + 1}`,
            data: Array(monthNames.length).fill(0),
            backgroundColor: `rgba(75, 192, 192, ${0.2 + index * 0.1})`,
            borderColor: `rgba(75, 192, 192, 1)`,
            borderWidth: 1,
          };
        }
        monthDatasets[index].data[monthLabels.indexOf(month)] = count;
        monthDatasets[index].label = `${name} (${count}회)`;
      });
    });

    setMonthlyChartData({
      labels: monthLabels,
      datasets: monthDatasets,
    });

    // 요일별 통계
    const weekdayData = stats.reduce((acc, entry) => {
      const weekday = new Date(entry.date).getDay();
      const dayName = weekdayNames[(weekday + 6) % 7];
      if (!acc[dayName]) {
        acc[dayName] = {};
      }
      if (!acc[dayName][entry.name]) {
        acc[dayName][entry.name] = 0;
      }
      acc[dayName][entry.name] += 1;
      return acc;
    }, {});

    const labels = weekdayNames;
    const datasets = [];

    weekdayNames.forEach(day => {
      const dayData = weekdayData[day] || {};
      const top3 = Object.entries(dayData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      top3.forEach(([name, count], index) => {
        if (!datasets[index]) {
          datasets[index] = {
            label: `Top ${index + 1}`,
            data: Array(weekdayNames.length).fill(0),
            backgroundColor: `rgba(153, 102, 255, ${0.2 + index * 0.1})`,
            borderColor: `rgba(153, 102, 255, 1)`,
            borderWidth: 1,
          };
        }
        datasets[index].data[labels.indexOf(day)] = count;
        datasets[index].label = `${name} (${count}회)`;
      });
    });

    setWeekdayChartData({
      labels: labels,
      datasets: datasets,
    });

    setDailyChartData({
      labels: Object.keys(dailyData),
      datasets: [
        {
          label: '일별 선택 횟수',
          data: Object.values(dailyData),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });

    setTitles({
      dailyTitle: `${year}년 ${month}월 ${date}일 오늘의 선택 통계`,
      weeklyTitle: `${year}년 ${month}월 ${weekNumber}주차 주별 선택 통계`,
      monthlyTitle: `${year}년 월별 선택 통계`,
      weekdayTitle: `요일별 선택 통계`,
    });
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
                  text: '주별 선택 통계',
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
                  text: '월별 선택 통계',
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
                  text: '요일별 상위 3개 가게 통계',
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
