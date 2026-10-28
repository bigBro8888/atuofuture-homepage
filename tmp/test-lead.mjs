const response = await fetch('http://127.0.0.1:18180/api/public/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '测试线索',
    contact: '13800138000',
    requirement: '部署验收',
    source: 'demo',
  }),
})
console.log(response.status, await response.text())
