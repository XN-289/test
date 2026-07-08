const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;
const PROJECT_ROOT = path.join(__dirname, '..');

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// API 路由处理
async function handleAPI(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return true;
    }

    // API: 获取系统状态
    if (pathname === '/api/status' && req.method === 'GET') {
        const status = {
            server: 'running',
            timestamp: new Date().toISOString(),
            skills: {
                'strategy-operator': { status: 'ready', lastRun: null },
                'wiki-compiler': { status: 'ready', lastRun: null },
                'site-generator': { status: 'ready', lastRun: null },
                'autoresearch': { status: 'ready', lastRun: null }
            },
            metrics: {
                signals: 12,
                entities: 28,
                pages: 15,
                strategies: 5
            }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
        return true;
    }

    // API: 运行技能
    if (pathname === '/api/skill/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { skillName } = JSON.parse(body);
                const validSkills = ['strategy-operator', 'wiki-compiler', 'site-generator', 'autoresearch'];

                if (!validSkills.includes(skillName)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid skill name' }));
                    return;
                }

                // 调用 Python 技能执行器
                const scriptPath = path.join(PROJECT_ROOT, 'kealin', 'scripts', 'skill_executor.py');
                const command = `python "${scriptPath}" "${skillName}"`;

                exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            skill: skillName,
                            status: 'error',
                            error: stderr || error.message
                        }));
                    } else {
                        try {
                            const result = JSON.parse(stdout);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                skill: skillName,
                                status: 'success',
                                data: result
                            }));
                        } catch (e) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                skill: skillName,
                                status: 'success',
                                output: stdout
                            }));
                        }
                    }
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        return true;
    }

    // API: 运行完整流程
    if (pathname === '/api/pipeline/run' && req.method === 'POST') {
        const scriptPath = path.join(PROJECT_ROOT, 'kealin', 'scripts', 'skill_executor.py');
        const skills = ['strategy-operator', 'wiki-compiler', 'site-generator', 'autoresearch'];
        const results = [];

        const runSkill = (index) => {
            return new Promise((resolve) => {
                if (index >= skills.length) {
                    resolve();
                    return;
                }

                const skill = skills[index];
                exec(`python "${scriptPath}" "${skill}"`, { timeout: 60000 }, (error, stdout, stderr) => {
                    results.push({
                        skill,
                        status: error ? 'error' : 'success',
                        output: stdout,
                        error: stderr
                    });
                    resolve(runSkill(index + 1));
                });
            });
        };

        runSkill(0).then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'completed',
                results
            }));
        });
        return true;
    }

    // API: 获取知识图谱数据
    if (pathname === '/api/wiki/entities' && req.method === 'GET') {
        const entitiesDir = path.join(PROJECT_ROOT, 'llm_wiki', 'entities');
        try {
            const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.md'));
            const entities = files.map(f => ({
                name: f.replace('.md', ''),
                path: `llm_wiki/entities/${f}`
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ entities, count: entities.length }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read entities' }));
        }
        return true;
    }

    // API: 获取战略图谱数据
    if (pathname === '/api/strategy/graph' && req.method === 'GET') {
        const graphPath = path.join(PROJECT_ROOT, 'strategy_wiki', 'strategy_graph.json');
        try {
            const data = fs.readFileSync(graphPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read strategy graph' }));
        }
        return true;
    }

    // API: 获取市场信号
    if (pathname === '/api/signals' && req.method === 'GET') {
        const signalsDir = path.join(PROJECT_ROOT, 'strategy_wiki', 'signals');
        try {
            const files = fs.readdirSync(signalsDir).filter(f => f.endsWith('.json'));
            const signals = files.map(f => {
                const data = fs.readFileSync(path.join(signalsDir, f), 'utf8');
                return JSON.parse(data);
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ signals, count: signals.length }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read signals' }));
        }
        return true;
    }

    // API: 提交新信号
    if (pathname === '/api/signals/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const signal = JSON.parse(body);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const filename = `sig_${timestamp}.json`;
                const filepath = path.join(PROJECT_ROOT, 'strategy_wiki', 'signals', filename);

                fs.writeFileSync(filepath, JSON.stringify(signal, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, filename }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid signal data' }));
            }
        });
        return true;
    }

    // API: 获取页面列表
    if (pathname === '/api/pages' && req.method === 'GET') {
        const pagesDir = path.join(PROJECT_ROOT, 'website_out', 'pages');
        try {
            const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
            const pages = files.map(f => ({
                name: f.replace('.html', ''),
                url: `/website_out/pages/${f}`
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ pages, count: pages.length }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read pages' }));
        }
        return true;
    }

    // API: 获取配置
    if (pathname === '/api/config' && req.method === 'GET') {
        const configDir = path.join(PROJECT_ROOT, 'configs');
        try {
            const design = fs.readFileSync(path.join(configDir, 'DESIGN.md'), 'utf8');
            const tones = fs.readFileSync(path.join(configDir, 'TONES.md'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ design, tones }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read config' }));
        }
        return true;
    }

    // API: 运行 Autoresearch
    if (pathname === '/api/autoresearch/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { goal, scope, metric, verify } = JSON.parse(body);
                const scriptPath = path.join(PROJECT_ROOT, 'kealin', 'scripts', 'skills', 'autoresearch.py');

                // 构建环境变量
                const env = {
                    ...process.env,
                    AUTORESEARCH_GOAL: goal || 'Improve content quality',
                    AUTORESEARCH_SCOPE: scope || 'website_out/pages',
                    AUTORESEARCH_METRIC: metric || 'quality_score',
                    AUTORESEARCH_VERIFY: verify || 'echo 100'
                };

                exec(`python "${scriptPath}"`, { env, timeout: 120000 }, (error, stdout, stderr) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            status: 'error',
                            error: stderr || error.message
                        }));
                    } else {
                        try {
                            const result = JSON.parse(stdout);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                status: 'success',
                                data: result
                            }));
                        } catch (e) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                status: 'success',
                                output: stdout
                            }));
                        }
                    }
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        return true;
    }

    return false;
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // 尝试处理 API 请求
    if (req.url.startsWith('/api/')) {
        const handled = await handleAPI(req, res);
        if (handled) return;
    }

    // 处理静态文件
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // 移除查询字符串
    filePath = filePath.split('?')[0];

    // 构建完整文件路径
    const fullPath = path.join(ROOT_DIR, filePath);

    // 获取文件扩展名
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // 读取文件
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - 页面未找到</title>
                        <style>
                            body {
                                font-family: 'Segoe UI', sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                            }
                            .error-container {
                                text-align: center;
                                padding: 40px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                            }
                            h1 { font-size: 6em; margin: 0; }
                            p { font-size: 1.2em; margin: 20px 0; }
                            a {
                                color: white;
                                text-decoration: none;
                                padding: 12px 30px;
                                background: rgba(255,255,255,0.2);
                                border-radius: 30px;
                                display: inline-block;
                                margin-top: 20px;
                                transition: background 0.3s;
                            }
                            a:hover { background: rgba(255,255,255,0.3); }
                        </style>
                    </head>
                    <body>
                        <div class="error-container">
                            <h1>404</h1>
                            <p>页面未找到</p>
                            <a href="/">返回首页</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // 服务器错误
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('服务器错误: ' + err.message);
            }
            return;
        }

        // 成功响应
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   🚀 ViaSurg AI CMO - 智能营销引擎                                   ║
║                                                                      ║
║   服务器已启动！                                                      ║
║                                                                      ║
║   📍 访问地址: http://localhost:${PORT}                                ║
║   📡 API 接口: http://localhost:${PORT}/api/                          ║
║                                                                      ║
║   可用 API:                                                          ║
║   • GET  /api/status          - 系统状态                             ║
║   • POST /api/skill/run       - 运行单个技能                         ║
║   • POST /api/pipeline/run    - 运行完整流程                         ║
║   • GET  /api/wiki/entities   - 获取知识实体                         ║
║   • GET  /api/strategy/graph  - 获取战略图谱                         ║
║   • GET  /api/signals         - 获取市场信号                         ║
║   • POST /api/signals/submit  - 提交新信号                           ║
║   • GET  /api/pages           - 获取页面列表                         ║
║   • GET  /api/config          - 获取配置                             ║
║   • POST /api/autoresearch/run - 运行自动研究                        ║
║                                                                      ║
║   按 Ctrl+C 停止服务器                                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
    `);
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n🛑 服务器正在关闭...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 服务器正在关闭...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});
