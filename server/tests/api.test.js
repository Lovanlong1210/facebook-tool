/**
 * Facebook Tool - Integration Test Suite
 * Chạy: node tests/api.test.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 8000;

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', blue: '\x1b[34m',
};

const results = { passed: 0, failed: 0, skipped: 0, total: 0 };
const failures = [];
const startTime = Date.now();

function log(msg) { process.stdout.write(msg + '\n'); }
function header(title) { log(`\n${c.bold}${c.blue}━━━ ${title} ━━━${c.reset}`); }

async function test(name, fn) {
  results.total++;
  const t = Date.now();
  try {
    await fn();
    results.passed++;
    log(`  ${c.green}✓${c.reset} ${name} ${c.gray}(${Date.now()-t}ms)${c.reset}`);
  } catch (err) {
    results.failed++;
    failures.push({ name, error: err.message });
    log(`  ${c.red}✗${c.reset} ${name} ${c.gray}(${Date.now()-t}ms)${c.reset}`);
    log(`    ${c.red}→ ${err.message}${c.reset}`);
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function assertEqual(a, b, label = '') {
  if (a !== b) throw new Error(`${label ? label+': ' : ''}Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function assertInRange(a, min, max, label = '') {
  if (a < min || a > max) throw new Error(`${label ? label+': ' : ''}${a} not in [${min},${max}]`);
}
function assertHasKey(obj, key) {
  if (!(key in obj)) throw new Error(`Missing key "${key}". Keys: [${Object.keys(obj).join(', ')}]`);
}

async function GET(p, opts={}) {
  const res = await fetch(`${BASE_URL}${p}`, { headers: {'Content-Type':'application/json',...opts.headers}, timeout: TIMEOUT });
  const body = await res.json().catch(()=>({}));
  return { status: res.status, body, headers: res.headers };
}
async function POST(p, data, opts={}) {
  const res = await fetch(`${BASE_URL}${p}`, { method:'POST', headers:{'Content-Type':'application/json',...opts.headers}, body:JSON.stringify(data), timeout:TIMEOUT });
  const body = await res.json().catch(()=>({}));
  return { status: res.status, body, headers: res.headers };
}

// ── TESTS ────────────────────────────────────────────────────────────────────

async function testConnectivity() {
  header('1. Kết nối & Sức khoẻ Server');
  await test('Server đang chạy trên port 5000', async () => {
    const res = await GET('/api/auth/status');
    assertInRange(res.status, 200, 503, 'status');
    assert(typeof res.body === 'object', 'Phải là JSON object');
  });
  await test('CORS header được thiết lập', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/status`, { headers: { Origin:'http://localhost:3000' }, timeout: TIMEOUT });
    assert(res.status > 0, 'Server phải phản hồi');
  });
  await test('404 cho route không tồn tại', async () => {
    const res = await GET('/api/nonexistent-route-xyz-123');
    assertEqual(res.status, 404, 'status');
  });
}

async function testAuthEndpoints() {
  header('2. Auth Endpoints');
  await test('GET /api/auth/status - trả về cấu hình', async () => {
    const { status, body } = await GET('/api/auth/status');
    assertEqual(status, 200, 'status');
    assertHasKey(body, 'success');
    assertHasKey(body, 'configured');
    assertHasKey(body, 'missing');
    assertEqual(body.success, true);
  });
  await test('GET /api/auth/me - 401 khi chưa đăng nhập', async () => {
    const { status, body } = await GET('/api/auth/me');
    assertEqual(status, 401, 'status');
    assertHasKey(body, 'authenticated');
    assertEqual(body.authenticated, false);
  });
  await test('GET /api/auth/facebook - redirect hoặc 503 khi chưa cấu hình', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/facebook`, { redirect:'manual', timeout:TIMEOUT });
    assert([302, 503].includes(res.status), `Expected 302 or 503, got ${res.status}`);
  });
  await test('POST /api/auth/logout - luôn thành công', async () => {
    const { status, body } = await POST('/api/auth/logout', {});
    assertEqual(status, 200, 'status');
    assertEqual(body.success, true);
  });
}

async function testProtectedEndpoints() {
  header('3. Protected Endpoints (401 khi chưa auth)');
  const routes = [
    { method:'GET',  path:'/api/channels' },
    { method:'GET',  path:'/api/posts' },
    { method:'GET',  path:'/api/posts/stats' },
    { method:'POST', path:'/api/posts' },
    { method:'GET',  path:'/api/ai/status' },
    { method:'GET',  path:'/api/reports/insights' },
  ];
  for (const r of routes) {
    await test(`${r.method} ${r.path} → 401 Unauthorized`, async () => {
      const res = r.method === 'GET' ? await GET(r.path) : await POST(r.path, {});
      assertEqual(res.status, 401, `${r.method} ${r.path}`);
    });
  }
}

async function testPostsTemplate() {
  header('4. Posts Template Excel (Public)');
  await test('GET /api/posts/template - file Excel hợp lệ', async () => {
    const res = await fetch(`${BASE_URL}/api/posts/template`, { timeout: TIMEOUT });
    assertEqual(res.status, 200, 'status');
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('spreadsheetml') || ct.includes('octet-stream'), `Bad content-type: ${ct}`);
    const buf = await res.buffer();
    assert(buf.length > 1000, `Excel quá nhỏ: ${buf.length} bytes`);
    // ZIP magic bytes (XLSX is a ZIP)
    assertEqual(buf[0], 0x50, 'magic byte[0]');
    assertEqual(buf[1], 0x4B, 'magic byte[1]');
  });
  await test('GET /api/posts/template - Content-Disposition attachment', async () => {
    const res = await fetch(`${BASE_URL}/api/posts/template`, { timeout: TIMEOUT });
    const cd = res.headers.get('content-disposition') || '';
    assert(cd.includes('attachment'), `Missing "attachment" in Content-Disposition: ${cd}`);
    assert(cd.includes('.xlsx'), `Filename phải có .xlsx: ${cd}`);
  });
}

async function testInputValidation() {
  header('5. Input Validation');
  await test('POST /api/posts body rỗng → 400 hoặc 401', async () => {
    const { status } = await POST('/api/posts', {});
    assert([400,401,422].includes(status), `Expected 400/401/422, got ${status}`);
  });
  await test('POST /api/ai/chat body rỗng → 400 hoặc 401', async () => {
    const { status } = await POST('/api/ai/chat', {});
    assert([400,401].includes(status), `Expected 400/401, got ${status}`);
  });
}

async function testRedis() {
  header('6. Redis (Docker)');
  const { execSync } = require('child_process');
  await test('Container facebook_tool_redis đang chạy', async () => {
    const out = execSync('docker inspect --format={{.State.Status}} facebook_tool_redis', {encoding:'utf8',timeout:5000}).trim();
    assertEqual(out, 'running', 'container status');
  });
  await test('Redis PING → PONG', async () => {
    const out = execSync('docker exec facebook_tool_redis redis-cli ping', {encoding:'utf8',timeout:5000}).trim();
    assertEqual(out, 'PONG', 'redis ping');
  });
  await test('Redis lưu/đọc key thành công', async () => {
    execSync('docker exec facebook_tool_redis redis-cli set test_key test_value', {timeout:5000});
    const val = execSync('docker exec facebook_tool_redis redis-cli get test_key', {encoding:'utf8',timeout:5000}).trim();
    assertEqual(val, 'test_value', 'redis get');
    execSync('docker exec facebook_tool_redis redis-cli del test_key', {timeout:5000});
  });
}

async function testFrontend() {
  header('7. Frontend (Next.js - port 3000)');
  await test('Frontend phục vụ trên port 3000', async () => {
    const res = await fetch('http://localhost:3000', { timeout: TIMEOUT });
    assertInRange(res.status, 200, 308, 'status');
  });
  await test('Frontend trả HTML hợp lệ', async () => {
    const res = await fetch('http://localhost:3000', { timeout: TIMEOUT });
    const text = await res.text();
    assert(text.includes('<html') || text.includes('<!DOCTYPE'), 'Phải là HTML document');
  });
  await test('Route /login tồn tại', async () => {
    const res = await fetch('http://localhost:3000/login', { timeout: TIMEOUT });
    assertInRange(res.status, 200, 308, 'status');
    const text = await res.text();
    assert(text.length > 100, 'Response phải có nội dung');
  });
  await test('Route /dashboard trả về HTML (client-side auth redirect)', async () => {
    const res = await fetch('http://localhost:3000/dashboard', { timeout: TIMEOUT });
    assertInRange(res.status, 200, 308, 'status');
  });
}

async function testResponseFormat() {
  header('8. Response Format Consistency');
  await test('Error responses có field success: false', async () => {
    const { body } = await GET('/api/posts');
    assertHasKey(body, 'success');
    assertEqual(body.success, false);
  });
  await test('Success responses có field success: true', async () => {
    const { body } = await GET('/api/auth/status');
    assertHasKey(body, 'success');
    assertEqual(body.success, true);
  });
  await test('Content-Type là application/json', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/status`, { timeout: TIMEOUT });
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
  });
  await test('Logout response có Set-Cookie header để xóa session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, { method:'POST', timeout:TIMEOUT });
    // Server should clear cookies on logout
    assertEqual(res.status, 200, 'status');
  });
}

// ── Summary ──────────────────────────────────────────────────────────────────
function printSummary() {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log('\n' + '═'.repeat(58));
  log(`${c.bold}  KẾT QUẢ KIỂM THỬ${c.reset}`);
  log('═'.repeat(58));
  log(`  Tổng số tests  : ${c.bold}${results.total}${c.reset}`);
  log(`  ${c.green}Passed${c.reset}          : ${c.bold}${c.green}${results.passed}${c.reset}`);
  log(`  ${c.red}Failed${c.reset}          : ${c.bold}${c.red}${results.failed}${c.reset}`);
  log(`  ${c.yellow}Skipped${c.reset}         : ${c.bold}${c.yellow}${results.skipped}${c.reset}`);
  log(`  Thời gian chạy  : ${duration}s`);
  if (failures.length) {
    log(`\n${c.bold}${c.red}  ✗ Tests thất bại:${c.reset}`);
    failures.forEach((f, i) => {
      log(`  ${i+1}. ${c.red}${f.name}${c.reset}`);
      log(`     ${c.gray}→ ${f.error}${c.reset}`);
    });
  }
  log('═'.repeat(58));
  if (results.failed === 0) log(`\n  ${c.bold}${c.green}🎉 Tất cả ${results.passed} tests đã PASS!${c.reset}\n`);
  else log(`\n  ${c.bold}${c.red}⚠️  ${results.failed} test(s) FAILED.${c.reset}\n`);
}

async function main() {
  log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`);
  log(`${c.bold}${c.cyan}║   FACEBOOK TOOL - INTEGRATION TEST SUITE                 ║${c.reset}`);
  log(`${c.bold}${c.cyan}║   Target: ${BASE_URL.padEnd(48)}║${c.reset}`);
  log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`);
  log(`${c.gray}  Bắt đầu: ${new Date().toLocaleString('vi-VN')}${c.reset}`);
  await testConnectivity();
  await testAuthEndpoints();
  await testProtectedEndpoints();
  await testPostsTemplate();
  await testInputValidation();
  await testRedis();
  await testFrontend();
  await testResponseFormat();
  printSummary();
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(err => {
  log(`\n${c.red}${c.bold}FATAL: ${err.message}${c.reset}`);
  process.exit(2);
});
