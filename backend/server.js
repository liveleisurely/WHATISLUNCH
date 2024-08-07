const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static('public'));

// 템플릿 파일 다운로드 라우트
app.get('/download_template', (req, res) => {
  const file = path.join(__dirname, 'templates', 'food_templates.xlsx');
  res.download(file);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
