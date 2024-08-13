import React from 'react';
import StatsChart from './StatsChart';
import { useStats } from '../App'; // '../App'
import { processWeekdayData } from './utils';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 필요한 스케일과 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeekdayStatistics = () => {
  const { weekday } = useStats();
  const { labels, datasets } = processWeekdayData(weekday);
  return <StatsChart title="요일별 선택 통계" labels={labels} datasets={datasets} indexAxis="y" />;
};

export default WeekdayStatistics;
