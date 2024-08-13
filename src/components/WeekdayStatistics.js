import React from 'react';
import StatsChart from './StatsChart';
import { useStats } from '../App'; // '../App'
import { processWeekdayData } from './utils';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 필요한 스케일과 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeekdayStatistics = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');

  const { weekday } = useStats();
  const { labels, datasets } = processWeekdayData(weekday);
  return <StatsChart title="요일별 추천 통계 Top3" labels={labels} datasets={datasets} indexAxis="y" />;
};

export default WeekdayStatistics;
