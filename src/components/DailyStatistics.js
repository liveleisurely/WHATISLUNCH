import React from 'react';
import StatsChart from './StatsChart';
import { useStats } from '../App';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { processDailyData } from './utils';

// 필요한 스케일과 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyStatistics = () => {
  const { daily } = useStats();
  const { labels, datasets } = processDailyData(daily);

  // 현재 날짜를 가져와서 형식화
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');

  const title = `${year}년 ${month}월 ${day}일 추천 통계 Top5`;

  return <StatsChart title={title} labels={labels} datasets={datasets} />;
};

export default DailyStatistics;
