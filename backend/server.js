const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// 파일 다운로드를 위한 경로 설정
app.get('/download_template', (req, res) => {
  const filePath = path.join(__dirname, 'templates', 'food_templates.xlsx');
  res.download(filePath, 'food_templates.xlsx', (err) => {
    if (err) {
      console.error('파일 다운로드 오류:', err);
      res.status(500).send('파일 다운로드 중 오류가 발생했습니다.');
    }
  });
});

// 기타 필요한 라우트 설정

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
