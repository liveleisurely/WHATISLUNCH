import React from 'react';
import StatsChart from './StatsChart';
import { useStats } from '../App'; // '../App'
import { processWeeklyData } from './utils';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 필요한 스케일과 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeeklyStatistics = () => {
  const { weekly } = useStats();
  const { labels, datasets } = processWeeklyData(weekly);
  return <StatsChart title="주차별 선택 통계" labels={labels} datasets={datasets} indexAxis="y" />;
};

export default WeeklyStatistics;
