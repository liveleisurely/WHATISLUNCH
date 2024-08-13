export const processDailyData = (dailyData) => ({
    labels: dailyData.map(item => item[0]), // 레스토랑 이름
    datasets: [{
      label: '일별 선택 횟수',
      data: dailyData.map(item => item[1]), // 선택 횟수
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }]
  });
  
  export const processMonthlyData = (monthlyData) => {
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
  
    return { labels: months, datasets };
  };
  
  export const processWeeklyData = (weeklyData) => {
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
  
    return { labels: weeks, datasets };
  };
  
  export const processWeekdayData = (weekdayData) => {
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
  
    return { labels: weekdays, datasets };
  };
  