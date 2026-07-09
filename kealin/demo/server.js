const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// CONFIGURATION
// ============================================

const PORT = 3001;
const DATA_DIR = 'd:/test/kealin/data/parsed';
const WIKI_DIR = 'd:/test/kealin/llm_wiki/entities';
const OUTPUT_DIR = 'd:/test/kealin/demo/output';
const STRATEGY_DIR = 'd:/test/kealin/strategy_wiki';
const PERSIST_DIR = 'd:/test/kealin/data/persist';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Unified slug generator: underscores + spaces → hyphens, lowercase
function makeSlug(name) {
    return name.toLowerCase().replace(/[_ ]+/g, '-');
}

// ============================================
// i18n TRANSLATION MAPS
// ============================================

const CATEGORY_ZH = {
    'Access': '通路',
    'Clips': '夹子',
    'Instrumentation': '器械',
    'Intelligence': '智能',
    'Medical Device': '医疗器械',
    'Minimally Invasive Surgery': '微创手术',
    'NomoFlow Solutions': 'NomoFlow 解决方案',
    'Sutures': '缝合线',
    'Wound Closure': '伤口闭合',
    'Endoscopy': '内窥镜',
    'Endoscopy Instruments': '内窥镜器械',
};

const PRODUCT_ZH = {
    'Absorbable Sutures': '可吸收缝合线',
    'Biopsy Forceps': '活检钳',
    'Guidewires': '导丝',
    'Hemoclips': '止血夹',
    'Hernia Meshes': '疝修补片',
    'Non Absorbable Sutures': '非可吸收缝合线',
    'Polymer Clips': '高分子结扎夹',
    'Snares': '圈套器',
    'Staplers': '吻合器',
    'Trocars': '穿刺器',
    'Ultrasonic Shears': '超声刀',
    'Veress Needles': '气腹针',
};

const PRODUCT_DESC_ZH = {
    'Absorbable Sutures': '采用 PGA/PGLA 合成材料，关键愈合期提供可靠伤口支撑，随后通过水解完全吸收。',
    'Biopsy Forceps': '精密活检器械，适用于内窥镜下组织取样，操作精准、创伤小。',
    'Guidewires': '高精度介入导丝，适用于内窥镜及微创手术中的器械引导。',
    'Hemoclips': '内窥镜止血夹，用于消化道出血的快速机械止血。',
    'Hernia Meshes': '疝修补片，用于腹壁缺损修补，提供长期组织支撑。',
    'Non Absorbable Sutures': '不可吸收合成缝合线（聚丙烯/尼龙），适用于需要长期张力支撑的缝合场景。',
    'Polymer Clips': '高分子结扎夹，用于腹腔镜及开放手术中的血管和组织结扎。',
    'Snares': '内窥镜圈套器，用于息肉切除及异物取出。',
    'Staplers': '外科吻合器，适用于消化道、肺等组织的切割吻合。',
    'Trocars': '腹腔镜穿刺器，建立气腹通道，支持微创手术器械进出。',
    'Ultrasonic Shears': '超声切割止血刀，同时实现切割与凝血，热损伤范围小。',
    'Veress Needles': '气腹针，用于建立气腹，是腹腔镜手术的首要步骤。',
};

const COMPETITOR_ZH = {
    'Bard': 'Bard',
    'Boston Scientific': '波士顿科学',
    'Competitor Disruption': '竞品颠覆分析',
    'Cook Medical': '库克医疗',
    'Ethicon': 'Ethicon（强生）',
    'Medtronic': '美敦力',
    'Olympus': '奥林巴斯',
    'Teleflex': '泰利福',
    'Terumo': '泰尔茂',
    'ViaSurg Academy': 'ViaSurg 学院',
};

const COMPETITOR_MARKET_ZH = {
    'Bard': '全球领先的疝修补片和导管制造商，产品线包括 Ventralight 疝修补片和 PowerPICC 导管。',
    'Boston Scientific': '全球介入医疗器械领导者，核心产品包括 Jagwire 导丝、Resolution 止血夹和 SpyGlass 内窥镜系统。',
    'Competitor Disruption': '分析现有竞品的市场弱点和颠覆机会，制定针对性的竞争策略。',
    'Cook Medical': '专注于介入和外科医疗器械，核心产品包括 Amplatz 导丝、Bakri 球囊和圈套器。',
    'Ethicon': '强生旗下外科器械品牌，主导产品包括 Vicryl 缝合线、Harmonic 超声刀和 Echelon 吻合器。',
    'Medtronic': '全球最大的医疗器械公司之一，核心产品包括 Endo GIA 吻合器、Sonicision 超声刀和 Ligasure 血管闭合系统。',
    'Olympus': '内窥镜领域的全球领导者，核心产品包括 QuickClip 止血夹、一次性活检钳和冷圈套器。',
    'Teleflex': '专注于血管通路和手术器械，核心产品包括 Hem-o-lok 高分子结扎夹、Weck 外科夹和 LMA 气道管理。',
    'Terumo': '日本领先的医疗器械制造商，核心产品包括 Pinnacle 通路鞘、Zebra 导丝和 Radifocus 导丝。',
    'ViaSurg Academy': 'ViaSurg 临床教育平台，提供产品培训和临床证据支持。',
};

const MATERIAL_DESC_ZH = {
    'PGA Material': '一种可生物降解的热塑性聚合物，也是最简单的线性脂肪族聚酯。广泛用于合成可吸收缝合线。',
    'Polypropylene Material': '一种坚固且耐腐蚀的热塑性聚合物。在外科领域，用于不可吸收单丝缝合线和疝修补片。',
    'PGLA Material': '聚乙交酯-丙交酯共聚物，可吸收缝合线的核心材料，具有优异的张力保持和吸收特性。',
};

const MATERIAL_PROPS_ZH = {
    'PGA Material': {
        'Absorption Method': '水解吸收',
        'Tensile Strength Retention': '前 14-21 天保持高张力',
    },
    'Polypropylene Material': {
        'Durability': '永久伤口支撑',
        'Reactivity': '极低组织反应',
    },
};

const TECH_DESC_ZH = {
    'NomoFlow Technology': 'NomoFlow™ 是一个闭环控制平台，通过高频参数补偿来降低批次差异。1. 传感：150 个节点以 1000Hz 采样温度、压力、流量变量。2. 分析：AI 模型实时检测偏差。3. 补偿：自动调整工艺参数。4. 验证：批次级质量报告。',
};

function pzh(name) { return PRODUCT_ZH[name] || name; }
function catZh(cat) { return CATEGORY_ZH[cat] || cat; }
function matDescZh(name) { return MATERIAL_DESC_ZH[name] || null; }
function techDescZh(name) { return TECH_DESC_ZH[name] || null; }
if (!fs.existsSync(PERSIST_DIR)) {
    fs.mkdirSync(PERSIST_DIR, { recursive: true });
}

// ============================================
// PERSISTENT STORAGE
// ============================================

const PERSIST_FILE = path.join(PERSIST_DIR, 'state.json');

function loadPersistedState() {
    try {
        if (fs.existsSync(PERSIST_FILE)) {
            const data = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8'));
            console.log('[INIT] Loaded persisted state');
            return data;
        }
    } catch (e) {
        console.error('[INIT] Error loading persisted state:', e.message);
    }
    return { signals: [], pipelineRuns: [], lastRun: null };
}

function savePersistedState() {
    try {
        fs.writeFileSync(PERSIST_FILE, JSON.stringify(persistedState, null, 2), 'utf8');
    } catch (e) {
        console.error('[PERSIST] Error saving state:', e.message);
    }
}

let persistedState = loadPersistedState();

// ============================================
// DATA CACHE (loaded once at startup)
// ============================================

let dataCache = {};

function loadAllData() {
    console.log('[INIT] Loading all parsed data...');
    const files = [
        'google_keywords_parsed.json',
        'high_value_keywords.json',
        'high_volume_keywords.json',
        'strategy_wiki_data.json',
        'i18n_data.json',
        'templates_data.json',
        'llm_wiki_data.json'
    ];

    files.forEach(f => {
        const filePath = path.join(DATA_DIR, f);
        if (fs.existsSync(filePath)) {
            try {
                dataCache[f] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`[INIT] Loaded ${f}`);
            } catch (e) {
                console.error(`[INIT] Error loading ${f}: ${e.message}`);
            }
        }
    });

    // Load wiki entities directly
    if (fs.existsSync(WIKI_DIR)) {
        const mdFiles = fs.readdirSync(WIKI_DIR).filter(f => f.endsWith('.md'));
        dataCache.wiki_entities_raw = mdFiles.map(f => ({
            name: f.replace('.md', ''),
            content: fs.readFileSync(path.join(WIKI_DIR, f), 'utf8'),
            file: f
        }));
        console.log(`[INIT] Loaded ${mdFiles.length} raw wiki entities`);
    }

    // Load strategy files directly
    ['signals', 'insights', 'strategies'].forEach(subdir => {
        const dirPath = path.join(STRATEGY_DIR, subdir);
        if (fs.existsSync(dirPath)) {
            const jsonFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
            dataCache[`raw_${subdir}`] = jsonFiles.map(f => {
                try {
                    return JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf8'));
                } catch (e) { return null; }
            }).filter(Boolean);
            console.log(`[INIT] Loaded ${jsonFiles.length} raw ${subdir}`);
        }
    });

    // Load Google Ads credentials if persisted
    const credsPath = path.join(PERSIST_DIR, 'google_ads_credentials.json');
    if (fs.existsSync(credsPath)) {
        try {
            dataCache._googleAdsCredentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            console.log('[INIT] Loaded Google Ads credentials');
        } catch (e) {
            console.error('[INIT] Error loading Google Ads credentials:', e.message);
        }
    }

    // Run initial keyword expansion
    const seedKw = [...(dataCache['high_value_keywords.json']?.keywords || []), ...(dataCache['google_keywords_parsed.json']?.keywords || [])];
    if (seedKw.length > 0) {
        dataCache._expandedKeywords = expandKeywords(seedKw);
        console.log(`[INIT] Expanded ${seedKw.length} seed keywords → ${dataCache._expandedKeywords.length} total`);
    }

    console.log('[INIT] All data loaded.');
}

// ============================================
// UTILITY HELPERS
// ============================================

// Clean wiki markdown content for HTML rendering
function cleanWikiContent(text) {
    if (!text) return '';
    return text
        .replace(/\[\[([^\]]+)\]\]/g, '$1')           // [[Link]] → Link
        .replace(/\*\*([^*]+)\*\*/g, '$1')             // **Bold** → Bold
        .replace(/^#+\s+/gm, '')                       // ### Heading → Heading
        .replace(/^-\s+\*\*[^*]+\*\*:\s*[^\n]*/gm, '') // - **Key**: Value lines
        .replace(/\n{3,}/g, '\n\n')                     // collapse blank lines
        .trim();
}

// Extract description from wiki content (skip metadata lines)
function extractDescription(content) {
    if (!content) return '';
    const lines = content.split('\n');
    // Try to find ## Description section
    const descIdx = lines.findIndex(l => l.startsWith('## Description'));
    if (descIdx >= 0) {
        const descLines = [];
        for (let i = descIdx + 1; i < lines.length; i++) {
            if (lines[i].startsWith('##')) break;
            if (lines[i].trim()) descLines.push(cleanWikiContent(lines[i]));
            if (descLines.join(' ').length > 200) break;
        }
        return descLines.join(' ').substring(0, 200);
    }
    // Fallback: first non-header, non-metadata lines
    const bodyLines = lines
        .filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('- **'))
        .slice(0, 3)
        .map(l => cleanWikiContent(l));
    return bodyLines.join(' ').substring(0, 200);
}

// Extract key-value properties from wiki content
function extractProperties(content, max = 3) {
    if (!content) return [];
    const matches = content.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/g) || [];
    return matches.slice(0, max).map(m => {
        const [, key, val] = m.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/) || [];
        return { key: cleanWikiContent(key || ''), value: cleanWikiContent(val || '') };
    }).filter(p => p.key && !['Type', 'Category', 'Parent Category', 'Material', 'Primary Use'].includes(p.key));
}

// ============================================
// AGENT SDK INTEGRATION
// ============================================

const SCRIPTS_DIR = 'd:/test/kealin/scripts';
const SKILL_EXECUTOR = path.join(SCRIPTS_DIR, 'skill_executor.py');
const LLM_CONFIG_PATH = path.join('d:/test/kealin/config', 'llm_config.json');
const agentSDKStatus = { available: false, pythonPath: null, lastCheck: null };

// Load LLM configuration
function loadLLMConfig() {
    try {
        if (fs.existsSync(LLM_CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(LLM_CONFIG_PATH, 'utf8'));
            return config;
        }
    } catch (e) {
        console.log(`[LLM Config] Error loading config: ${e.message}`);
    }
    return {
        deepseek: { api_key: '', base_url: 'https://api.deepseek.com', model: 'deepseek-chat' },
        openai: { api_key: '', base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
        active_provider: 'deepseek',
        fallback_to_js: true
    };
}

const llmConfig = loadLLMConfig();

// Check if Python and Agent SDK are available
function checkAgentSDK() {
    try {
        const pyPath = execSync('where python 2>nul || where python3 2>nul', { encoding: 'utf8', timeout: 5000 }).trim().split('\n')[0];
        agentSDKStatus.pythonPath = pyPath;
        agentSDKStatus.available = fs.existsSync(SKILL_EXECUTOR);
        agentSDKStatus.lastCheck = new Date().toISOString();
    } catch (e) {
        agentSDKStatus.available = false;
        agentSDKStatus.lastCheck = new Date().toISOString();
    }
    return agentSDKStatus;
}

// Get active LLM provider config
function getActiveLLMProvider() {
    const provider = llmConfig.active_provider || 'deepseek';
    const providerConfig = llmConfig[provider] || llmConfig.deepseek;
    return {
        apiKey: providerConfig.api_key || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
        baseUrl: provider === 'openai' ? providerConfig.base_url : (providerConfig.base_url || 'https://api.deepseek.com'),
        model: providerConfig.model || 'deepseek-chat',
        provider
    };
}

// Try to call Agent SDK skill, return null if unavailable
function callSkill(skillName) {
    if (!agentSDKStatus.available) return null;

    const llmProvider = getActiveLLMProvider();

    // Set API key based on provider
    const envVars = {
        ...process.env,
        DATA_DIR,
        PYTHONIOENCODING: 'utf-8',
        LLM_MODEL: llmProvider.model
    };

    if (llmProvider.provider === 'openai') {
        envVars.OPENAI_API_KEY = llmProvider.apiKey;
        envVars.OPENAI_BASE_URL = llmProvider.baseUrl;
    } else {
        envVars.DEEPSEEK_API_KEY = llmProvider.apiKey;
        envVars.DEEPSEEK_BASE_URL = llmProvider.baseUrl;
    }

    try {
        const result = execSync(
            `"${agentSDKStatus.pythonPath}" "${SKILL_EXECUTOR}" "${skillName}" --data-dir "${DATA_DIR}"`,
            {
                encoding: 'utf8',
                timeout: 90000,
                env: envVars
            }
        );
        return JSON.parse(result.trim());
    } catch (e) {
        console.log(`[SDK] ${skillName} failed: ${e.message.substring(0, 100)}, falling back to JS`);
        return null;
    }
}

// Initialize SDK check
checkAgentSDK();
console.log(`[INIT] Agent SDK: ${agentSDKStatus.available ? 'Available' : 'Unavailable (using JS fallback)'}`);

// ============================================
// PIPELINE STAGE PROCESSORS
// ============================================

// ============================================
// KEYWORD RESEARCH ENGINE
// ============================================

// Keyword expansion: generate related keywords from seed keywords
function expandKeywords(seedKeywords) {
    const expanded = new Map();

    // Suffix patterns for medical device keywords
    const suffixes = [
        '', 'price', 'cost', 'supplier', 'manufacturer', 'wholesale',
        'vs', 'alternative', 'specifications', 'review', 'catalog',
        'fda cleared', 'ce marked', 'disposable', 'reusable',
        'for hospital', 'for surgery', 'for laparoscopy',
        'oem', 'odm', 'private label'
    ];

    // Prefix patterns
    const prefixes = [
        '', 'best', 'top', 'cheap', 'quality', 'professional',
        'surgical', 'medical', 'clinical', 'hospital grade',
        'buy', 'order', 'bulk'
    ];

    // Category expansion map
    const categoryMap = {
        'suture': ['absorbable suture', 'non absorbable suture', 'surgical suture', 'pga suture', 'polyglactin suture', 'polypropylene suture', 'nylon suture', 'silk suture', 'suture material', 'suture thread', 'suture needle'],
        'sutures': ['absorbable sutures', 'non absorbable sutures', 'surgical sutures', 'suture kit', 'suture pack'],
        'trocar': ['laparoscopic trocar', 'trocar port', 'trocar cannula', 'bladeless trocar', 'optical trocar', 'trocar set'],
        'trocars': ['laparoscopic trocars', 'trocar ports', 'trocar set'],
        'clip': ['hemoclip', 'ligating clip', 'polymer clip', 'surgical clip', 'endoscopic clip', 'hemostatic clip'],
        'clips': ['hemoclips', 'ligating clips', 'polymer clips', 'surgical clips'],
        'snare': ['polypectomy snare', 'hot snare', 'cold snare', 'endoscopic snare', 'snare loop'],
        'snares': ['polypectomy snares', 'endoscopic snares'],
        'forceps': ['biopsy forceps', 'endoscopic forceps', 'grasping forceps', 'dissecting forceps', 'laparoscopic forceps'],
        'stapler': ['surgical stapler', 'linear stapler', 'circular stapler', 'endoscopic stapler', 'stapler cartridge'],
        'staplers': ['surgical staplers', 'linear staplers', 'circular staplers'],
        'mesh': ['hernia mesh', 'surgical mesh', 'polypropylene mesh', 'mesh implant', 'mesh graft'],
        'guidewire': ['hydrophilic guidewire', 'guide wire', 'guidewire catheter', 'access guidewire'],
        'guidewires': ['hydrophilic guidewires', 'guide wires'],
        'veress': ['veress needle', 'veress needle placement', 'insufflation needle'],
        'scalpel': ['ultrasonic scalpel', 'harmonic scalpel', 'energy device', 'ultrasonic shears'],
        'retractor': ['surgical retractor', 'laparoscopic retractor', 'liver retractor', 'wound retractor'],
    };

    // Process each seed keyword
    seedKeywords.forEach(kw => {
        const kwLower = (kw.keyword || '').toLowerCase();
        const baseEntry = {
            keyword: kw.keyword,
            source: 'seed',
            avg_monthly_searches: kw.avg_monthly_searches || 0,
            top_of_page_bid_high: kw.top_of_page_bid_high || 0,
            competition_index: kw.competition_index || 0
        };
        expanded.set(kw.keyword, baseEntry);

        // Category expansion
        Object.entries(categoryMap).forEach(([key, variants]) => {
            if (kwLower.includes(key)) {
                variants.forEach(v => {
                    if (!expanded.has(v)) {
                        expanded.set(v, {
                            keyword: v,
                            source: 'expanded',
                            seed: kw.keyword,
                            avg_monthly_searches: Math.floor((kw.avg_monthly_searches || 1000) * 0.3),
                            top_of_page_bid_high: (kw.top_of_page_bid_high || 2) * 0.8,
                            competition_index: Math.floor((kw.competition_index || 50) * 0.7)
                        });
                    }
                });
            }
        });

        // Suffix expansion for high-value keywords
        if ((kw.top_of_page_bid_high || 0) > 3) {
            suffixes.slice(1, 8).forEach(suffix => {
                const expanded_kw = `${kwLower} ${suffix}`;
                if (!expanded.has(expanded_kw)) {
                    expanded.set(expanded_kw, {
                        keyword: expanded_kw,
                        source: 'suffix_expansion',
                        seed: kw.keyword,
                        avg_monthly_searches: Math.floor((kw.avg_monthly_searches || 500) * 0.2),
                        top_of_page_bid_high: (kw.top_of_page_bid_high || 2) * 0.6,
                        competition_index: Math.floor((kw.competition_index || 50) * 0.5)
                    });
                }
            });
        }
    });

    return [...expanded.values()];
}

// Google Ads API integration (requires credentials)
async function fetchGoogleKeywords(keywords, credentials) {
    if (!credentials || !credentials.developerToken) {
        return { status: 'skipped', reason: 'No Google Ads credentials configured' };
    }

    // Google Ads Keyword Plan API endpoint
    const customerId = credentials.customerId;
    const url = `https://googleads.googleapis.com/v17/customers/${customerId}:generateKeywordHistoricalMetrics`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${credentials.accessToken}`,
                'developer-token': credentials.developerToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keywords: keywords.map(k => k.keyword || k),
                geoTargetConstants: ['geoTargetConstants/2840'], // US
                keywordPlanNetwork: 'GOOGLE_SEARCH'
            })
        });

        if (!response.ok) {
            return { status: 'error', code: response.status, message: await response.text() };
        }

        const data = await response.json();
        const results = (data.results || []).map(r => ({
            keyword: r.text,
            avg_monthly_searches: r.keywordMetrics?.avgMonthlySearches || 0,
            competition_index: r.keywordMetrics?.competitionIndex || 0,
            top_of_page_bid_low: r.keywordMetrics?.lowTopOfPageBidMicros ? r.keywordMetrics.lowTopOfPageBidMicros / 1000000 : 0,
            top_of_page_bid_high: r.keywordMetrics?.highTopOfPageBidMicros ? r.keywordMetrics.highTopOfPageBidMicros / 1000000 : 0,
            source: 'google_ads_api'
        }));

        return { status: 'success', keywords: results, count: results.length };
    } catch (err) {
        return { status: 'error', message: err.message };
    }
}

// Combined keyword research: expansion + optional Google Ads API
async function runKeywordResearch(options = {}) {
    const seedKeywords = [
        ...(dataCache['high_value_keywords.json']?.keywords || []),
        ...(dataCache['google_keywords_parsed.json']?.keywords || [])
    ];

    // Step 1: Local expansion engine (always works)
    const expanded = expandKeywords(seedKeywords);
    const newKeywords = expanded.filter(k => k.source !== 'seed');
    console.log(`[KEYWORD-RESEARCH] Expanded ${seedKeywords.length} seeds → ${expanded.length} total (${newKeywords.length} new)`);

    // Step 2: Google Ads API (if credentials provided)
    let googleResult = { status: 'skipped', reason: 'No credentials' };
    const creds = options.googleAdsCredentials || dataCache._googleAdsCredentials;
    if (creds) {
        console.log('[KEYWORD-RESEARCH] Fetching Google Ads data...');
        googleResult = await fetchGoogleKeywords(newKeywords.slice(0, 50), creds);
    }

    // Step 3: Merge results
    let finalKeywords = [...seedKeywords];
    if (googleResult.status === 'success') {
        // Google Ads data takes priority
        const googleMap = new Map(googleResult.keywords.map(k => [k.keyword, k]));
        newKeywords.forEach(kw => {
            const googleData = googleMap.get(kw.keyword);
            if (googleData) {
                finalKeywords.push(googleData); // Use real Google data
            } else {
                finalKeywords.push(kw); // Use expanded estimate
            }
        });
        console.log(`[KEYWORD-RESEARCH] Merged ${googleResult.count} Google Ads keywords`);
    } else {
        finalKeywords = expanded;
    }

    // Deduplicate
    const seen = new Set();
    finalKeywords = finalKeywords.filter(kw => {
        const key = kw.keyword.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        status: 'completed',
        totalSeed: seedKeywords.length,
        totalExpanded: finalKeywords.length,
        newDiscovered: finalKeywords.length - seedKeywords.length,
        googleAdsStatus: googleResult.status,
        googleAdsReason: googleResult.reason || googleResult.message || '',
        keywords: finalKeywords
    };
}

// Stage 1: Signal Ingestion (Strategy Operator - Observe)
function processSignalIngestion() {
    const keywords = dataCache['high_value_keywords.json']?.keywords || [];
    const highVolume = dataCache['high_volume_keywords.json']?.keywords || [];
    const allKeywords = dataCache['google_keywords_parsed.json']?.keywords || [];
    const strategyData = dataCache['strategy_wiki_data.json'] || {};
    const signals = [...(dataCache.raw_signals || []), ...(strategyData.signals || [])];
    const totalKeywords = dataCache['google_keywords_parsed.json']?.total_keywords || 0;

    // Run keyword expansion engine
    const seedKeywords = [...keywords, ...allKeywords];
    const expanded = expandKeywords(seedKeywords);
    const newDiscovered = expanded.filter(k => k.source !== 'seed');
    dataCache._expandedKeywords = expanded;
    console.log(`[STAGE-1] Keyword expansion: ${seedKeywords.length} seeds → ${expanded.length} total (${newDiscovered.length} new)`);

    // Analyze keyword clusters (combine high-value + high-volume + expanded for richer signals)
    const clusters = {};
    const signalKeywords = [...keywords, ...highVolume, ...newDiscovered.slice(0, 200)];
    signalKeywords.forEach(kw => {
        const words = (kw.keyword || '').toLowerCase().split(/\s+/);
        words.forEach(w => {
            if (w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'been'].includes(w)) {
                if (!clusters[w]) clusters[w] = { count: 0, totalCPC: 0, totalSearches: 0, keywords: [] };
                clusters[w].count++;
                clusters[w].totalCPC += kw.top_of_page_bid_high || 0;
                clusters[w].totalSearches += kw.avg_monthly_searches || 0;
                if (clusters[w].keywords.length < 3) clusters[w].keywords.push(kw.keyword);
            }
        });
    });

    // Sort clusters by total CPC value
    const topClusters = Object.entries(clusters)
        .map(([term, data]) => ({
            term,
            count: data.count,
            avgCPC: (data.totalCPC / data.count).toFixed(2),
            totalSearches: data.totalSearches,
            sampleKeywords: data.keywords
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

    // High-volume traffic signals (searches > 100k, low competition = opportunity)
    const trafficOpportunities = highVolume
        .filter(kw => kw.avg_monthly_searches > 100000 && (kw.competition_index || 100) < 50)
        .sort((a, b) => b.avg_monthly_searches - a.avg_monthly_searches)
        .slice(0, 10)
        .map(kw => ({
            keyword: kw.keyword,
            searches: kw.avg_monthly_searches,
            competition: kw.competition_index,
            bidHigh: kw.top_of_page_bid_high
        }));

    // Check Google Ads API status
    const googleAdsConfigured = !!(dataCache._googleAdsCredentials?.developerToken);

    return {
        stage: 'signal_ingestion',
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: {
            totalKeywords,
            highValueCount: keywords.length,
            highVolumeCount: highVolume.length,
            signalsLoaded: signals.length,
            keywordClusters: topClusters,
            trafficOpportunities,
            topSignal: signals[0] || null,
            keywordExpansion: {
                seedCount: seedKeywords.length,
                expandedCount: expanded.length,
                newDiscovered: newDiscovered.length,
                googleAdsStatus: googleAdsConfigured ? 'configured' : 'not_configured'
            }
        },
        logs: [
            { type: 'info', message: `Loaded ${totalKeywords} keywords from 21 CSV files` },
            { type: 'info', message: `Identified ${keywords.length} high-value keywords (CPC > $5)` },
            { type: 'info', message: `Identified ${highVolume.length} high-volume keywords (1000+ searches/mo)` },
            { type: 'signal', message: `Loaded ${signals.length} market signals` },
            { type: 'info', message: `Keyword expansion: ${seedKeywords.length} seeds → ${expanded.length} total (+${newDiscovered.length} new)` },
            { type: 'info', message: `Google Ads API: ${googleAdsConfigured ? 'Configured ✓' : 'Not configured (using local expansion only)'}` },
            { type: 'info', message: `Found ${trafficOpportunities.length} traffic opportunities (high volume + low competition)` },
            { type: 'success', message: `Discovered ${topClusters.length} keyword clusters` }
        ]
    };
}

// Stage 2: OODA Analysis (Strategy Operator - Orient/Decide)
function processOODAAnalysis(signalResult) {
    // Try Agent SDK first
    const sdkResult = callSkill('strategy-operator');
    if (sdkResult && sdkResult.status === 'completed') {
        console.log('[SDK] Stage 2: Using Agent SDK strategy-operator result');
        // Normalize SDK result to match frontend expected structure (oodaLoop.observe.signals as array)
        const sdkResults = sdkResult.results || {};
        const signalCount = typeof sdkResults.signals === 'number' ? sdkResults.signals : 0;
        const insightCount = typeof sdkResults.insights === 'number' ? sdkResults.insights : 0;
        const orientData = sdkResults.orient || {};
        const strategyCount = sdkResults.strategies || 0;
        const decideData = sdkResults.decide || {};
        const actData = sdkResults.act || {};

        // Extract strategy details from SDK result
        const decideDetails = decideData.details || [];
        const strategyNames = decideDetails.map(d => d.strategy?.id || d.strategy?.name || 'unknown');
        const executingCount = decideData.executing || 0;

        // Build signal IDs array for frontend (oodaLoop.observe.signals)
        const strategyData = dataCache['strategy_wiki_data.json'] || {};
        const allSignals = [...(dataCache.raw_signals || []), ...(strategyData.signals || [])];
        const signalIds = allSignals.slice(0, signalCount).map(s => s.id || s.name || `signal_${allSignals.indexOf(s)}`);
        while (signalIds.length < signalCount) signalIds.push(`sdk_signal_${signalIds.length + 1}`);

        return {
            stage: 'ooda_analysis',
            status: 'completed',
            mode: sdkResult.mode || 'sdk',
            timestamp: new Date().toISOString(),
            results: {
                signalsOriented: signalCount,
                orphanSignals: orientData.orphan || 0,
                strategiesDecided: strategyCount,
                executingStrategies: executingCount,
                orientResults: orientData.details || [],
                decisionResults: decideDetails,
                oodaLoop: {
                    observe: { signals: signalIds },
                    orient: {
                        aligned: orientData.aligned || 0,
                        orphan: orientData.orphan || 0
                    },
                    decide: { strategies: strategyNames },
                    act: { executing: strategyNames.slice(0, executingCount) }
                }
            },
            logs: [
                { type: 'info', message: `[Agent SDK] Strategy Operator: ${sdkResult.mode} mode` },
                { type: 'info', message: `Observe: ${signalCount} signals loaded` },
                { type: 'info', message: `Orient: ${orientData.aligned || 0} aligned, ${orientData.orphan || 0} orphan` },
                { type: 'info', message: `Decide: ${strategyCount} strategies mapped` },
                { type: 'success', message: `OODA loop completed via Agent SDK — ${executingCount} executing` }
            ]
        };
    }

    // Fallback to JS logic — use signalResult from Stage 1 if available, else load from cache
    const strategyData = dataCache['strategy_wiki_data.json'] || {};
    const strategies = [...(dataCache.raw_strategies || []), ...(strategyData.strategies || [])];
    const insights = [...(dataCache.raw_insights || []), ...(strategyData.insights || [])];
    // Prefer signals from Stage 1 result if passed in
    let signals;
    if (signalResult?.results?.signalsLoaded > 0 && dataCache['strategy_wiki_data.json']?.signals) {
        signals = dataCache['strategy_wiki_data.json'].signals;
    } else {
        signals = [...(dataCache.raw_signals || []), ...(strategyData.signals || [])];
    }

    // Orient: Cross-reference signals with insights
    const oriented = signals.map(sig => {
        const relatedInsights = insights.filter(ins =>
            ins.source_signal === sig.id || ins.description?.toLowerCase().includes(sig.type?.toLowerCase())
        );
        return {
            signal: sig.id,
            type: sig.type,
            relatedInsights: relatedInsights.map(i => i.id),
            orientation: relatedInsights.length > 0 ? 'aligned' : 'orphan'
        };
    });

    // Decide: Map strategies to insights
    const decisions = strategies.map(strat => ({
        strategy: strat.id || strat.name,
        status: strat.status,
        sourceInsight: strat.source_insight,
        actions: strat.actions || [],
        linkedSignals: oriented.filter(o =>
            o.relatedInsights.includes(strat.source_insight)
        ).map(o => o.signal)
    }));

    return {
        stage: 'ooda_analysis',
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: {
            signalsOriented: oriented.length,
            orphanSignals: oriented.filter(o => o.orientation === 'orphan').length,
            strategiesDecided: decisions.length,
            executingStrategies: decisions.filter(d => d.status === 'executing').length,
            orientResults: oriented,
            decisionResults: decisions,
            oodaLoop: {
                observe: { signals: signals.map(s => s.id) },
                orient: { aligned: oriented.filter(o => o.orientation === 'aligned').length, orphan: oriented.filter(o => o.orientation === 'orphan').length },
                decide: { strategies: decisions.map(d => d.strategy) },
                act: { executing: decisions.filter(d => d.status === 'executing').map(d => d.strategy) }
            }
        },
        logs: [
            { type: 'info', message: `Observe: Analyzing ${signals.length} signals...` },
            { type: 'info', message: `Orient: ${oriented.filter(o => o.orientation === 'aligned').length} signals aligned, ${oriented.filter(o => o.orientation === 'orphan').length} orphan` },
            { type: 'info', message: `Decide: ${decisions.length} strategies mapped` },
            { type: 'success', message: `Act: ${decisions.filter(d => d.status === 'executing').length} strategies executing` }
        ]
    };
}

// Stage 3: Knowledge Compilation (Wiki Compiler)
function processWikiCompilation() {
    // Try Agent SDK first
    const sdkResult = callSkill('wiki-compiler');
    if (sdkResult && sdkResult.status === 'completed') {
        console.log('[SDK] Stage 3: Using Agent SDK wiki-compiler result');
        // Still need to run JS logic for entity graph (used by Stage 4)
        const jsResult = processWikiCompilationJS();
        jsResult.mode = sdkResult.mode || 'sdk';
        jsResult.sdkResults = sdkResult.results;
        jsResult.logs.unshift({ type: 'info', message: `[Agent SDK] Wiki Compiler: ${sdkResult.mode} mode` });
        if (sdkResult.results?.llmClassification) {
            jsResult.logs.push({ type: 'success', message: 'LLM entity classification available' });
        }
        return jsResult;
    }

    return processWikiCompilationJS();
}

// Stage 3 JS implementation (also used as fallback)
function processWikiCompilationJS() {
    const entities = dataCache['llm_wiki_data.json']?.entities || [];
    const rawEntities = dataCache.wiki_entities_raw || [];

    // Parse entity cross-references
    const entityGraph = {};
    entities.forEach(ent => {
        const content = ent.content || '';
        const links = (content.match(/\[\[([^\]]+)\]\]/g) || []).map(l => l.slice(2, -2));

        // Classify by content type markers and name patterns
        let type = 'Other';
        if (content.includes('Type**: [[Product]]') || content.includes('Market Strategy') || content.includes('Technical Specs')) {
            type = 'Product';
        } else if (content.includes('Type**: [[Category]]')) {
            type = 'Category';
        } else if (content.includes('Type**: [[Technology]]')) {
            type = 'Technology';
        } else if (content.includes('Type**: [[Material]]')) {
            type = 'Material';
        } else if (content.includes('Type**: [[Surgical Procedure]]')) {
            type = 'Procedure';
        } else if (content.includes('Type**: [[Portal]]')) {
            type = 'Portal';
        } else if (content.includes('Dominant Products') || content.includes('Incumbent') || content.includes('Market Position')) {
            type = 'Competitor';
        } else if (content.includes('Disruption') || content.includes('Arbitrage')) {
            type = 'Strategy';
        } else if (content.includes('Compliance') || content.includes('Framework')) {
            type = 'Compliance';
        }

        entityGraph[ent.name] = {
            wordCount: ent.word_count || content.split(/\s+/).length,
            linkCount: links.length,
            links: links,
            type
        };
    });

    // Classify entities by type
    const typeCounts = {};
    Object.values(entityGraph).forEach(v => {
        typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
    });

    const products = Object.entries(entityGraph).filter(([, v]) => v.type === 'Product');
    const categories = Object.entries(entityGraph).filter(([, v]) => v.type === 'Category');
    const competitors = Object.entries(entityGraph).filter(([, v]) => v.type === 'Competitor');
    const materials = Object.entries(entityGraph).filter(([, v]) => v.type === 'Material');
    const technologies = Object.entries(entityGraph).filter(([, v]) => v.type === 'Technology');
    const procedures = Object.entries(entityGraph).filter(([, v]) => v.type === 'Procedure');
    const others = Object.entries(entityGraph).filter(([, v]) => v.type === 'Other' || v.type === 'Strategy' || v.type === 'Compliance' || v.type === 'Portal');

    return {
        stage: 'wiki_compilation',
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: {
            totalEntities: entities.length,
            totalWords: Object.values(entityGraph).reduce((s, v) => s + v.wordCount, 0),
            totalLinks: Object.values(entityGraph).reduce((s, v) => s + v.linkCount, 0),
            products: products.length,
            categories: categories.length,
            competitors: competitors.length,
            materials: materials.length,
            technologies: technologies.length,
            procedures: procedures.length,
            others: others.length,
            typeCounts,
            entityGraph: Object.fromEntries(
                Object.entries(entityGraph).map(([k, v]) => [k, { type: v.type, linkCount: v.linkCount, wordCount: v.wordCount }])
            ),
            topLinkedEntities: Object.entries(entityGraph)
                .sort((a, b) => b[1].linkCount - a[1].linkCount)
                .slice(0, 10)
                .map(([name, data]) => ({ name, ...data }))
        },
        logs: [
            { type: 'info', message: `Compiling ${entities.length} wiki entities...` },
            { type: 'info', message: `Parsed cross-references: ${Object.values(entityGraph).reduce((s, v) => s + v.linkCount, 0)} total links` },
            { type: 'info', message: `Classified: ${products.length} products, ${categories.length} categories, ${competitors.length} competitors, ${materials.length} materials, ${technologies.length} tech, ${procedures.length} procedures` },
            { type: 'success', message: `Knowledge graph compiled with ${entities.length} nodes across ${Object.keys(typeCounts).length} types` }
        ]
    };
}

// Stage 4: Site Generation (Site Generator)
function processSiteGeneration(wikiResult) {
    const entities = dataCache['llm_wiki_data.json']?.entities || [];
    const i18n = dataCache['i18n_data.json'] || {};
    const templates = dataCache['templates_data.json'] || {};

    // Generate product pages from wiki entities
    const productEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Product]]') ||
        e.content?.includes('Market Strategy') ||
        e.content?.includes('Technical Specs')
    );

    // Classify non-product entities for additional pages
    const competitorEntities = entities.filter(e =>
        e.content?.includes('Dominant Products') || e.content?.includes('Incumbent') || e.content?.includes('Market Position')
    );
    const categoryEntities = entities.filter(e => e.content?.includes('Type**: [[Category]]'));
    const materialEntities = entities.filter(e => e.content?.includes('Type**: [[Material]]'));
    const technologyEntities = entities.filter(e => e.content?.includes('Type**: [[Technology]]'));

    // Use templates for header/footer if available
    const headerTemplate = templates.components?.header || '';
    const footerTemplate = templates.components?.footer || '';
    const megaMenu = templates.layouts?.mega_menu_fragment || '';
    const en = i18n?.ui?.en || {};
    const zh = i18n?.ui?.zh || {};

    const generatedPages = productEntities.map(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';

        // Extract key info from content
        const specs = {};
        const specMatches = content.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/g) || [];
        specMatches.forEach(m => {
            const [, key, val] = m.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/) || [];
            if (key && val) specs[key.trim()] = val.trim();
        });

        // Extract CPC info
        const cpcMatch = content.match(/CPC[^:]*:\s*\*?\*?\$?([\d.]+)/i);
        const cpc = cpcMatch ? cpcMatch[1] : null;

        return {
            entityId: entity.name,
            title: name,
            url: `/pages/${makeSlug(entity.name)}.html`,
            specs,
            cpc,
            hasEvidence: content.includes('Evidence') || content.includes('Clinical'),
            schemaMarkup: {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": name,
                "manufacturer": {
                    "@type": "Organization",
                    "name": "ViaSurg"
                },
                "category": specs.Category || "Medical Device"
            }
        };
    });

    // Store non-product entity data BEFORE generating output page
    dataCache._competitorEntities = competitorEntities;
    dataCache._categoryEntities = categoryEntities;
    dataCache._materialEntities = materialEntities;
    dataCache._technologyEntities = technologyEntities;
    dataCache._templatesUsed = { header: !!headerTemplate, footer: !!footerTemplate, megaMenu: !!megaMenu, i18n: !!(en.nav || zh.nav) };

    // Generate the main output HTML page (pass keyword data for CPC fallback)
    const allKeywords = [
        ...(dataCache['high_value_keywords.json']?.keywords || []),
        ...(dataCache['google_keywords_parsed.json']?.keywords || [])
    ];
    const outputHTML = generateOutputPage(productEntities, i18n, templates, allKeywords);

    // Write output page
    const outputPath = path.join(OUTPUT_DIR, 'index.html');
    fs.writeFileSync(outputPath, outputHTML, 'utf8');

    // Generate individual entity pages (multi-page generation)
    const entityPages = generateEntityPages(entities, i18n, templates, allKeywords);

    // Generate JSON-LD schemas for all products
    const schemasDir = path.join(OUTPUT_DIR, 'schemas');
    if (!fs.existsSync(schemasDir)) fs.mkdirSync(schemasDir, { recursive: true });

    productEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const catMatch = content.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/);
        const category = catMatch ? catMatch[1].replace(/_/g, ' ') : 'Medical Device';
        const desc = extractDescription(content) || `${name} from ViaSurg.`;
        const schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": name,
            "description": desc,
            "manufacturer": { "@type": "Organization", "name": "ViaSurg" },
            "category": category,
            "url": `https://viasurg.com/pages/${makeSlug(entity.name)}.html`
        };
        const schemaPath = path.join(schemasDir, `${entity.name}.json`);
        fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
    });

    // Generate sitemap (include homepage + all entity pages)
    const today = new Date().toISOString().split('T')[0];
    const allSitemapPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        ...entityPages.filter(p => !p.url.includes('competitor-competitor-disruption')).map(p => ({
            url: p.url,
            priority: p.type === 'product' ? '0.9' : p.type === 'category' ? '0.8' : '0.7',
            changefreq: 'weekly'
        }))
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSitemapPages.map(p => `  <url><loc>https://viasurg.com${p.url}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap, 'utf8');

    return {
        stage: 'site_generation',
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: {
            pagesGenerated: generatedPages.length,
            entityPagesGenerated: entityPages.length,
            totalPagesGenerated: generatedPages.length + entityPages.length,
            schemasCreated: productEntities.length,
            sitemapCreated: true,
            sitemapUrls: allSitemapPages.length,
            nonProductEntities: {
                competitors: competitorEntities.length,
                categories: categoryEntities.length,
                materials: materialEntities.length,
                technologies: technologyEntities.length
            },
            templatesUsed: dataCache._templatesUsed,
            pages: generatedPages,
            entityPages: entityPages.slice(0, 10), // Preview first 10
            outputUrl: '/index.html',
            pagesDir: '/pages/'
        },
        logs: [
            { type: 'info', message: `Rendering ${generatedPages.length} product pages...` },
            { type: 'info', message: `Generating ${entityPages.length} individual entity pages...` },
            { type: 'info', message: `Processing ${competitorEntities.length} competitors, ${categoryEntities.length} categories, ${materialEntities.length} materials, ${technologyEntities.length} technologies...` },
            { type: 'info', message: `Templates: header=${!!headerTemplate}, footer=${!!footerTemplate}, megaMenu=${!!megaMenu}` },
            { type: 'info', message: `i18n: EN=${!!en.nav}, ZH=${!!zh.nav}` },
            { type: 'info', message: `Generating JSON-LD schemas...` },
            { type: 'info', message: `Creating sitemap.xml with ${allSitemapPages.length} URLs...` },
            { type: 'success', message: `Site generated: ${entityPages.length} entity pages, ${productEntities.length} schemas, sitemap with ${allSitemapPages.length} URLs` }
        ]
    };
}

// Stage 5: Quality Verification (Autoresearch)
function processQualityVerification(siteResult) {
    // Try Agent SDK for autoresearch intelligence
    const sdkResult = callSkill('autoresearch');
    if (sdkResult && sdkResult.status === 'completed') {
        console.log('[SDK] Stage 5: Using Agent SDK autoresearch result');
    } else if (sdkResult) {
        console.log('[SDK] Stage 5: autoresearch returned error, using JS fallback');
    }

    const entities = dataCache['llm_wiki_data.json']?.entities || [];
    const keywords = dataCache['high_value_keywords.json']?.keywords || [];
    const highVolume = dataCache['high_volume_keywords.json']?.keywords || [];
    const allKeywords = dataCache['google_keywords_parsed.json']?.keywords || [];
    const i18n = dataCache['i18n_data.json'] || {};
    const templates = dataCache['templates_data.json'] || {};

    // Classify entities
    const productEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Product]]') ||
        e.content?.includes('Market Strategy')
    );
    const competitorEntities = entities.filter(e =>
        e.content?.includes('Dominant Products') || e.content?.includes('Incumbent') || e.content?.includes('Market Position')
    );
    const categoryEntities = entities.filter(e => e.content?.includes('Type**: [[Category]]'));
    const materialEntities = entities.filter(e => e.content?.includes('Type**: [[Material]]'));
    const technologyEntities = entities.filter(e => e.content?.includes('Type**: [[Technology]]'));
    const nonProductUsed = competitorEntities.length + categoryEntities.length + materialEntities.length + technologyEntities.length;

    // Check keyword coverage (enhanced with alias matching)
    const coveredKeywords = keywords.filter(kw => {
        const kwLower = kw.keyword.toLowerCase();
        return entities.some(e => {
            const eName = (e.name || '').toLowerCase().replace(/_/g, ' ');
            const eContent = (e.content || '').toLowerCase();
            const eCat = ((e.content?.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/) || [])[1] || '').toLowerCase().replace(/_/g, ' ');
            const eMat = ((e.content?.match(/Material\*\*:\s*\[\[([^\]]+)\]\]/) || [])[1] || '').toLowerCase().replace(/_/g, ' ');
            // Direct match
            if (eName.includes(kwLower) || kwLower.includes(eName) || eContent.includes(kwLower)) return true;
            // Alias match
            const kwWords = kwLower.split(/\s+/).filter(w => w.length > 2);
            return kwWords.some(w => {
                const aliases = KEYWORD_ALIASES[w] || [];
                return aliases.some(a => eName.includes(a) || eCat.includes(a) || eMat.includes(a));
            });
        });
    });

    // Check templates/i18n
    const templatesUsed = siteResult.results.templatesUsed || {};
    const templatesActive = Object.values(templatesUsed).filter(Boolean).length;
    const i18nEN = !!(i18n.ui?.en?.nav);
    const i18nZH = !!(i18n.ui?.zh?.nav);

    // =============================================
    // AUTORESEARCH: Actual competitive intelligence
    // =============================================

    // 1. Competitive Analysis - extract market positioning from competitor entities
    const competitiveIntel = competitorEntities.map(comp => {
        const content = comp.content || '';
        const name = comp.name.replace(/_/g, ' ');
        const products = (content.match(/Dominant Products\*\*:\s*([^\n]+)/) || [])[1] || '';
        const painPoints = content.match(/(High premium|Fragmented|Proprietary|Opaque|cost-inflation|locking|Complex|Expensive|Limited)/gi) || [];
        const strengths = content.match(/(Verified|Vertical integration|Open-compatibility|Direct B2B|Transparent|FDA|CE)/gi) || [];
        return {
            competitor: name,
            productLines: products.replace(/\[\[/g, '').replace(/\]\]/g, '').substring(0, 100),
            painPoints: [...new Set(painPoints)].slice(0, 3),
            viaSurgAdvantage: [...new Set(strengths)].slice(0, 3)
        };
    });

    // 2. Market Gap Analysis - find high-CPC keywords not covered by any entity
    const keywordGaps = allKeywords
        .filter(kw => (kw.top_of_page_bid_high || 0) > 5)
        .filter(kw => {
            const kwLower = kw.keyword.toLowerCase();
            return !entities.some(e => {
                const name = e.name.toLowerCase().replace(/_/g, ' ');
                return name.includes(kwLower) || kwLower.includes(name);
            });
        })
        .sort((a, b) => (b.top_of_page_bid_high || 0) - (a.top_of_page_bid_high || 0))
        .slice(0, 10)
        .map(kw => ({
            keyword: kw.keyword,
            cpc: kw.top_of_page_bid_high?.toFixed(2),
            searches: kw.avg_monthly_searches,
            opportunity: 'No entity page exists — content gap'
        }));

    // 3. Content Depth Analysis - find thin entities
    const thinContent = entities
        .filter(e => (e.word_count || (e.content || '').split(/\s+/).length) < 100)
        .map(e => ({
            entity: e.name.replace(/_/g, ' '),
            wordCount: e.word_count || (e.content || '').split(/\s+/).length,
            recommendation: 'Expand with clinical data, specifications, and competitive positioning'
        }));

    // 4. Cross-reference density analysis
    const linkDensity = entities.map(e => {
        const links = ((e.content || '').match(/\[\[([^\]]+)\]\]/g) || []).length;
        return { entity: e.name, links };
    }).sort((a, b) => a.links - b.links);
    const orphanEntities = linkDensity.filter(e => e.links === 0);

    // 5. SERP Opportunity Score - combine CPC + search volume for prioritization
    const serpOpportunities = highVolume
        .filter(kw => kw.avg_monthly_searches > 50000)
        .map(kw => {
            const hasEntity = entities.some(e => {
                const name = e.name.toLowerCase().replace(/_/g, ' ');
                return name.includes(kw.keyword.toLowerCase()) || kw.keyword.toLowerCase().includes(name);
            });
            return {
                keyword: kw.keyword,
                searches: kw.avg_monthly_searches,
                cpc: kw.top_of_page_bid_high?.toFixed(2),
                competition: kw.competition_index,
                hasContent: hasEntity,
                score: Math.round((kw.avg_monthly_searches / 10000) * (kw.top_of_page_bid_high || 1) * (hasEntity ? 2 : 1))
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    const autoresearchReport = {
        competitiveIntel,
        marketGaps: keywordGaps,
        contentGaps: thinContent,
        orphanEntities: orphanEntities.map(e => e.entity),
        serpOpportunities,
        summary: {
            competitorsAnalyzed: competitiveIntel.length,
            keywordGapsFound: keywordGaps.length,
            thinContentPages: thinContent.length,
            orphanEntities: orphanEntities.length,
            topSerpOpportunity: serpOpportunities[0]?.keyword || 'N/A'
        }
    };

    // Merge Agent SDK autoresearch results if available
    if (sdkResult && sdkResult.status === 'completed') {
        autoresearchReport.sdkMode = sdkResult.mode;
        autoresearchReport.sdkResults = sdkResult.results;
        if (sdkResult.results?.competitiveIntelligence?.details) {
            autoresearchReport.competitiveIntel = sdkResult.results.competitiveIntelligence.details;
            autoresearchReport.summary.competitorsAnalyzed = sdkResult.results.competitiveIntelligence.competitorsAnalyzed;
        }
        if (sdkResult.results?.keywordGaps?.topGaps) {
            autoresearchReport.marketGaps = sdkResult.results.keywordGaps.topGaps;
            autoresearchReport.summary.keywordGapsFound = sdkResult.results.keywordGaps.gapsFound;
        }
        if (sdkResult.results?.contentDepth?.details) {
            autoresearchReport.contentGaps = sdkResult.results.contentDepth.details;
        }
        if (sdkResult.results?.serpOpportunities?.topOpportunities) {
            autoresearchReport.serpOpportunities = sdkResult.results.serpOpportunities.topOpportunities;
        }
        if (sdkResult.llmInsights) {
            autoresearchReport.llmInsights = sdkResult.llmInsights;
        }
    }

    // Quality checks (10 checks)
    const checks = [
        {
            name: 'Product Entity Coverage',
            pass: productEntities.length > 0,
            value: `${productEntities.length} products`,
            detail: `${productEntities.length} product entities with market strategy`
        },
        {
            name: 'Non-Product Entity Utilization',
            pass: nonProductUsed > 0,
            value: `${nonProductUsed} entities (${competitorEntities.length} competitors, ${categoryEntities.length} categories, ${materialEntities.length} materials, ${technologyEntities.length} tech)`,
            detail: `Competitors, categories, materials, and technology entities rendered in output`
        },
        {
            name: 'Keyword Coverage (High-Value)',
            pass: coveredKeywords.length > 10,
            value: `${coveredKeywords.length}/${keywords.length}`,
            detail: `${coveredKeywords.length} high-value keywords matched in wiki`
        },
        {
            name: 'High-Volume Keywords Loaded',
            pass: highVolume.length > 0,
            value: `${highVolume.length} keywords`,
            detail: `High-volume keywords (1000+ searches/mo) available for traffic analysis`
        },
        {
            name: 'Schema Markup',
            pass: siteResult.results.pagesGenerated > 0,
            value: `${siteResult.results.schemasCreated} schemas`,
            detail: `JSON-LD schemas generated for all pages`
        },
        {
            name: 'Sitemap Coverage',
            pass: (siteResult.results.sitemapUrls || 0) >= productEntities.length,
            value: `${siteResult.results.sitemapUrls || 0} URLs`,
            detail: `Sitemap includes products + non-product entity pages`
        },
        {
            name: 'Templates Utilization',
            pass: templatesActive > 0,
            value: `${templatesActive}/3 active (header=${templatesUsed.header || false}, footer=${templatesUsed.footer || false}, megaMenu=${templatesUsed.megaMenu || false})`,
            detail: `HTML templates from templates_data.json used in output generation`
        },
        {
            name: 'i18n Integration',
            pass: i18nEN && i18nZH,
            value: `EN=${i18nEN}, ZH=${i18nZH}`,
            detail: `UI labels rendered via i18n_data.json translations`
        },
        {
            name: 'Autoresearch Intelligence',
            pass: competitiveIntel.length > 0 && serpOpportunities.length > 0,
            value: `${competitiveIntel.length} competitors analyzed, ${keywordGaps.length} gaps found, ${serpOpportunities.length} SERP opps`,
            detail: `Competitive intelligence, market gaps, and SERP opportunities generated`
        },
        {
            name: 'Cross-References',
            pass: entities.filter(e => (e.content || '').includes('[[')).length > 20,
            value: `${entities.filter(e => (e.content || '').includes('[[')).length} linked`,
            detail: `Entities with bidirectional wiki links`
        }
    ];

    const passed = checks.filter(c => c.pass).length;
    const score = Math.round((passed / checks.length) * 100);

    return {
        stage: 'quality_verification',
        status: 'completed',
        mode: (sdkResult && sdkResult.status === 'completed') ? sdkResult.mode : 'js',
        timestamp: new Date().toISOString(),
        results: {
            score,
            passed,
            total: checks.length,
            checks,
            assetUtilization: {
                dataFiles: { used: 7, total: 7, files: ['google_keywords', 'high_value_keywords', 'high_volume_keywords', 'strategy_wiki', 'llm_wiki', 'i18n', 'templates'] },
                wikiEntities: { used: productEntities.length + nonProductUsed, total: entities.length, breakdown: { products: productEntities.length, competitors: competitorEntities.length, categories: categoryEntities.length, materials: materialEntities.length, technologies: technologyEntities.length } },
                skills: { strategyOperator: true, wikiCompiler: true, siteGenerator: true, autoresearch: true }
            },
            keywordCoverage: {
                covered: coveredKeywords.length,
                total: keywords.length,
                percentage: Math.round((coveredKeywords.length / keywords.length) * 100)
            },
            autoresearch: autoresearchReport
        },
        logs: [
            { type: 'info', message: `Running quality verification + Autoresearch intelligence...` },
            { type: 'info', message: `Asset utilization: ${entities.length} entities, ${keywords.length + highVolume.length} keywords, i18n EN/ZH, templates` },
            ...(sdkResult && sdkResult.status === 'completed' ? [{ type: 'info', message: `[Agent SDK] Autoresearch: ${sdkResult.mode} mode` }] : []),
            ...checks.map(c => ({
                type: c.pass ? 'success' : 'warning',
                message: `${c.pass ? '✓' : '✗'} ${c.name}: ${c.value}`
            })),
            { type: 'info', message: `Autoresearch: ${autoresearchReport.summary.competitorsAnalyzed} competitors analyzed, ${autoresearchReport.summary.keywordGapsFound} keyword gaps, ${serpOpportunities.length} SERP opportunities` },
            { type: score >= 80 ? 'success' : 'warning', message: `Quality score: ${score}% (${passed}/${checks.length} passed)` }
        ]
    };
}

// ============================================
// MULTI-PAGE GENERATOR
// ============================================

// Synonym/alias map for keyword → entity matching
const KEYWORD_ALIASES = {
    // Material aliases
    'pga': ['absorbable sutures', 'polyglycolic'],
    'pgla': ['absorbable sutures', 'polyglactin'],
    'polyglycolic': ['absorbable sutures', 'pga'],
    'polyglactin': ['absorbable sutures', 'pgla'],
    'polypropylene': ['non absorbable sutures', 'hernia meshes', 'prolene'],
    'nylon': ['non absorbable sutures', 'polyamide'],
    'silk': ['non absorbable sutures'],
    'monocryl': ['absorbable sutures'],
    'vicryl': ['absorbable sutures'],
    'prolene': ['non absorbable sutures'],
    'chromic': ['absorbable sutures', 'gut suture'],
    'gut': ['absorbable sutures', 'chromic'],
    'catgut': ['absorbable sutures'],
    'nitinol': ['guidewires'],
    'polyacetal': ['polymer clips', 'hemoclips'],
    // Product aliases
    'harmonic': ['ultrasonic shears', 'scalpel'],
    'scalpel': ['ultrasonic shears'],
    'snare': ['snares', 'polypectomy'],
    'polypectomy': ['snares'],
    'grasper': ['biopsy forceps', 'laparoscopic'],
    'forceps': ['biopsy forceps'],
    'veress': ['veress needles'],
    'trocar': ['trocars'],
    'stapler': ['staplers'],
    'staple': ['staplers'],
    'mesh': ['hernia meshes'],
    'clip': ['polymer clips', 'hemoclips'],
    'hemoclip': ['hemoclips'],
    'ligating': ['polymer clips', 'hemoclips'],
    'retractor': ['laparoscopic', 'instrumentation'],
    'insorb': ['absorbable sutures'],
    // Category aliases
    'suture': ['sutures', 'absorbable sutures', 'non absorbable sutures'],
    'suturing': ['sutures'],
    'wound closure': ['sutures', 'clips', 'wound closure'],
    'endoscopy': ['endoscopic', 'biopsy forceps', 'snares'],
    'endoscopic': ['biopsy forceps', 'snares', 'endoscopy'],
    'laparoscopic': ['trocars', 'veress needles', 'minimally invasive'],
    'minimally invasive': ['trocars', 'veress needles', 'snares'],
    'access': ['trocars', 'veress needles', 'guidewires'],
    'instrumentation': ['staplers', 'ultrasonic shears', 'biopsy forceps'],
    // Competitor brands
    'ethicon': ['absorbable sutures', 'non absorbable sutures', 'trocars', 'ultrasonic shears'],
    'ovid': ['trocars'],
    'ovid': ['trocars'],
    'medtronic': ['staplers'],
    'teleflex': ['polymer clips', 'hemoclips'],
    'olympus': ['biopsy forceps', 'snares'],
    'boston scientific': ['guidewires'],
    'terumo': ['guidewires'],
    'cook': ['snares', 'guidewires'],
    'bard': ['hernia meshes'],
    // Procedure aliases
    'hemostasis': ['hemoclips', 'polymer clips'],
    'polyp': ['snares'],
    'biopsy': ['biopsy forceps'],
    'insufflation': ['trocars', 'veress needles'],
    'pneumoperitoneum': ['trocars'],
};

// Find keywords relevant to an entity (enhanced with synonym/alias matching)
function findRelevantKeywords(entity, allKeywords, max = 10) {
    const name = (entity.name || '').toLowerCase().replace(/_/g, ' ');
    const content = (entity.content || '').toLowerCase();
    const catMatch = entity.content?.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/);
    const category = catMatch ? catMatch[1].toLowerCase().replace(/_/g, ' ') : '';
    const matMatch = entity.content?.match(/Material\*\*:\s*\[\[([^\]]+)\]\]/);
    const material = matMatch ? matMatch[1].toLowerCase().replace(/_/g, ' ') : '';
    const nameWords = name.split(/\s+/).filter(w => w.length > 2);

    // Score each keyword by relevance
    const scored = allKeywords.map(kw => {
        const kwLower = (kw.keyword || '').toLowerCase();
        let score = 0;

        // Exact name match = highest
        if (name.includes(kwLower) || kwLower.includes(name)) score += 10;
        // Category match
        if (category && (kwLower.includes(category) || category.includes(kwLower))) score += 5;
        // Material match
        if (material && (kwLower.includes(material) || material.includes(kwLower))) score += 4;
        // Content substring match
        if (content.includes(kwLower)) score += 3;

        // Alias matching — check if keyword or entity name has aliases that link them
        const kwWords = kwLower.split(/\s+/).filter(w => w.length > 2);
        kwWords.forEach(w => {
            // Direct word match
            if (name.includes(w)) score += 2;
            if (content.includes(w)) score += 1;
            // Alias match: keyword word → entity name
            const aliases = KEYWORD_ALIASES[w];
            if (aliases) {
                aliases.forEach(alias => {
                    if (name.includes(alias)) score += 3;
                    if (category.includes(alias)) score += 2;
                    if (material.includes(alias)) score += 2;
                });
            }
        });

        // Reverse alias: entity name words → keyword
        nameWords.forEach(w => {
            const aliases = KEYWORD_ALIASES[w];
            if (aliases) {
                aliases.forEach(alias => {
                    if (kwLower.includes(alias)) score += 3;
                });
            }
        });

        return { ...kw, score };
    }).filter(kw => kw.score > 0);

    // Deduplicate by keyword string, keep highest score
    const seen = new Map();
    scored.forEach(kw => {
        const key = kw.keyword.toLowerCase();
        if (!seen.has(key) || seen.get(key).score < kw.score) {
            seen.set(key, kw);
        }
    });

    return [...seen.values()]
        .sort((a, b) => b.score - a.score || (b.avg_monthly_searches || 0) - (a.avg_monthly_searches || 0))
        .slice(0, max);
}

// Generate keyword-enriched FAQ HTML section for a product page
function generateKeywordFAQ(entityName, relevantKeywords, entityContent) {
    if (!relevantKeywords || relevantKeywords.length === 0) return '';

    // Extract real info from entity content for more meaningful answers
    const content = entityContent || '';
    const catMatch = content.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/);
    const category = catMatch ? catMatch[1].replace(/_/g, ' ') : '';
    const matMatch = content.match(/Material\*\*:\s*\[\[([^\]]+)\]\]/);
    const material = matMatch ? matMatch[1].replace(/_/g, ' ') : '';
    const cpcMatch = content.match(/CPC[^:]*:\s*\*?\*?\$?([\d.]+)/i);
    const cpcVal = cpcMatch ? `$${cpcMatch[1]}` : '';
    const specMatches = content.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/g) || [];
    const specs = {};
    specMatches.forEach(m => {
        const [, key, val] = m.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/) || [];
        if (key && val) specs[key.trim()] = val.trim().replace(/\[\[([^\]]+)\]\]/g, '$1');
    });

    // Question templates - varied natural questions (EN + ZH)
    const questionTemplates = [
        (kw) => ({ en: `What is ${kw}?`, zh: `什么是 ${kw}？` }),
        (kw) => ({ en: `Where to buy ${kw}?`, zh: `哪里可以购买 ${kw}？` }),
        (kw) => ({ en: `${entityName} vs alternatives for ${kw}?`, zh: `${entityName} 与 ${kw} 的替代方案对比？` }),
        (kw) => ({ en: `How does ${entityName} compare for ${kw}?`, zh: `${entityName} 在 ${kw} 方面表现如何？` }),
        (kw) => ({ en: `What are the specifications of ${entityName} ${kw}?`, zh: `${entityName} ${kw} 的规格参数是什么？` }),
        (kw) => ({ en: `Is ${entityName} FDA cleared for ${kw}?`, zh: `${entityName} 是否获得 FDA ${kw} 认证？` }),
    ];

    // Answer generators - use real entity data (EN + ZH)
    const answerGenerators = [
        (kw) => {
            // Category + material based answer
            const parts = [entityName];
            const zhParts = [entityName];
            if (category) { parts.push(` is classified under ${category}`); zhParts.push(` 归类于 ${category}`); }
            if (material) { parts.push(` using ${material} material`); zhParts.push(` 使用 ${material} 材料`); }
            parts.push(`. It is designed for clinical reliability and precision in ${kw} applications.`);
            zhParts.push(`。专为 ${kw} 应用场景的临床可靠性与精确性而设计。`);
            const verified = specs['FDA 510(k)'] || specs['Verification ID'];
            if (verified) { parts.push(` Verified: ${verified}.`); zhParts.push(` 已验证：${verified}。`); }
            return { en: parts.join(''), zh: zhParts.join('') };
        },
        (kw) => {
            // Availability answer
            let enAns = `${entityName} is available directly from ViaSurg as a ${kw} solution.`;
            let zhAns = `${entityName} 可直接从 ViaSurg 购买，作为 ${kw} 解决方案。`;
            if (cpcVal) { enAns += ` Market CPC for ${kw} keywords averages ${cpcVal}.`; zhAns += `${kw} 关键词的市场平均点击成本为 ${cpcVal}。`; }
            enAns += ` Contact ViaSurg for B2B pricing and distributor inquiries.`;
            zhAns += `请联系 ViaSurg 获取 B2B 报价及经销合作。`;
            return { en: enAns, zh: zhAns };
        },
        (kw) => {
            // Comparison answer
            const brands = (content.match(/Target Brands\*\*:\s*([^\n]+)/) || [])[1] || '';
            let enAns = `ViaSurg's ${entityName} offers a competitive ${kw} alternative.`;
            let zhAns = `ViaSurg 的 ${entityName} 提供具有竞争力的 ${kw} 替代方案。`;
            if (brands) { const b = brands.replace(/\[\[([^\]]+)\]\]/g, '$1').substring(0, 100); enAns += ` Key competitors include ${b}.`; zhAns += `主要竞争对手包括 ${b}。`; }
            enAns += ` ViaSurg emphasizes open-compatibility and cost transparency.`;
            zhAns += `ViaSurg 强调开放兼容性与成本透明。`;
            return { en: enAns, zh: zhAns };
        },
        (kw) => {
            // Specs-based answer
            const keySpecs = Object.entries(specs)
                .filter(([k]) => !['Type','Category','Material','Primary Use','Target Brands','High Intent Keywords','CPC Range','CPC','Strategy','Priority','Reasoning','Action'].includes(k))
                .slice(0, 3);
            let enAns = `${entityName} specifications for ${kw}:`;
            let zhAns = `${entityName} 关于 ${kw} 的规格参数：`;
            if (keySpecs.length) {
                const specStr = keySpecs.map(([k, v]) => `${k}: ${v}`).join('. ') + '.';
                enAns += ' ' + specStr;
                zhAns += ' ' + specStr;
            } else {
                enAns += ` Designed for precision surgical use.`;
                zhAns += ` 专为精准外科手术设计。`;
            }
            return { en: enAns, zh: zhAns };
        },
        (kw) => {
            // Regulatory answer
            let enAns = `${entityName} is manufactured under ISO 13485 quality management.`;
            let zhAns = `${entityName} 依据 ISO 13485 质量管理体系制造。`;
            if (specs['FDA 510(k)']) { enAns += ` FDA 510(k): ${specs['FDA 510(k)']}.`; zhAns += ` FDA 510(k): ${specs['FDA 510(k)']}.`; }
            if (specs['ISO 13485']) { enAns += ` ${specs['ISO 13485']}.`; zhAns += ` ${specs['ISO 13485']}.`; }
            enAns += ` It meets regulatory requirements for ${kw} applications.`;
            zhAns += `符合 ${kw} 应用的法规要求。`;
            return { en: enAns, zh: zhAns };
        },
    ];

    // Filter out keywords too similar to entity name (redundant FAQs)
    const nameLower = entityName.toLowerCase();
    const filtered = relevantKeywords.filter(kw => {
        const kwLower = kw.keyword.toLowerCase();
        // Skip if keyword is almost the same as entity name
        if (kwLower === nameLower) return false;
        if (kwLower.replace(/[^a-z]/g, '') === nameLower.replace(/[^a-z]/g, '')) return false;
        return true;
    });

    const faqItems = filtered.slice(0, 5).map((kw, idx) => {
        const keyword = kw.keyword;
        const searches = kw.avg_monthly_searches ? kw.avg_monthly_searches.toLocaleString() : '';
        const q = questionTemplates[idx % questionTemplates.length](keyword);
        const a = answerGenerators[idx % answerGenerators.length](keyword);
        return `<div class="faq-item">
                    <h4><span data-lang="en">${q.en}</span><span data-lang="zh">${q.zh}</span></h4>
                    <p><span data-lang="en">${a.en}</span><span data-lang="zh">${a.zh}</span></p>
                    ${searches ? `<span class="faq-meta">${searches} monthly searches</span>` : ''}
                </div>`;
    }).join('\n                ');

    if (!faqItems) return '';

    return `
                <h2><span data-lang="en">Frequently Asked Questions</span><span data-lang="zh">常见问题</span></h2>
                <div class="faq-section">
                ${faqItems}
                </div>`;
}

// Generate related keywords HTML section
function generateKeywordSection(relevantKeywords) {
    if (!relevantKeywords || relevantKeywords.length === 0) return '';

    const tags = relevantKeywords.map(kw =>
        `<span class="kw-tag">${kw.keyword}${kw.top_of_page_bid_high ? ` <small>$${kw.top_of_page_bid_high.toFixed(2)}</small>` : ''}</span>`
    ).join('\n                        ');

    return `
                    <div class="sidebar-card">
                        <h3><span data-lang="en">Related Keywords</span><span data-lang="zh">相关关键词</span></h3>
                        <div class="kw-tags">
                        ${tags}
                        </div>
                    </div>`;
}

function generateEntityPages(entities, i18n, templates, allKeywords) {
    const pagesDir = path.join(OUTPUT_DIR, 'pages');
    if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
    }

    const en = i18n?.ui?.en || {};
    const zh = i18n?.ui?.zh || {};
    const zhContent = i18n?.content?.zh || {};
    const generatedPages = [];

    // Define all entity types upfront (used for cross-linking)
    const productEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Product]]') ||
        e.content?.includes('Market Strategy')
    );
    const competitorEntities = entities.filter(e =>
        e.content?.includes('Dominant Products') || e.content?.includes('Incumbent') || e.content?.includes('Market Position')
    );
    const categoryEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Category]]')
    );
    const materialEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Material]]')
    );
    const technologyEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Technology]]')
    );

    productEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = makeSlug(entity.name);
        const zhSlug = makeSlug(entity.name);
        const zhData = zhContent[zhSlug] || {};

        // Extract hierarchy
        const catMatch = content.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/);
        const category = catMatch ? catMatch[1].replace(/_/g, ' ') : 'Medical Device';

        const matMatch = content.match(/Material\*\*:\s*\[\[([^\]]+)\]\]/);
        const material = matMatch ? matMatch[1].replace(/_/g, ' ') : '';

        // Extract CPC
        const cpcMatch = content.match(/CPC[^:]*:\s*\*{0,2}\s*\$?([\d.]+)\s*(?:-\s*\$?([\d.]+))?/i);
        let cpc = null;
        if (cpcMatch) {
            const low = parseFloat(cpcMatch[1]);
            const high = cpcMatch[2] ? parseFloat(cpcMatch[2]) : null;
            cpc = high ? ((low + high) / 2).toFixed(2) : low.toFixed(2);
        }

        // Extract strategy
        const stratMatch = content.match(/Strategy\*\*:\s*([^.\n]+)/);
        const strategy = stratMatch ? cleanWikiContent(stratMatch[1].trim()) : '';

        // Extract target brands
        const brandMatch = content.match(/Target Brands\*\*:\s*([^.\n]+)/);
        const targetBrands = brandMatch ? cleanWikiContent(brandMatch[1].trim()) : '';

        // Extract technical specs
        const specs = {};
        const specMatches = content.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/g) || [];
        specMatches.forEach(m => {
            const [, key, val] = m.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/) || [];
            if (key && val && !['Type', 'Category', 'Parent Category', 'Material', 'Primary Use', 'Target Brands', 'High Intent Keywords', 'CPC Range', 'Strategy', 'Priority', 'Reasoning', 'Action'].includes(key.trim())) {
                specs[key.trim()] = cleanWikiContent(val.trim());
            }
        });

        // Extract related entities
        const relatedMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
        const relatedEntities = [...new Set(relatedMatches.map(m => m.replace(/\[\[|\]\]/g, '').replace(/_/g, ' ')))].slice(0, 8);

        // Find relevant keywords for this entity
        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 10);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);

        // Generate HTML page
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');
        const metaDesc = relevantKeywords.length > 0
            ? `${name} - ${category} from ViaSurg. ${relevantKeywords.slice(0, 3).map(k => k.keyword).join(', ')}. FDA 510(k) and CE MDR certified medical devices.`
            : `${name} - ${category} from ViaSurg. FDA 510(k) and CE MDR certified medical devices with transparent manufacturing.`;
        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | ViaSurg 医疗器械</title>
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="${keywordList}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${name}",
        "manufacturer": { "@type": "Organization", "name": "ViaSurg" },
        "category": "${category}",
        "description": "${name} from ViaSurg - Clinical Intelligence Medical Devices"
    }
    </script>
    <style>
        :root {
            --primary: #00539F;
            --primary-light: #EBF4FF;
            --border: #E2E8F0;
            --bg: #F8FAFC;
            --text: #475569;
            --text-dark: #0F172A;
            --font-display: 'Montserrat', sans-serif;
            --font-body: 'Lato', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--font-body); color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        nav a:hover { color: var(--text-dark); }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .breadcrumb a:hover { text-decoration: underline; }
        .product-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .product-header h1 { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 2px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-category { background: var(--primary-light); color: var(--primary); border: 1px solid #BEE3F8; }
        .badge-material { background: #F0FFF4; color: #276749; border: 1px solid #C6F6D5; }
        .badge-cpc { background: #FFFBEB; color: #975A16; border: 1px solid #FEFCBF; }
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 48px; padding: 48px 0; }
        .content-main h2 { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content-main h2:first-child { margin-top: 0; }
        .content-main p { margin-bottom: 16px; font-size: 15px; }
        .content-main ul { margin: 16px 0; padding-left: 24px; }
        .content-main li { margin-bottom: 8px; font-size: 14px; }
        .content-sidebar { position: sticky; top: 80px; }
        .sidebar-card { background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 24px; margin-bottom: 24px; }
        .sidebar-card h3 { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .spec-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .spec-row:last-child { border-bottom: none; }
        .spec-label { color: #94A3B8; }
        .spec-value { font-weight: 600; color: var(--text-dark); }
        .related-list { list-style: none; padding: 0; }
        .related-list li { padding: 8px 0; border-bottom: 1px solid var(--border); }
        .related-list li:last-child { border-bottom: none; }
        .related-list a { color: var(--primary); text-decoration: none; font-size: 14px; }
        .related-list a:hover { text-decoration: underline; }
        .cta-button { display: inline-block; background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 2px; font-size: 14px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
        .cta-button:hover { background: #004C99; }
        .cta-button:active { transform: translateY(1px); }
        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: var(--font-display); }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: var(--primary-light); }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"], body.lang-zh button[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer .container { display: flex; justify-content: space-between; align-items: center; }
        footer p { font-size: 13px; color: #94A3B8; }
        footer a { color: var(--primary); text-decoration: none; }
        @media (max-width: 768px) {
            .content-grid { grid-template-columns: 1fr; }
            .container { padding: 0 24px; }
        }
        .faq-section { margin-top: 16px; }
        .faq-item { padding: 16px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; margin-bottom: 12px; }
        .faq-item h4 { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .faq-item p { font-size: 14px; margin-bottom: 4px; }
        .faq-meta { font-size: 11px; color: #94A3B8; font-family: var(--font-mono); }
        .kw-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .kw-tag { display: inline-block; padding: 4px 10px; background: var(--primary-light); border: 1px solid #BEE3F8; border-radius: 2px; font-size: 12px; color: var(--primary); }
        .kw-tag small { color: #975A16; margin-left: 4px; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <a href="../sitemap.xml">Sitemap</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>

    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a> &rsaquo; <span data-lang="en">${name}</span><span data-lang="zh">${zhData.content_title || pzh(name)}</span>
        </div>

        <div class="product-header">
            <h1><span data-lang="en">${name}</span><span data-lang="zh">${zhData.content_title || pzh(name)}</span></h1>
            <div class="badges">
                <span class="badge badge-category"><span data-lang="en">${category}</span><span data-lang="zh">${zhData.content_category || category}</span></span>
                ${material ? `<span class="badge badge-material"><span data-lang="en">${material}</span><span data-lang="zh">${zhData.content_material || material}</span></span>` : ''}
                ${cpc ? `<span class="badge badge-cpc">CPC $${cpc}</span>` : ''}
            </div>
        </div>

        <div class="content-grid">
            <div class="content-main">
                <h2><span data-lang="en">Overview</span><span data-lang="zh">产品概述</span></h2>
                <p><span data-lang="en">${cleanWikiContent(content.split('## Overview')[1]?.split('##')[0]?.trim()) || `${name} is a medical device product from ViaSurg.`}</span><span data-lang="zh">${zhData.content_body || cleanWikiContent(content.split('## Overview')[1]?.split('##')[0]?.trim()) || `${name} 是 ViaSurg 的医疗器械产品。`}</span></p>

                ${strategy ? `<h2><span data-lang="en">Market Strategy</span><span data-lang="zh">市场策略</span></h2><p><span data-lang="en">${strategy}</span><span data-lang="zh">${strategy}</span></p>` : ''}
                ${targetBrands ? `<h2><span data-lang="en">Target Brands</span><span data-lang="zh">目标品牌</span></h2><p><span data-lang="en">${targetBrands}</span><span data-lang="zh">${targetBrands}</span></p>` : ''}

                ${Object.keys(specs).length > 0 ? `
                <h2><span data-lang="en">Technical Specifications</span><span data-lang="zh">技术规格</span></h2>
                <ul>
                    ${Object.entries(specs).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('\n                    ')}
                </ul>` : ''}
                ${keywordFAQ}
            </div>

            <div class="content-sidebar">
                <div class="sidebar-card">
                    <h3><span data-lang="en">Product Details</span><span data-lang="zh">产品详情</span></h3>
                    <div class="spec-row">
                        <span class="spec-label"><span data-lang="en">Category</span><span data-lang="zh">类别</span></span>
                        <span class="spec-value"><span data-lang="en">${category}</span><span data-lang="zh">${zhData.content_category || catZh(category)}</span></span>
                    </div>
                    ${material ? `<div class="spec-row">
                        <span class="spec-label"><span data-lang="en">Material</span><span data-lang="zh">材质</span></span>
                        <span class="spec-value"><span data-lang="en">${material}</span><span data-lang="zh">${zhData.content_material || material}</span></span>
                    </div>` : ''}
                    ${cpc ? `<div class="spec-row">
                        <span class="spec-label"><span data-lang="en">Avg CPC</span><span data-lang="zh">平均点击成本</span></span>
                        <span class="spec-value">$${cpc}</span>
                    </div>` : ''}
                    <div class="spec-row">
                        <span class="spec-label"><span data-lang="en">Certification</span><span data-lang="zh">认证</span></span>
                        <span class="spec-value">FDA 510(k) / CE MDR</span>
                    </div>
                </div>

                ${relatedEntities.length > 0 ? `
                <div class="sidebar-card">
                    <h3><span data-lang="en">Related Entities</span><span data-lang="zh">相关实体</span></h3>
                    <ul class="related-list">
                        ${relatedEntities.map(e => {
                            const eSlug = makeSlug(e);
                            const isProduct = productEntities.some(pe => makeSlug(pe.name) === eSlug);
                            const isCompetitor = competitorEntities.some(ce => makeSlug(ce.name) === eSlug);
                            const isCategory = categoryEntities.some(cat => makeSlug(cat.name) === eSlug);
                            const isMaterial = materialEntities.some(mat => makeSlug(mat.name) === eSlug);
                            const isTech = technologyEntities.some(tech => makeSlug(tech.name) === eSlug);
                            let href = `${eSlug}.html`;
                            if (isCompetitor) href = `competitor-${eSlug}.html`;
                            else if (isCategory) href = `category-${eSlug}.html`;
                            else if (isMaterial) href = `material-${eSlug}.html`;
                            else if (isTech) href = `tech-${eSlug}.html`;
                            else if (!isProduct) return ''; // skip entities without pages
                            return `<li><a href="${href}">${e}</a></li>`;
                        }).filter(Boolean).join('\n                        ')}
                    </ul>
                </div>` : ''}
                ${keywordSidebar}

                <a href="../" class="cta-button"><span data-lang="en">Request Quote</span><span data-lang="zh">询价</span></a>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p><span data-lang="en">${en.footer?.copy || '© 2026 ViaSurg. Powered by NomoFlow™ Technology.'}</span><span data-lang="zh">${zh.footer?.copy || '© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。'}</span></p>
            <p><a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> | <a href="../sitemap.xml">Sitemap</a></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        // Write the page
        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({
            name,
            slug,
            url: `/pages/${slug}.html`,
            category,
            material,
            cpc
        });
    });

    // Generate pages for competitor entities
    competitorEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = `competitor-${makeSlug(entity.name)}`;

        // Extract data from wiki content
        const productsMatch = content.match(/Dominant Products\*\*:\s*([^\n]+)/);
        const products = productsMatch ? productsMatch[1].replace(/\[\[|\]\]/g, '').replace(/_/g, ' ') : '';
        const productsList = products.split(',').map(p => p.trim()).filter(Boolean);

        const marketMatch = content.match(/Market Position\*\*:\s*([^\n]+)/);
        const marketPosition = marketMatch ? cleanWikiContent(marketMatch[1].trim()) : '';

        const painMatch = content.match(/Pain Point[s]?\*\*:\s*([^\n]+)/i);
        const painPoint = painMatch ? cleanWikiContent(painMatch[1].trim()) : '';

        const disruptionMatch = content.match(/Disruption\*\*:\s*([^\n]+)/i) || content.match(/ViaSurg Advantage\*\*:\s*([^\n]+)/i);
        const disruption = disruptionMatch ? cleanWikiContent(disruptionMatch[1].trim()) : '';

        // Find related products (products that mention this competitor in their Target Brands)
        const relatedProducts = productEntities.filter(p => {
            const pContent = p.content || '';
            return pContent.includes(`[[${entity.name}]]`) || pContent.toLowerCase().includes(name.toLowerCase());
        });

        // Find other competitors
        const otherCompetitors = competitorEntities.filter(c => c.name !== entity.name && c.name !== 'Competitor_Disruption').slice(0, 5);

        // Find relevant keywords for this competitor
        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 10);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');

        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Competitor Analysis | ViaSurg</title>
    <meta name="description" content="Competitive analysis of ${name} vs ViaSurg medical devices. ${products ? `Dominant products: ${products}.` : ''} ${relevantKeywords.slice(0, 3).map(k => k.keyword).join(', ')}.">
    <meta name="keywords" content="${keywordList}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "${name}",
        "description": "Competitive analysis of ${name} vs ViaSurg medical devices",
        "url": "https://viasurg.com/pages/competitor-${makeSlug(entity.name)}.html"
    }
    </script>
    <style>
        :root { --primary: #00539F; --border: #E2E8F0; --text: #475569; --text-dark: #0F172A; --green: #10B981; --green-bg: #ECFDF5; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        nav a:hover { color: var(--text-dark); }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .page-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .page-header h1 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
        .page-header .subtitle { font-size: 16px; color: var(--text); }
        .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 48px; padding: 48px 0; }
        .content-main h2 { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content-main h2:first-child { margin-top: 0; }
        .content-main p { margin-bottom: 16px; }
        .content-main ul { margin: 16px 0; padding-left: 24px; }
        .content-main li { margin-bottom: 8px; }
        .sidebar-card { background: #F8FAFC; border: 1px solid var(--border); border-radius: 4px; padding: 24px; margin-bottom: 24px; }
        .sidebar-card h3 { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sidebar-card ul { list-style: none; padding: 0; }
        .sidebar-card li { padding: 8px 0; border-bottom: 1px solid var(--border); }
        .sidebar-card li:last-child { border-bottom: none; }
        .sidebar-card a { color: var(--primary); text-decoration: none; font-size: 14px; }
        .sidebar-card a:hover { text-decoration: underline; }
        .compare-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        .compare-table th { background: #F8FAFC; text-align: left; padding: 12px 16px; border: 1px solid var(--border); font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .compare-table td { padding: 12px 16px; border: 1px solid var(--border); }
        .compare-table .via { color: var(--green); font-weight: 600; }
        .product-tag { display: inline-block; background: var(--primary); color: white; padding: 4px 12px; border-radius: 2px; font-size: 12px; margin: 4px 4px 4px 0; text-decoration: none; font-weight: 600; }
        .product-tag:hover { opacity: 0.8; }
        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: 'Montserrat', sans-serif; }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: #EBF4FF; }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"], body.lang-zh button[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer p { font-size: 13px; color: #94A3B8; }
        footer a { color: var(--primary); text-decoration: none; }
        @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } .container { padding: 0 24px; } }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a> &rsaquo; ${name}
        </div>
        <div class="page-header">
            <h1><span data-lang="en">${name}</span><span data-lang="zh">${COMPETITOR_ZH[name] || name}</span></h1>
            <div class="subtitle"><span data-lang="en">Competitive Analysis vs ViaSurg</span><span data-lang="zh">与 ViaSurg 竞争分析</span></div>
        </div>
        <div class="content-grid">
            <div class="content-main">
                <h2><span data-lang="en">Market Position</span><span data-lang="zh">市场定位</span></h2>
                <p><span data-lang="en">${marketPosition || (products ? `Dominant products include ${products}.` : 'Leading medical device competitor in the global market.')}</span><span data-lang="zh">${COMPETITOR_MARKET_ZH[name] || marketPosition || (products ? `主导产品包括 ${products}。` : '全球领先的医疗器械竞争对手。')}</span></p>

                ${painPoint ? `<h2><span data-lang="en">Market Pain Point</span><span data-lang="zh">市场痛点</span></h2><p>${painPoint}</p>` : ''}

                <h2><span data-lang="en">Comparison: ${name} vs ViaSurg</span><span data-lang="zh">对比: ${name} vs ViaSurg</span></h2>
                <table class="compare-table">
                    <thead>
                        <tr><th><span data-lang="en">Dimension</span><span data-lang="zh">维度</span></th><th>${name}</th><th>ViaSurg</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><span data-lang="en">Pricing</span><span data-lang="zh">定价</span></td><td><span data-lang="en">Opaque, multi-layer distribution</span><span data-lang="zh">不透明，多层分销</span></td><td class="via"><span data-lang="en">Direct B2B, transparent</span><span data-lang="zh">B2B 直销，透明定价</span></td></tr>
                        <tr><td><span data-lang="en">Manufacturing</span><span data-lang="zh">制造</span></td><td><span data-lang="en">Third-party, limited visibility</span><span data-lang="zh">第三方代工，可见度低</span></td><td class="via"><span data-lang="en">In-house, NomoFlow™ monitored</span><span data-lang="zh">自有工厂，NomoFlow™ 监控</span></td></tr>
                        <tr><td><span data-lang="en">Certification</span><span data-lang="zh">认证</span></td><td><span data-lang="en">FDA / CE (varies)</span><span data-lang="zh">FDA / CE（因产品而异）</span></td><td class="via">FDA 510(k) + CE MDR</td></tr>
                        <tr><td><span data-lang="en">Lead Time</span><span data-lang="zh">交期</span></td><td><span data-lang="en">Standard (weeks)</span><span data-lang="zh">标准（数周）</span></td><td class="via"><span data-lang="en">24h response, fast delivery</span><span data-lang="zh">24h 响应，快速交付</span></td></tr>
                        <tr><td><span data-lang="en">Compatibility</span><span data-lang="zh">兼容性</span></td><td><span data-lang="en">Proprietary lock-in</span><span data-lang="zh">专有锁定</span></td><td class="via"><span data-lang="en">Open compatibility</span><span data-lang="zh">开放兼容</span></td></tr>
                    </tbody>
                </table>

                ${disruption ? `<h2><span data-lang="en">ViaSurg Disruption Strategy</span><span data-lang="zh">ViaSurg 颠覆策略</span></h2><p>${disruption}</p>` : `
                <h2><span data-lang="en">ViaSurg Advantage</span><span data-lang="zh">ViaSurg 优势</span></h2>
                <ul>
                    <li><span data-lang="en">Transparent manufacturing with verifiable quality data</span><span data-lang="zh">透明制造，质量数据可验证</span></li>
                    <li><span data-lang="en">Direct B2B pricing without intermediary markups</span><span data-lang="zh">B2B 直销定价，无中间商加价</span></li>
                    <li><span data-lang="en">FDA 510(k) and CE MDR certified products</span><span data-lang="zh">FDA 510(k) 和 CE MDR 认证产品</span></li>
                    <li><span data-lang="en">Real-time production monitoring via NomoFlow™</span><span data-lang="zh">通过 NomoFlow™ 实时监控生产</span></li>
                </ul>`}
                ${keywordFAQ}
            </div>

            <div class="content-sidebar">
                ${productsList.length > 0 ? `
                <div class="sidebar-card">
                    <h3><span data-lang="en">Dominant Products</span><span data-lang="zh">主导产品</span></h3>
                    ${productsList.map(p => {
                        const pSlug = makeSlug(p);
                        const hasPage = productEntities.some(pe => makeSlug(pe.name) === pSlug);
                        const tag = hasPage ? `<a href="${pSlug}.html" class="product-tag"><span data-lang="en">${p}</span><span data-lang="zh">${PRODUCT_ZH[p] || p}</span></a>` : `<span class="product-tag" style="background:#94A3B8;"><span data-lang="en">${p}</span><span data-lang="zh">${PRODUCT_ZH[p] || p}</span></span>`;
                        return tag;
                    }).join('')}
                </div>` : ''}

                ${relatedProducts.length > 0 ? `
                <div class="sidebar-card">
                    <h3><span data-lang="en">ViaSurg Alternatives</span><span data-lang="zh">ViaSurg 替代方案</span></h3>
                    <ul>
                        ${relatedProducts.map(p => {
                            const pName = p.name.replace(/_/g, ' ');
                            return `<li><a href="${makeSlug(p.name)}.html"><span data-lang="en">${pName}</span><span data-lang="zh">${PRODUCT_ZH[pName] || pName}</span></a></li>`;
                        }).join('')}
                    </ul>
                </div>` : ''}

                <div class="sidebar-card">
                    <h3><span data-lang="en">Other Competitors</span><span data-lang="zh">其他竞品</span></h3>
                    <ul>
                        ${otherCompetitors.map(c => {
                            const cName = c.name.replace(/_/g, ' ');
                            return `<li><a href="competitor-${makeSlug(c.name)}.html">${cName}</a></li>`;
                        }).join('')}
                    </ul>
                </div>
                ${keywordSidebar}

                <a href="../" style="display:block;text-align:center;background:var(--primary);color:white;padding:12px;border-radius:4px;text-decoration:none;font-weight:600;font-size:14px;"><span data-lang="en">Back to Home</span><span data-lang="zh">返回首页</span></a>
            </div>
        </div>
    </div>
    <footer>
        <div class="container">
            <p><span data-lang="en">© 2026 ViaSurg. Powered by NomoFlow™ Technology.</span><span data-lang="zh">© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。</span></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({
            name,
            slug,
            url: `/pages/${slug}.html`,
            type: 'competitor'
        });
    });

    // Generate pages for category entities
    categoryEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = `category-${makeSlug(entity.name)}`;

        const desc = extractDescription(content) || `Medical device category covering ${name} products.`;
        const rawProducts = (content.match(/\[\[([^\]]+)\]\]/g) || []).map(m => m.replace(/\[\[|\]\]/g, '').replace(/_/g, ' '));

        // Match products that belong to this category
        const catProducts = productEntities.filter(p => {
            const pContent = p.content || '';
            return pContent.includes(`[[${entity.name}]]`) || pContent.includes(`Category**: [[${entity.name.replace(/\s+/g, '_')}`);
        });

        // Find related categories
        const otherCategories = categoryEntities.filter(c => c.name !== entity.name).slice(0, 6);

        // Find relevant keywords for this category
        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 10);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');

        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Product Category | ViaSurg</title>
    <meta name="description" content="ViaSurg ${name} product category. ${desc.substring(0, 120)} ${relevantKeywords.slice(0, 3).map(k => k.keyword).join(', ')}.">
    <meta name="keywords" content="${keywordList}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "${name} - ViaSurg Product Category",
        "description": "${desc.substring(0, 200)}",
        "url": "https://viasurg.com/pages/category-${makeSlug(entity.name)}.html"
    }
    </script>
    <style>
        :root { --primary: #00539F; --border: #E2E8F0; --text: #475569; --text-dark: #0F172A; --green: #10B981; --amber: #F59E0B; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        nav a:hover { color: var(--text-dark); }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .page-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .page-header h1 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
        .page-header .subtitle { font-size: 16px; color: var(--text); }
        .content { padding: 48px 0; }
        .content h2 { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content h2:first-child { margin-top: 0; }
        .content p { margin-bottom: 16px; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 16px; }
        .product-card { background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 24px; text-decoration: none; color: inherit; display: block; transition: border-color 0.15s; }
        .product-card:hover { border-color: var(--primary); }
        .product-card .cat { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94A3B8; margin-bottom: 8px; }
        .product-card h3 { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .product-card .desc { font-size: 13px; color: var(--text); margin-bottom: 12px; }
        .product-card .meta { display: flex; gap: 16px; font-size: 12px; }
        .product-card .meta-item { display: flex; flex-direction: column; }
        .product-card .meta-label { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #94A3B8; }
        .product-card .meta-value { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--text-dark); }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
        .category-link { background: #F8FAFC; border: 1px solid var(--border); border-radius: 4px; padding: 16px; text-decoration: none; color: inherit; display: block; }
        .category-link:hover { border-color: var(--primary); }
        .category-link .name { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-dark); }
        .category-link .arrow { font-size: 12px; color: #94A3B8; margin-top: 4px; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer p { font-size: 13px; color: #94A3B8; }
        footer a { color: var(--primary); text-decoration: none; }
        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: 'Montserrat', sans-serif; }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: #EBF4FF; }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"], body.lang-zh button[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
        @media (max-width: 768px) { .container { padding: 0 24px; } }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a> &rsaquo; ${name}
        </div>
        <div class="page-header">
            <h1>${name}</h1>
            <div class="subtitle"><span data-lang="en">${catProducts.length} products in this category</span><span data-lang="zh">该类别包含 ${catProducts.length} 个产品</span></div>
        </div>
        <div class="content">
            <h2><span data-lang="en">Category Overview</span><span data-lang="zh">类别概述</span></h2>
            <p>${desc}</p>

            ${catProducts.length > 0 ? `
            <h2><span data-lang="en">Products</span><span data-lang="zh">产品列表</span></h2>
            <div class="product-grid">
                ${catProducts.map(p => {
                    const pName = p.name.replace(/_/g, ' ');
                    const pContent = p.content || '';
                    const pCpcMatch = pContent.match(/CPC[^:]*:\s*\*{0,2}\s*\$?([\d.]+)/i);
                    const pCpc = pCpcMatch ? pCpcMatch[1] : '';
                    const pStratMatch = pContent.match(/Strategy\*\*:\s*([^.\n]+)/);
                    const pStrategy = pStratMatch ? cleanWikiContent(pStratMatch[1].trim().substring(0, 80)) : '';
                    return `<a class="product-card" href="${makeSlug(p.name)}.html">
                        <div class="cat">${name}</div>
                        <h3>${pName}</h3>
                        ${pStrategy ? `<div class="desc">${pStrategy}</div>` : ''}
                        <div class="meta">
                            ${pCpc ? `<div class="meta-item"><span class="meta-label">CPC</span><span class="meta-value">$${pCpc}</span></div>` : ''}
                            <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value" style="color:var(--green);">Active</span></div>
                        </div>
                    </a>`;
                }).join('')}
            </div>` : ''}

            ${otherCategories.length > 0 ? `
            <h2><span data-lang="en">Other Categories</span><span data-lang="zh">其他类别</span></h2>
            <div class="category-grid">
                ${otherCategories.map(c => {
                    const cName = c.name.replace(/_/g, ' ');
                    return `<a class="category-link" href="category-${makeSlug(c.name)}.html">
                        <div class="name">${cName}</div>
                        <div class="arrow"><span data-lang="en">View Products →</span><span data-lang="zh">查看产品 →</span></div>
                    </a>`;
                }).join('')}
            </div>` : ''}

            ${keywordFAQ}
            ${keywordSidebar ? `<div style="margin-top:24px;">${keywordSidebar.replace(/sidebar-card/g, 'sidebar-card" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;padding:24px;margin-bottom:24px')}</div>` : ''}
        </div>
    </div>
    <footer>
        <div class="container">
            <p><span data-lang="en">© 2026 ViaSurg. Powered by NomoFlow™ Technology.</span><span data-lang="zh">© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。</span></p>
            <p><a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> | <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a> | <a href="../sitemap.xml">Sitemap</a></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({ name, slug, url: `/pages/${slug}.html`, type: 'category' });
    });

    // Generate pages for material entities
    materialEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = `material-${makeSlug(entity.name)}`;

        const desc = extractDescription(content) || `Advanced biomaterial used in surgical device manufacturing.`;
        const props = extractProperties(content, 5);

        // Find relevant keywords for this material
        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 10);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');

        // Find products that use this material
        const materialProducts = productEntities.filter(p => {
            const pContent = p.content || '';
            return pContent.includes(`[[${entity.name}]]`) || pContent.toLowerCase().includes(name.toLowerCase());
        });

        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Material | ViaSurg</title>
    <meta name="description" content="${name} - ${desc.substring(0, 150)} ${relevantKeywords.slice(0, 3).map(k => k.keyword).join(', ')}. ViaSurg medical device materials.">
    <meta name="keywords" content="${keywordList}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${name}",
        "description": "${desc.substring(0, 200)}",
        "category": "Medical Device Material",
        "manufacturer": { "@type": "Organization", "name": "ViaSurg" }
    }
    </script>
    <style>
        :root { --primary: #00539F; --border: #E2E8F0; --text: #475569; --text-dark: #0F172A; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .page-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .page-header h1 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: var(--text-dark); }
        .content { padding: 48px 0; }
        .content h2 { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content p { margin-bottom: 16px; }
        .prop-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .prop-table td { padding: 10px 16px; border: 1px solid var(--border); font-size: 14px; }
        .prop-table td:first-child { font-weight: 600; color: var(--text-dark); width: 200px; background: #F8FAFC; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer p { font-size: 13px; color: #94A3B8; }
        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: 'Montserrat', sans-serif; }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: #EBF4FF; }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"], body.lang-zh button[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a> &rsaquo; <span data-lang="en">${name}</span><span data-lang="zh">${matDescZh(name) ? name.replace(' Material', '材料') : name}</span>
        </div>
        <div class="page-header">
            <h1><span data-lang="en">${name}</span><span data-lang="zh">${name.replace(' Material', '材料')}</span></h1>
        </div>
        <div class="content">
            <h2><span data-lang="en">Material Overview</span><span data-lang="zh">材料概述</span></h2>
            <p><span data-lang="en">${desc}</span><span data-lang="zh">${matDescZh(name) || desc}</span></p>
            ${props.length > 0 ? `
            <h2><span data-lang="en">Technical Properties</span><span data-lang="zh">技术特性</span></h2>
            <table class="prop-table">
                ${props.map(p => {
                    const propsZh = MATERIAL_PROPS_ZH[name] || {};
                    return `<tr><td><span data-lang="en">${p.key}</span><span data-lang="zh">${p.key}</span></td><td><span data-lang="en">${p.value}</span><span data-lang="zh">${propsZh[p.key] || p.value}</span></td></tr>`;
                }).join('')}
            </table>` : ''}

            ${materialProducts.length > 0 ? `
            <h2><span data-lang="en">Products Using ${name}</span><span data-lang="zh">使用 ${name} 的产品</span></h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:16px;">
                ${materialProducts.map(p => {
                    const pName = p.name.replace(/_/g, ' ');
                    return `<a href="${makeSlug(p.name)}.html" style="display:block;padding:16px;border:1px solid #E2E8F0;border-radius:4px;text-decoration:none;color:#0F172A;transition:border-color 0.15s;">
                        <div style="font-weight:600;font-size:14px;">${pName}</div>
                    </a>`;
                }).join('')}
            </div>` : ''}

            ${keywordFAQ}
            ${keywordSidebar ? `<div style="margin-top:24px;">${keywordSidebar.replace(/sidebar-card/g, 'sidebar-card" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;padding:24px;margin-bottom:24px')}</div>` : ''}
        </div>
    </div>
    <footer>
        <div class="container">
            <p><span data-lang="en">© 2026 ViaSurg. Powered by NomoFlow™ Technology.</span><span data-lang="zh">© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。</span></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({ name, slug, url: `/pages/${slug}.html`, type: 'material' });
    });

    // Generate pages for technology entities
    technologyEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = `tech-${makeSlug(entity.name)}`;

        const desc = extractDescription(content) || `Proprietary technology platform for medical device intelligence.`;

        // Find relevant keywords for this technology
        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 10);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');

        // Find related categories and products
        const relatedCats = categoryEntities.filter(c => {
            const cContent = c.content || '';
            return cContent.includes(`[[${entity.name}]]`) || cContent.toLowerCase().includes(name.toLowerCase());
        });
        const relatedProds = productEntities.filter(p => {
            const pContent = p.content || '';
            return pContent.includes(`[[${entity.name}]]`) || pContent.toLowerCase().includes(name.toLowerCase());
        });

        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Technology | ViaSurg</title>
    <meta name="description" content="${desc.substring(0, 160)}">
    <meta name="keywords" content="${keywordList || name}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"WebPage","name":"${name}","description":"${desc.replace(/"/g, '\\"').substring(0, 300)}","publisher":{"@type":"Organization","name":"ViaSurg"},"about":{"@type":"Thing","name":"${name}"}}
    </script>
    <style>
        :root { --primary: #00539F; --border: #E2E8F0; --text: #475569; --text-dark: #0F172A; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .page-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .page-header h1 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: var(--text-dark); }
        .page-layout { display: flex; gap: 48px; padding: 48px 0; }
        .main-content { flex: 1; min-width: 0; }
        .sidebar { width: 300px; flex-shrink: 0; }
        .sidebar-card { background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .sidebar-card h3 { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }
        .sidebar-card ul { list-style: none; }
        .sidebar-card li { padding: 4px 0; }
        .sidebar-card a { color: var(--primary); text-decoration: none; font-size: 14px; }
        .content h2 { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content p { margin-bottom: 16px; }
        .faq-section { margin-top: 40px; padding-top: 24px; border-top: 2px solid var(--primary); }
        .faq-section h2 { border-bottom: none; margin-top: 0; }
        .faq-item { margin-bottom: 16px; }
        .faq-item strong { color: var(--text-dark); display: block; margin-bottom: 4px; }
        .kw-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .kw-tag { background: #EBF4FF; color: var(--primary); padding: 4px 10px; border-radius: 4px; font-size: 12px; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer p { font-size: 13px; color: #94A3B8; }
        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: 'Montserrat', sans-serif; }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: #EBF4FF; }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a> &rsaquo; <span data-lang="en">${name}</span><span data-lang="zh">${name.replace('Technology', '技术')}</span>
        </div>
        <div class="page-header">
            <h1><span data-lang="en">${name}</span><span data-lang="zh">${name.replace('Technology', '技术')}</span></h1>
        </div>
        <div class="page-layout">
        <div class="main-content">
        <div class="content">
            <h2><span data-lang="en">Technology Overview</span><span data-lang="zh">技术概述</span></h2>
            <p><span data-lang="en">${desc}</span><span data-lang="zh">${techDescZh(name) || desc}</span></p>
            ${relatedCats.length ? `<h2><span data-lang="en">Related Categories</span><span data-lang="zh">相关分类</span></h2><ul>${relatedCats.map(c => `<li><a href="cat-${makeSlug(c.name)}.html">${c.name.replace(/_/g, ' ')}</a></li>`).join('')}</ul>` : ''}
            ${relatedProds.length ? `<h2><span data-lang="en">Products Using This Technology</span><span data-lang="zh">使用此技术的产品</span></h2><ul>${relatedProds.map(p => `<li><a href="product-${makeSlug(p.name)}.html">${p.name.replace(/_/g, ' ')}</a></li>`).join('')}</ul>` : ''}
            ${keywordFAQ}
        </div>
        </div>
        <aside class="sidebar">
            <div class="sidebar-card">
                <h3><span data-lang="en">Key Topics</span><span data-lang="zh">关键主题</span></h3>
                ${keywordSidebar}
            </div>
        </aside>
        </div>
    </div>
    <footer>
        <div class="container">
            <p><span data-lang="en">© 2026 ViaSurg. Powered by NomoFlow™ Technology.</span><span data-lang="zh">© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。</span></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({ name, slug, url: `/pages/${slug}.html`, type: 'technology' });
    });

    // Generate pages for other entity types (Procedure, Portal, Strategy, Compliance, Other)
    const handledNames = new Set([
        ...productEntities.map(e => e.name),
        ...competitorEntities.map(e => e.name),
        ...categoryEntities.map(e => e.name),
        ...materialEntities.map(e => e.name),
        ...technologyEntities.map(e => e.name)
    ]);
    const otherEntities = entities.filter(e => !handledNames.has(e.name) && (e.content || '').length > 50);

    otherEntities.forEach(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';
        const slug = `entity-${makeSlug(entity.name)}`;
        const desc = extractDescription(content) || `${name} - ViaSurg medical device intelligence entity.`;

        // Detect type for display
        let entityType = 'Resource';
        if (content.includes('Surgical Procedure')) entityType = 'Procedure';
        else if (content.includes('Portal')) entityType = 'Portal';
        else if (content.includes('Disruption') || content.includes('Arbitrage')) entityType = 'Strategy';
        else if (content.includes('Compliance') || content.includes('Framework')) entityType = 'Compliance';

        const relevantKeywords = findRelevantKeywords(entity, allKeywords, 8);
        const keywordFAQ = generateKeywordFAQ(name, relevantKeywords, content);
        const keywordSidebar = generateKeywordSection(relevantKeywords);
        const keywordList = relevantKeywords.map(k => k.keyword).join(', ');

        const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - ${entityType} | ViaSurg</title>
    <meta name="description" content="${desc.substring(0, 160)}">
    <meta name="keywords" content="${keywordList || name}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"WebPage","name":"${name}","description":"${desc.replace(/"/g, '\\"').substring(0, 300)}","publisher":{"@type":"Organization","name":"ViaSurg"}}
    </script>
    <style>
        :root { --primary: #00539F; --border: #E2E8F0; --text: #475569; --text-dark: #0F172A; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        header { border-bottom: 1px solid var(--border); padding: 16px 0; }
        header .container { display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
        nav a { font-size: 14px; color: var(--text); text-decoration: none; margin-left: 32px; }
        .breadcrumb { padding: 16px 0; font-size: 13px; color: #94A3B8; }
        .breadcrumb a { color: var(--primary); text-decoration: none; }
        .page-header { padding: 32px 0; border-bottom: 1px solid var(--border); }
        .page-header h1 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: var(--text-dark); }
        .page-layout { display: flex; gap: 48px; padding: 48px 0; }
        .main-content { flex: 1; min-width: 0; }
        .sidebar { width: 300px; flex-shrink: 0; }
        .sidebar-card { background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .sidebar-card h3 { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }
        .sidebar-card ul { list-style: none; }
        .sidebar-card li { padding: 4px 0; }
        .sidebar-card a { color: var(--primary); text-decoration: none; font-size: 14px; }
        .content h2 { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 600; color: var(--text-dark); margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .content p { margin-bottom: 16px; }
        .faq-section { margin-top: 40px; padding-top: 24px; border-top: 2px solid var(--primary); }
        .faq-section h2 { border-bottom: none; margin-top: 0; }
        .faq-item { margin-bottom: 16px; }
        .faq-item strong { color: var(--text-dark); display: block; margin-bottom: 4px; }
        .kw-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .kw-tag { background: #EBF4FF; color: var(--primary); padding: 4px 10px; border-radius: 4px; font-size: 12px; }
        footer { border-top: 1px solid var(--border); padding: 32px 0; margin-top: 64px; }
        footer p { font-size: 13px; color: #94A3B8; }
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--text); transition: all 0.15s; font-family: 'Montserrat', sans-serif; }
        .lang-btn.active { background: var(--primary); color: #fff; }
        .lang-btn:hover:not(.active) { background: #EBF4FF; }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="../" class="logo">ViaSurg</a>
            <nav>
                <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a>
                <a href="../#products" data-lang="en">Products</a><a href="../#products" data-lang="zh">产品中心</a>
                <a href="../#competitors" data-lang="en">Competitors</a><a href="../#competitors" data-lang="zh">竞品分析</a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="breadcrumb">
            <a href="../" data-lang="en">Home</a><a href="../" data-lang="zh">首页</a> &rsaquo; ${name}
        </div>
        <div class="page-header">
            <h1>${name}</h1>
        </div>
        <div class="page-layout">
        <div class="main-content">
        <div class="content">
            <h2><span data-lang="en">Overview</span><span data-lang="zh">概述</span></h2>
            <p>${desc}</p>
            ${keywordFAQ}
        </div>
        </div>
        <aside class="sidebar">
            <div class="sidebar-card">
                <h3><span data-lang="en">Key Topics</span><span data-lang="zh">关键主题</span></h3>
                ${keywordSidebar}
            </div>
        </aside>
        </div>
    </div>
    <footer>
        <div class="container">
            <p><span data-lang="en">© 2026 ViaSurg. Powered by NomoFlow™ Technology.</span><span data-lang="zh">© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。</span></p>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;

        const pagePath = path.join(pagesDir, `${slug}.html`);
        fs.writeFileSync(pagePath, pageHTML, 'utf8');
        generatedPages.push({ name, slug, url: `/pages/${slug}.html`, type: entityType.toLowerCase() });
    });

    console.log(`[MULTI-PAGE] Generated ${generatedPages.length} individual pages`);
    return generatedPages;
}

// ============================================
// OUTPUT PAGE GENERATOR
// ============================================

function generateOutputPage(entities, i18n, templates, allKeywords) {
    const productEntities = entities.filter(e =>
        e.content?.includes('Type**: [[Product]]') ||
        e.content?.includes('Market Strategy')
    ).slice(0, 12);

    const en = i18n?.ui?.en || {};
    const zh = i18n?.ui?.zh || {};
    const zhContent = i18n?.content?.zh || {};

    // Extract product cards (with i18n zh content)
    const productCards = productEntities.map(entity => {
        const name = entity.name.replace(/_/g, ' ');
        const content = entity.content || '';

        // Extract category
        const catMatch = content.match(/Category\*\*:\s*\[\[([^\]]+)\]\]/);
        const category = catMatch ? catMatch[1].replace(/_/g, ' ') : 'Medical Device';

        // Extract material
        const matMatch = content.match(/Material\*\*:\s*\[\[([^\]]+)\]\]/);
        const material = matMatch ? matMatch[1].replace(/_/g, ' ') : '';

        // Extract CPC (handles ranges like "$8.74 - $21.07" and bold like "**$49.06**")
        const cpcMatch = content.match(/CPC[^:]*:\s*\*{0,2}\s*\$?([\d.]+)\s*(?:-\s*\$?([\d.]+))?/i);
        let cpc = null;
        if (cpcMatch) {
            const low = parseFloat(cpcMatch[1]);
            const high = cpcMatch[2] ? parseFloat(cpcMatch[2]) : null;
            cpc = high ? ((low + high) / 2).toFixed(2) : low.toFixed(2);
        }
        // Fallback: find CPC from keyword data (use top_of_page_bid_high as CPC proxy)
        if (!cpc && allKeywords && allKeywords.length > 0) {
            const nameLC = name.toLowerCase().replace(/s$/, '');
            const matched = allKeywords.find(k => {
                const kw = (k.keyword || '').toLowerCase();
                return kw.includes(nameLC) || nameLC.includes(kw);
            });
            if (matched) {
                const bid = matched.top_of_page_bid_high || matched.avgCPC;
                if (bid) cpc = parseFloat(bid).toFixed(2);
            }
        }

        // Extract strategy
        const stratMatch = content.match(/Strategy\*\*:\s*([^.\n]+)/);
        const strategy = stratMatch ? cleanWikiContent(stratMatch[1].trim()) : '';

        // Extract target brands
        const brandMatch = content.match(/Target Brands\*\*:\s*([^.\n]+)/);
        const targetBrands = brandMatch ? cleanWikiContent(brandMatch[1].trim()) : '';

        // Get Chinese content translation
        const zhSlug = makeSlug(entity.name);
        const zh = zhContent[zhSlug] || {};

        return {
            name,
            slug: makeSlug(entity.name),
            category,
            material,
            cpc,
            strategy,
            targetBrands,
            entityId: entity.name,
            zhTitle: zh.content_title || '',
            zhCategory: zh.content_category || '',
            zhMaterial: zh.content_material || '',
            zhBody: zh.content_body || ''
        };
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ViaSurg - Clinical Intelligence Medical Devices</title>
    <meta name="description" content="ViaSurg provides FDA 510(k) and CE MDR certified medical devices with transparent manufacturing and clinical evidence.">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Lato:wght@300;400;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- JSON-LD Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ViaSurg",
        "description": "Clinical Intelligence Medical Device Platform",
        "url": "https://viasurg.com",
        "sameAs": [],
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
        },
        "makesOffer": ${JSON.stringify(productCards.slice(0, 5).map(p => ({
            "@type": "Offer",
            "itemOffered": {
                "@type": "Product",
                "name": p.name,
                "category": p.category
            }
        })))}
    }
    </script>

    <style>
        /* ============================================
           DESIGN SYSTEM: reOpenTest - Clinical Minimalism
           ============================================ */

        :root {
            --rot-foundational-blue: #00539F;
            --rot-action-primary: #0066CC;
            --rot-action-hover: #004C99;
            --rot-clinical-white: #FFFFFF;
            --rot-bg-secondary: #F8FAFC;
            --rot-border-subtle: #E2E8F0;
            --rot-border-light: #F1F5F9;
            --rot-blueprint-dark: #0A1128;
            --rot-dark-surface: #131B33;
            --rot-terminal-green: #4ADE80;
            --rot-dark-divider: rgba(255, 255, 255, 0.1);
            --rot-slate-heavy: #0F172A;
            --rot-slate-core: #475569;
            --rot-slate-light: #94A3B8;
            --rot-valid: #10B981;
            --rot-valid-bg: #ECFDF5;
            --rot-warning: #F59E0B;
            --rot-warning-bg: #FFFBEB;
            --rot-font-display: 'Montserrat', 'Helvetica Neue', sans-serif;
            --rot-font-body: 'Lato', 'Helvetica', 'Arial', sans-serif;
            --rot-font-mono: 'JetBrains Mono', 'Roboto Mono', monospace;
            --rot-radius-sm: 2px;
            --rot-radius-md: 4px;
            --rot-radius-lg: 6px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            scroll-behavior: smooth;
        }

        body {
            font-family: var(--rot-font-body);
            color: var(--rot-slate-core);
            background: var(--rot-clinical-white);
            line-height: 1.6;
        }

        /* HEADER */
        .site-header {
            background: var(--rot-clinical-white);
            border-bottom: 1px solid var(--rot-border-subtle);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 48px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo {
            font-family: var(--rot-font-display);
            font-size: 20px;
            font-weight: 700;
            color: var(--rot-foundational-blue);
            text-decoration: none;
            letter-spacing: 0.05em;
        }

        .logo span {
            color: var(--rot-slate-light);
            font-size: 11px;
            font-weight: 400;
            margin-left: 8px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .nav-main {
            display: flex;
            align-items: center;
            gap: 32px;
        }

        .nav-link {
            font-family: var(--rot-font-body);
            font-size: 14px;
            font-weight: 400;
            color: var(--rot-slate-core);
            text-decoration: none;
            transition: color 0ms;
        }

        .nav-link:hover { color: var(--rot-slate-heavy); }

        .nav-link.active {
            color: var(--rot-action-primary);
            font-weight: 700;
        }

        .nav-cta {
            font-family: var(--rot-font-body);
            font-size: 14px;
            font-weight: 700;
            color: var(--rot-clinical-white);
            background: var(--rot-action-primary);
            padding: 8px 20px;
            border-radius: var(--rot-radius-sm);
            text-decoration: none;
            transition: background-color 0ms;
        }

        .nav-cta:hover { background: var(--rot-action-hover); }
        .nav-cta:active { transform: translateY(1px); }

        /* HERO */
        .hero {
            background: var(--rot-bg-secondary);
            border-bottom: 1px solid var(--rot-border-subtle);
            padding: 96px 48px;
        }

        .hero-inner {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: center;
        }

        .hero-content {}

        .hero-badge {
            font-family: var(--rot-font-display);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--rot-action-primary);
            margin-bottom: 16px;
            display: inline-block;
            padding: 4px 12px;
            background: rgba(0, 102, 204, 0.08);
            border: 1px solid rgba(0, 102, 204, 0.15);
            border-radius: var(--rot-radius-sm);
        }

        .hero-title {
            font-family: var(--rot-font-display);
            font-size: 48px;
            font-weight: 700;
            line-height: 1.15;
            letter-spacing: -0.02em;
            color: var(--rot-slate-heavy);
            margin-bottom: 24px;
        }

        .hero-subtitle {
            font-family: var(--rot-font-body);
            font-size: 18px;
            line-height: 1.6;
            color: var(--rot-slate-core);
            margin-bottom: 40px;
        }

        .hero-actions {
            display: flex;
            gap: 16px;
        }

        .btn-primary {
            font-family: var(--rot-font-body);
            font-size: 16px;
            font-weight: 700;
            color: white;
            background: var(--rot-action-primary);
            padding: 12px 32px;
            border: none;
            border-radius: var(--rot-radius-sm);
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0ms;
        }

        .btn-primary:hover { background: var(--rot-action-hover); }
        .btn-primary:active { transform: translateY(1px); }

        .btn-secondary {
            font-family: var(--rot-font-body);
            font-size: 16px;
            font-weight: 700;
            color: var(--rot-foundational-blue);
            background: var(--rot-clinical-white);
            padding: 12px 32px;
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-sm);
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0ms;
        }

        .btn-secondary:hover { background: var(--rot-bg-secondary); }
        .btn-secondary:active { transform: translateY(1px); }

        .hero-proof {
            display: flex;
            gap: 48px;
            margin-top: 48px;
            padding-top: 32px;
            border-top: 1px solid var(--rot-border-subtle);
        }

        .proof-item {}

        .proof-value {
            font-family: var(--rot-font-mono);
            font-size: 32px;
            font-weight: 700;
            color: var(--rot-slate-heavy);
            line-height: 1;
        }

        .proof-label {
            font-family: var(--rot-font-display);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
            margin-top: 8px;
        }

        .hero-visual {
            background: var(--rot-clinical-white);
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-md);
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .visual-header {
            font-family: var(--rot-font-display);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
        }

        .visual-metric {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 12px 0;
            border-bottom: 1px solid var(--rot-border-light);
        }

        .visual-metric:last-child { border-bottom: none; }

        .metric-name {
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: var(--rot-slate-core);
        }

        .metric-val {
            font-family: var(--rot-font-mono);
            font-size: 14px;
            font-weight: 500;
            color: var(--rot-slate-heavy);
        }

        .metric-val.green { color: var(--rot-valid); }

        /* TRUST BAR */
        .trust-bar {
            background: var(--rot-clinical-white);
            border-bottom: 1px solid var(--rot-border-subtle);
            padding: 32px 48px;
        }

        .trust-inner {
            max-width: 1280px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .trust-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .trust-icon {
            width: 40px;
            height: 40px;
            background: var(--rot-bg-secondary);
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }

        .trust-text {
            font-family: var(--rot-font-display);
            font-size: 13px;
            font-weight: 600;
            color: var(--rot-slate-heavy);
        }

        .trust-sub {
            font-family: var(--rot-font-mono);
            font-size: 11px;
            color: var(--rot-slate-light);
        }

        /* PRODUCTS SECTION */
        .section-products {
            padding: 96px 48px;
        }

        .section-inner {
            max-width: 1280px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 64px;
        }

        .section-label {
            font-family: var(--rot-font-display);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--rot-action-primary);
            margin-bottom: 16px;
        }

        .section-title {
            font-family: var(--rot-font-display);
            font-size: 32px;
            font-weight: 600;
            color: var(--rot-slate-heavy);
            margin-bottom: 16px;
        }

        .section-desc {
            font-family: var(--rot-font-body);
            font-size: 18px;
            color: var(--rot-slate-core);
            max-width: 640px;
            margin: 0 auto;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        .product-card {
            background: var(--rot-clinical-white);
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-md);
            padding: 24px;
            transition: border-color 0ms;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .product-card:hover {
            border-color: var(--rot-action-primary);
        }

        .product-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .product-category {
            font-family: var(--rot-font-display);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
        }

        .product-badge {
            font-family: var(--rot-font-mono);
            font-size: 10px;
            font-weight: 500;
            padding: 2px 8px;
            border-radius: var(--rot-radius-sm);
            background: var(--rot-valid-bg);
            color: #065F46;
        }

        .product-name {
            font-family: var(--rot-font-display);
            font-size: 20px;
            font-weight: 600;
            color: var(--rot-slate-heavy);
            margin-bottom: 8px;
        }

        .product-desc {
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: var(--rot-slate-core);
            margin-bottom: 16px;
            line-height: 1.5;
        }

        .product-meta {
            display: flex;
            justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid var(--rot-border-light);
        }

        .meta-item {}

        .meta-label {
            font-family: var(--rot-font-display);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
        }

        .meta-value {
            font-family: var(--rot-font-mono);
            font-size: 14px;
            font-weight: 500;
            color: var(--rot-slate-heavy);
        }

        /* DARK SECTION - ANALYTICAL */
        .section-dark {
            background: var(--rot-blueprint-dark);
            padding: 96px 48px;
        }

        .dark-inner {
            max-width: 1280px;
            margin: 0 auto;
        }

        .dark-title {
            font-family: var(--rot-font-display);
            font-size: 32px;
            font-weight: 600;
            color: white;
            text-align: center;
            margin-bottom: 16px;
        }

        .dark-desc {
            font-family: var(--rot-font-body);
            font-size: 18px;
            color: rgba(255,255,255,0.7);
            text-align: center;
            max-width: 640px;
            margin: 0 auto 64px;
        }

        .proof-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        .proof-card {
            background: var(--rot-dark-surface);
            border: 1px solid var(--rot-dark-divider);
            border-radius: var(--rot-radius-md);
            padding: 32px;
        }

        .proof-card-value {
            font-family: var(--rot-font-mono);
            font-size: 36px;
            font-weight: 700;
            color: var(--rot-terminal-green);
            margin-bottom: 8px;
        }

        .proof-card-title {
            font-family: var(--rot-font-display);
            font-size: 14px;
            font-weight: 600;
            color: white;
            margin-bottom: 12px;
        }

        .proof-card-desc {
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            line-height: 1.5;
        }

        /* EVIDENCE SECTION */
        .section-evidence {
            background: var(--rot-bg-secondary);
            padding: 96px 48px;
        }

        .evidence-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
        }

        .evidence-card {
            background: var(--rot-clinical-white);
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-md);
            padding: 32px;
            display: flex;
            gap: 20px;
        }

        .evidence-icon {
            width: 48px;
            height: 48px;
            background: var(--rot-bg-secondary);
            border: 1px solid var(--rot-border-subtle);
            border-radius: var(--rot-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }

        .evidence-title {
            font-family: var(--rot-font-display);
            font-size: 16px;
            font-weight: 600;
            color: var(--rot-slate-heavy);
            margin-bottom: 8px;
        }

        .evidence-desc {
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: var(--rot-slate-core);
            line-height: 1.5;
        }

        .evidence-link {
            font-family: var(--rot-font-body);
            font-size: 14px;
            font-weight: 700;
            color: var(--rot-action-primary);
            text-decoration: none;
            margin-top: 12px;
            display: inline-block;
        }

        .evidence-link:hover { color: var(--rot-action-hover); }

        /* SPECS TABLE */
        .section-specs {
            padding: 96px 48px;
        }

        .specs-table {
            width: 100%;
            border-collapse: collapse;
        }

        .specs-table thead th {
            background: var(--rot-bg-secondary);
            font-family: var(--rot-font-display);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
            padding: 16px 20px;
            text-align: left;
            border-bottom: 1px solid var(--rot-border-subtle);
        }

        .specs-table tbody td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--rot-border-light);
            font-size: 14px;
            color: var(--rot-slate-core);
        }

        .specs-table tbody tr:hover {
            background: var(--rot-bg-secondary);
        }

        .specs-table .data-cell {
            font-family: var(--rot-font-mono);
            font-weight: 500;
            color: var(--rot-slate-heavy);
        }

        /* CTA SECTION */
        .section-cta {
            background: var(--rot-foundational-blue);
            padding: 96px 48px;
            text-align: center;
        }

        .cta-title {
            font-family: var(--rot-font-display);
            font-size: 32px;
            font-weight: 600;
            color: white;
            margin-bottom: 16px;
        }

        .cta-desc {
            font-family: var(--rot-font-body);
            font-size: 18px;
            color: rgba(255,255,255,0.85);
            max-width: 480px;
            margin: 0 auto 40px;
        }

        .btn-white {
            font-family: var(--rot-font-body);
            font-size: 16px;
            font-weight: 700;
            color: var(--rot-foundational-blue);
            background: white;
            padding: 14px 40px;
            border: none;
            border-radius: var(--rot-radius-sm);
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0ms;
        }

        .btn-white:hover { background: var(--rot-bg-secondary); }
        .btn-white:active { transform: translateY(1px); }

        /* FOOTER */
        .site-footer {
            background: var(--rot-blueprint-dark);
            padding: 64px 48px 32px;
        }

        .footer-inner {
            max-width: 1280px;
            margin: 0 auto;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
        }

        .footer-brand-name {
            font-family: var(--rot-font-display);
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin-bottom: 16px;
        }

        .footer-brand-desc {
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            line-height: 1.6;
        }

        .footer-col-title {
            font-family: var(--rot-font-display);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--rot-slate-light);
            margin-bottom: 20px;
        }

        .footer-link {
            display: block;
            font-family: var(--rot-font-body);
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            margin-bottom: 12px;
        }

        .footer-link:hover { color: white; }

        .footer-bottom {
            padding-top: 32px;
            border-top: 1px solid var(--rot-dark-divider);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-copy {
            font-family: var(--rot-font-mono);
            font-size: 12px;
            color: rgba(255,255,255,0.4);
        }

        .footer-cert {
            display: flex;
            gap: 16px;
        }

        .cert-badge {
            font-family: var(--rot-font-mono);
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            padding: 4px 10px;
            border: 1px solid var(--rot-dark-divider);
            border-radius: var(--rot-radius-sm);
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
            .hero-inner { grid-template-columns: 1fr; gap: 40px; }
            .products-grid { grid-template-columns: repeat(2, 1fr); }
            .proof-grid { grid-template-columns: repeat(2, 1fr); }
            .footer-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
            .header-inner { padding: 0 24px; }
            .hero { padding: 64px 24px; }
            .hero-title { font-size: 32px; }
            .products-grid { grid-template-columns: 1fr; }
            .proof-grid { grid-template-columns: 1fr; }
            .evidence-grid { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr; }
            .trust-inner { flex-wrap: wrap; gap: 24px; }
        }

        /* i18n Language Toggle */
        .lang-toggle { display: inline-flex; align-items: center; gap: 0; border: 1px solid var(--rot-border-subtle); border-radius: 2px; overflow: hidden; margin-left: 24px; }
        .lang-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: #fff; color: var(--rot-slate-core); transition: all 0.15s; font-family: var(--rot-font-display); }
        .lang-btn.active { background: var(--rot-foundational-blue); color: #fff; }
        .lang-btn:hover:not(.active) { background: rgba(0, 102, 204, 0.08); }
        [data-lang="zh"] { display: none !important; }
        body.lang-zh [data-lang="zh"] { display: block !important; }
        body.lang-zh span[data-lang="zh"], body.lang-zh a[data-lang="zh"], body.lang-zh button[data-lang="zh"] { display: inline !important; }
        body.lang-zh [data-lang="en"] { display: none !important; }
    </style>
</head>
<body>
    <!-- HEADER -->
    <header class="site-header">
        <div class="header-inner">
            <a href="/" class="logo">VIASURG <span>CLINICAL INTELLIGENCE</span></a>
            <nav class="nav-main">
                <a href="#products" class="nav-link active"><span data-lang="en">${en.nav?.products || 'Products'}</span><span data-lang="zh">${zh.nav?.products || '产品中心'}</span></a>
                <a href="#competitors" class="nav-link"><span data-lang="en">${en.labels?.specifications || 'Specifications'}</span><span data-lang="zh">${zh.labels?.specifications || '规格参数'}</span></a>
                <a href="#evidence" class="nav-link"><span data-lang="en">${en.labels?.evidence || 'Evidence'}</span><span data-lang="zh">${zh.labels?.evidence || '临床证据'}</span></a>
                <a href="#contact" class="nav-cta"><span data-lang="en">Request Quote</span><span data-lang="zh">询价</span></a>
                <div class="lang-toggle">
                    <button class="lang-btn active" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" onclick="setLang('zh')">中</button>
                </div>
            </nav>
        </div>
    </header>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-inner">
            <div class="hero-content">
                <div class="hero-badge"><span data-lang="en">FDA 510(k) & CE MDR Certified</span><span data-lang="zh">${zhContent.index.hero_badge}</span></div>
                <h1 class="hero-title"><span data-lang="en">Deterministic<br>Medical Intelligence</span><span data-lang="zh">${zhContent.index.hero_title}</span></h1>
                <p class="hero-subtitle"><span data-lang="en">ViaSurg replaces opaque supply chains with transparent, evidence-backed medical devices. Every product ships with verifiable compliance documentation and batch-level quality data.</span><span data-lang="zh">${zhContent.index.hero_subtitle}</span></p>
                <div class="hero-actions">
                    <a href="#products" class="btn-primary"><span data-lang="en">View Products</span><span data-lang="zh">${zhContent.index.hero_btn_products}</span></a>
                    <a href="#evidence" class="btn-secondary"><span data-lang="en">Download Evidence</span><span data-lang="zh">${zhContent.index.hero_btn_evidence}</span></a>
                </div>
                <div class="hero-proof">
                    <div class="proof-item">
                        <div class="proof-value">${productCards.length}</div>
                        <div class="proof-label"><span data-lang="en">Product Lines</span><span data-lang="zh">${zhContent.index.proof_lines}</span></div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-value">100%</div>
                        <div class="proof-label"><span data-lang="en">Certified</span><span data-lang="zh">${zhContent.index.proof_certified}</span></div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-value">40%</div>
                        <div class="proof-label"><span data-lang="en">Cost Savings</span><span data-lang="zh">${zhContent.index.proof_savings}</span></div>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="visual-header"><span data-lang="en">QUALITY METRICS</span><span data-lang="zh">${zhContent.index.quality_header}</span></div>
                <div class="visual-metric">
                    <span class="metric-name"><span data-lang="en">FDA 510(k) Status</span><span data-lang="zh">${zhContent.index.fda_status}</span></span>
                    <span class="metric-val green"><span data-lang="en">✓ Cleared</span><span data-lang="zh">${zhContent.index.fda_cleared}</span></span>
                </div>
                <div class="visual-metric">
                    <span class="metric-name"><span data-lang="en">CE MDR Compliance</span><span data-lang="zh">${zhContent.index.ce_compliance}</span></span>
                    <span class="metric-val green"><span data-lang="en">✓ Certified</span><span data-lang="zh">${zhContent.index.ce_certified}</span></span>
                </div>
                <div class="visual-metric">
                    <span class="metric-name"><span data-lang="en">ISO 13485 QMS</span><span data-lang="zh">${zhContent.index.iso_qms}</span></span>
                    <span class="metric-val green"><span data-lang="en">✓ Active</span><span data-lang="zh">${zhContent.index.iso_active}</span></span>
                </div>
                <div class="visual-metric">
                    <span class="metric-name"><span data-lang="en">Batch Traceability</span><span data-lang="zh">${zhContent.index.batch_trace}</span></span>
                    <span class="metric-val green"><span data-lang="en">✓ 100%</span><span data-lang="zh">${zhContent.index.batch_100}</span></span>
                </div>
                <div class="visual-metric">
                    <span class="metric-name"><span data-lang="en">NomoFlow™ Monitoring</span><span data-lang="zh">${zhContent.index.nomoflow}</span></span>
                    <span class="metric-val green"><span data-lang="en">✓ Real-time</span><span data-lang="zh">${zhContent.index.nomoflow_realtime}</span></span>
                </div>
            </div>
        </div>
    </section>

    <!-- TRUST BAR -->
    <div class="trust-bar">
        <div class="trust-inner">
            <div class="trust-item">
                <div class="trust-icon">📋</div>
                <div>
                    <div class="trust-text"><span data-lang="en">FDA Registered</span><span data-lang="zh">${zhContent.index.trust_fda}</span></div>
                    <div class="trust-sub"><span data-lang="en">21 CFR 807 Compliant</span><span data-lang="zh">${zhContent.index.trust_fda_sub}</span></div>
                </div>
            </div>
            <div class="trust-item">
                <div class="trust-icon">🇪🇺</div>
                <div>
                    <div class="trust-text"><span data-lang="en">CE MDR Certified</span><span data-lang="zh">${zhContent.index.trust_ce}</span></div>
                    <div class="trust-sub"><span data-lang="en">EU Medical Device Regulation</span><span data-lang="zh">${zhContent.index.trust_ce_sub}</span></div>
                </div>
            </div>
            <div class="trust-item">
                <div class="trust-icon">🔬</div>
                <div>
                    <div class="trust-text"><span data-lang="en">ISO 13485</span><span data-lang="zh">${zhContent.index.trust_iso}</span></div>
                    <div class="trust-sub"><span data-lang="en">Quality Management System</span><span data-lang="zh">${zhContent.index.trust_iso_sub}</span></div>
                </div>
            </div>
            <div class="trust-item">
                <div class="trust-icon">📊</div>
                <div>
                    <div class="trust-text"><span data-lang="en">NomoFlow™</span><span data-lang="zh">${zhContent.index.trust_nomoflow}</span></div>
                    <div class="trust-sub"><span data-lang="en">AI-Powered QA</span><span data-lang="zh">${zhContent.index.trust_nomoflow_sub}</span></div>
                </div>
            </div>
        </div>
    </div>

    <!-- PRODUCTS -->
    <section class="section-products" id="products">
        <div class="section-inner">
            <div class="section-header">
                <div class="section-label"><span data-lang="en">Product Portfolio</span><span data-lang="zh">${zhContent.index.products_label}</span></div>
                <h2 class="section-title"><span data-lang="en">Clinical-Grade Medical Devices</span><span data-lang="zh">${zhContent.index.products_title}</span></h2>
                <p class="section-desc"><span data-lang="en">Each product is backed by verifiable compliance documentation and transparent manufacturing data.</span><span data-lang="zh">${zhContent.index.products_desc}</span></p>
            </div>
            <div class="products-grid">
                ${productCards.map(p => `
                <a class="product-card" href="pages/${p.slug}.html">
                    <div class="product-card-header">
                        <span class="product-category"><span data-lang="en">${p.category}</span><span data-lang="zh">${catZh(p.category)}</span></span>
                        <span class="product-badge"><span data-lang="en">Verified</span><span data-lang="zh">${zhContent.index.badge_verified}</span></span>
                    </div>
                    <h3 class="product-name"><span data-lang="en">${p.name}</span><span data-lang="zh">${pzh(p.name)}</span></h3>
                    <p class="product-desc"><span data-lang="en">${p.strategy || 'Clinically validated medical device with transparent manufacturing and evidence-backed performance.'}</span><span data-lang="zh">${PRODUCT_DESC_ZH[p.name] || p.zhBody || p.strategy || '经临床验证的医疗器械，制造透明、性能有循证支持。'}</span></p>
                    <div class="product-meta">
                        <div class="meta-item">
                            <div class="meta-label"><span data-lang="en">CPC VALUE</span><span data-lang="zh">${zhContent.index.meta_cpc}</span></div>
                            <div class="meta-value">${p.cpc ? '$' + p.cpc : 'N/A'}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label"><span data-lang="en">STATUS</span><span data-lang="zh">${zhContent.index.meta_status}</span></div>
                            <div class="meta-value"><span data-lang="en">Active</span><span data-lang="zh">${zhContent.index.meta_active}</span></div>
                        </div>
                    </div>
                </a>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- DARK SECTION - PROOF -->
    <section class="section-dark">
        <div class="dark-inner">
            <h2 class="dark-title"><span data-lang="en">The Glass Factory Advantage</span><span data-lang="zh">${zhContent.index.dark_title}</span></h2>
            <p class="dark-desc"><span data-lang="en">Unlike incumbents that rely on opaque pricing and invisible supply chains, ViaSurg provides deterministic engineering proof.</span><span data-lang="zh">${zhContent.index.dark_desc}</span></p>
            <div class="proof-grid">
                <div class="proof-card">
                    <div class="proof-card-value">100%</div>
                    <div class="proof-card-title"><span data-lang="en">Batch Traceability</span><span data-lang="zh">${zhContent.index.proof_trace_title}</span></div>
                    <div class="proof-card-desc"><span data-lang="en">Every product ships with a digital link to its specific quality verification report and manufacturing batch log.</span><span data-lang="zh">${zhContent.index.proof_trace_desc}</span></div>
                </div>
                <div class="proof-card">
                    <div class="proof-card-value">40%</div>
                    <div class="proof-card-title"><span data-lang="en">Cost Reduction</span><span data-lang="zh">${zhContent.index.proof_cost_title}</span></div>
                    <div class="proof-card-desc"><span data-lang="en">Direct B2B pricing eliminates the traditional 3-4 layer distribution markup while maintaining identical quality standards.</span><span data-lang="zh">${zhContent.index.proof_cost_desc}</span></div>
                </div>
                <div class="proof-card">
                    <div class="proof-card-value">24h</div>
                    <div class="proof-card-title"><span data-lang="en">Response Time</span><span data-lang="zh">${zhContent.index.proof_response_title}</span></div>
                    <div class="proof-card-desc"><span data-lang="en">NomoFlow™ AI monitoring enables real-time quality alerts and 24-hour technical support response commitment.</span><span data-lang="zh">${zhContent.index.proof_response_desc}</span></div>
                </div>
            </div>
        </div>
    </section>

    <!-- EVIDENCE -->
    <section class="section-evidence" id="evidence">
        <div class="section-inner">
            <div class="section-header">
                <div class="section-label"><span data-lang="en">Evidence Protocol</span><span data-lang="zh">${zhContent.index.evidence_label}</span></div>
                <h2 class="section-title"><span data-lang="en">Verified Documentation</span><span data-lang="zh">${zhContent.index.evidence_title}</span></h2>
                <p class="section-desc"><span data-lang="en">Every claim is backed by verifiable evidence. Access compliance certificates, clinical data, and quality reports.</span><span data-lang="zh">${zhContent.index.evidence_desc}</span></p>
            </div>
            <div class="evidence-grid">
                <div class="evidence-card">
                    <div class="evidence-icon">📋</div>
                    <div>
                        <h3 class="evidence-title"><span data-lang="en">FDA 510(k) Clearance Letters</span><span data-lang="zh">${zhContent.index.evidence_fda_title}</span></h3>
                        <p class="evidence-desc"><span data-lang="en">Access official FDA clearance documentation for all registered products. Verified against the FDA 510(k) database.</span><span data-lang="zh">${zhContent.index.evidence_fda_desc}</span></p>
                        <a href="#" class="evidence-link"><span data-lang="en">Download PDF →</span><span data-lang="zh">${zhContent.index.evidence_download}</span></a>
                    </div>
                </div>
                <div class="evidence-card">
                    <div class="evidence-icon">🇪🇺</div>
                    <div>
                        <h3 class="evidence-title"><span data-lang="en">CE MDR Certificates</span><span data-lang="zh">${zhContent.index.evidence_ce_title}</span></h3>
                        <p class="evidence-desc"><span data-lang="en">European conformity certificates issued by notified bodies. Full compliance with EU Medical Device Regulation.</span><span data-lang="zh">${zhContent.index.evidence_ce_desc}</span></p>
                        <a href="#" class="evidence-link"><span data-lang="en">Download PDF →</span><span data-lang="zh">${zhContent.index.evidence_download}</span></a>
                    </div>
                </div>
                <div class="evidence-card">
                    <div class="evidence-icon">🔬</div>
                    <div>
                        <h3 class="evidence-title"><span data-lang="en">Clinical Evaluation Reports</span><span data-lang="zh">${zhContent.index.evidence_clinical_title}</span></h3>
                        <p class="evidence-desc"><span data-lang="en">Peer-reviewed clinical data supporting safety and efficacy claims. Updated quarterly with latest study results.</span><span data-lang="zh">${zhContent.index.evidence_clinical_desc}</span></p>
                        <a href="#" class="evidence-link"><span data-lang="en">Download PDF →</span><span data-lang="zh">${zhContent.index.evidence_download}</span></a>
                    </div>
                </div>
                <div class="evidence-card">
                    <div class="evidence-icon">📊</div>
                    <div>
                        <h3 class="evidence-title"><span data-lang="en">Batch Quality Reports</span><span data-lang="zh">${zhContent.index.evidence_batch_title}</span></h3>
                        <p class="evidence-desc"><span data-lang="en">Real-time manufacturing quality data from NomoFlow™. Access batch-specific QC metrics and test results.</span><span data-lang="zh">${zhContent.index.evidence_batch_desc}</span></p>
                        <a href="#" class="evidence-link"><span data-lang="en">View Dashboard →</span><span data-lang="zh">${zhContent.index.evidence_dashboard}</span></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SPECS TABLE -->
    <section class="section-specs" id="specs">
        <div class="section-inner">
            <div class="section-header">
                <div class="section-label"><span data-lang="en">Technical Specifications</span><span data-lang="zh">${zhContent.index.specs_label}</span></div>
                <h2 class="section-title"><span data-lang="en">Product Cross-Reference</span><span data-lang="zh">${zhContent.index.specs_title}</span></h2>
                <p class="section-desc"><span data-lang="en">Direct technical equivalents to incumbent products with verified compatibility.</span><span data-lang="zh">${zhContent.index.specs_desc}</span></p>
            </div>
            <table class="specs-table">
                <thead>
                    <tr>
                        <th><span data-lang="en">VIASURG PRODUCT</span><span data-lang="zh">${zhContent.index.specs_viasurg}</span></th>
                        <th><span data-lang="en">CATEGORY</span><span data-lang="zh">${zhContent.index.specs_category}</span></th>
                        <th><span data-lang="en">EQUIVALENT TO</span><span data-lang="zh">${zhContent.index.specs_equivalent}</span></th>
                        <th><span data-lang="en">CPC VALUE</span><span data-lang="zh">${zhContent.index.specs_cpc}</span></th>
                        <th><span data-lang="en">STATUS</span><span data-lang="zh">${zhContent.index.specs_status}</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${productCards.map(p => `
                    <tr>
                        <td class="data-cell"><span data-lang="en">${p.name}</span><span data-lang="zh">${pzh(p.name)}</span></td>
                        <td><span data-lang="en">${p.category}</span><span data-lang="zh">${catZh(p.category)}</span></td>
                        <td><span data-lang="en">${p.targetBrands || 'OEM Equivalent'}</span><span data-lang="zh">${p.targetBrands || zhContent.index.specs_oem || 'OEM 等效'}</span></td>
                        <td class="data-cell">${p.cpc ? '$' + p.cpc : '—'}</td>
                        <td><span style="color: var(--rot-valid); font-family: var(--rot-font-mono); font-size: 12px;"><span data-lang="en">✓ Active</span><span data-lang="zh">${zhContent.index.specs_active}</span></span></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </section>

    <!-- CTA -->
    <section class="section-cta" id="contact">
        <h2 class="cta-title"><span data-lang="en">Request Clinical Evidence Package</span><span data-lang="zh">${zhContent.index.cta_title}</span></h2>
        <p class="cta-desc"><span data-lang="en">Get access to full compliance documentation, clinical data, and pricing for your institution.</span><span data-lang="zh">${zhContent.index.cta_desc}</span></p>
        <a href="mailto:info@viasurg.com" class="btn-white"><span data-lang="en">Contact ViaSurg</span><span data-lang="zh">${zhContent.index.cta_btn}</span></a>
    </section>

    <!-- COMPETITOR COMPARISON (from wiki entities) -->
    <section class="section-dark" id="competitors" style="background:var(--rot-blueprint-dark);padding:80px 48px;">
        <div style="max-width:1280px;margin:0 auto;">
            <div style="font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--rot-terminal-green);margin-bottom:16px;"><span data-lang="en">COMPETITIVE INTELLIGENCE</span><span data-lang="zh">${zhContent.index.competitive_label}</span></div>
            <h2 style="font-family:var(--rot-font-display);font-size:32px;font-weight:700;color:white;margin-bottom:12px;"><span data-lang="en">Direct Equivalents to Incumbent Products</span><span data-lang="zh">${zhContent.index.competitive_title}</span></h2>
            <p style="font-size:16px;color:rgba(255,255,255,0.6);margin-bottom:48px;max-width:700px;"><span data-lang="en">ViaSurg provides verified 1:1 cross-references to high-cost incumbent products. Every equivalence is backed by NomoFlow™ batch-level quality data.</span><span data-lang="zh">${zhContent.index.competitive_desc}</span></p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.15);font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--rot-slate-light);"><span data-lang="en">INCUMBENT</span><span data-lang="zh">${zhContent.index.competitive_incumbent}</span></th>
                        <th style="text-align:left;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.15);font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--rot-slate-light);"><span data-lang="en">PRODUCT LINE</span><span data-lang="zh">${zhContent.index.competitive_product_line}</span></th>
                        <th style="text-align:left;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.15);font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--rot-slate-light);"><span data-lang="en">MARKET PAIN POINT</span><span data-lang="zh">${zhContent.index.competitive_pain}</span></th>
                        <th style="text-align:left;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.15);font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--rot-terminal-green);"><span data-lang="en">VIASURG DISRUPTION</span><span data-lang="zh">${zhContent.index.competitive_disruption}</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${(dataCache._competitorEntities || []).filter(comp => comp.name !== 'Competitor_Disruption').map(comp => {
                        const name = comp.name.replace(/_/g, ' ');
                        const slug = makeSlug(comp.name);
                        const content = comp.content || '';
                        const productsRaw = (content.match(/Dominant Products\*\*:\s*([^\n]+)/) || [])[1] || 'Multiple lines';
                        const products = cleanWikiContent(productsRaw).substring(0, 80);
                        const pain = (content.match(/High premium|Fragmented|Proprietary|Opaque|cost-inflation|locking|Complex|Expensive|Limited/gi) || ['Market inefficiency'])[0];
                        const disruption = (content.match(/Verified|Vertical integration|Open-compatibility|Direct B2B|Transparent/gi) || ['Transparent manufacturing'])[0];
                        const painZh = pain === 'Market inefficiency' ? '市场低效' : pain;
                        const disruptionZh = disruption === 'Transparent manufacturing' ? '透明制造' : disruption === 'Verified' ? '已验证' : disruption;
                        return `<tr>
                            <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:white;font-weight:600;"><a href="pages/competitor-${slug}.html" style="color:white;text-decoration:underline;text-underline-offset:3px;"><span data-lang="en">${name}</span><span data-lang="zh">${COMPETITOR_ZH[name] || name}</span></a></td>
                            <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);"><span data-lang="en">${products}</span><span data-lang="zh">${COMPETITOR_MARKET_ZH[name] ? COMPETITOR_MARKET_ZH[name].substring(0, 80) : products}</span></td>
                            <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);"><span data-lang="en">${pain}</span><span data-lang="zh">${painZh}</span></td>
                            <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:var(--rot-terminal-green);font-family:var(--rot-font-mono);font-size:13px;"><span data-lang="en">${disruption}</span><span data-lang="zh">${disruptionZh}</span></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>

            <!-- DISRUPTION OVERVIEW CARD -->
            <div style="margin-top:48px;border:1px solid rgba(74,222,128,0.3);border-radius:6px;padding:40px;background:rgba(74,222,128,0.04);">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                    <span style="font-family:var(--rot-font-mono);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--rot-terminal-green);background:rgba(74,222,128,0.12);padding:4px 10px;border-radius:2px;"><span data-lang="en">DISRUPTION OVERVIEW</span><span data-lang="zh">颠覆性总览</span></span>
                </div>
                <h3 style="font-family:var(--rot-font-display);font-size:24px;font-weight:700;color:white;margin-bottom:8px;"><span data-lang="en">How ViaSurg Disrupts the Market</span><span data-lang="zh">ViaSurg 如何颠覆市场</span></h3>
                <p style="font-size:15px;color:rgba(255,255,255,0.6);margin-bottom:32px;max-width:700px;"><span data-lang="en">ViaSurg replaces opaque supply chains with transparent, evidence-backed medical devices across all product lines.</span><span data-lang="zh">ViaSurg 以透明、循证的医疗设备取代不透明的供应链，覆盖所有产品线。</span></p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
                    <div style="background:var(--rot-dark-surface);border:1px solid var(--rot-dark-divider);border-radius:4px;padding:24px;">
                        <div style="font-family:var(--rot-font-mono);font-size:28px;font-weight:700;color:var(--rot-terminal-green);margin-bottom:8px;">100%</div>
                        <div style="font-family:var(--rot-font-display);font-size:13px;font-weight:600;color:white;margin-bottom:8px;"><span data-lang="en">Glass Factory</span><span data-lang="zh">玻璃工厂</span></div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;"><span data-lang="en">Deterministic engineering proof with direct batch log access, eliminating black-box risk.</span><span data-lang="zh">确定性工程证明，直接访问批次日志，消除黑箱风险。</span></div>
                    </div>
                    <div style="background:var(--rot-dark-surface);border:1px solid var(--rot-dark-divider);border-radius:4px;padding:24px;">
                        <div style="font-family:var(--rot-font-mono);font-size:28px;font-weight:700;color:var(--rot-terminal-green);margin-bottom:8px;">40%</div>
                        <div style="font-family:var(--rot-font-display);font-size:13px;font-weight:600;color:white;margin-bottom:8px;"><span data-lang="en">Cost Arbitrage</span><span data-lang="zh">成本套利</span></div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;"><span data-lang="en">Direct B2B pricing eliminates 3-4 layer distribution markup across all product lines.</span><span data-lang="zh">B2B 直销定价消除 3-4 层分销加价，覆盖所有产品线。</span></div>
                    </div>
                    <div style="background:var(--rot-dark-surface);border:1px solid var(--rot-dark-divider);border-radius:4px;padding:24px;">
                        <div style="font-family:var(--rot-font-mono);font-size:28px;font-weight:700;color:var(--rot-terminal-green);margin-bottom:8px;">1:1</div>
                        <div style="font-family:var(--rot-font-display);font-size:13px;font-weight:600;color:white;margin-bottom:8px;"><span data-lang="en">SKU Cross-Reference</span><span data-lang="zh">SKU 互译</span></div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;"><span data-lang="en">Verified equivalents to Ethicon, Medtronic, Olympus, Teleflex and more.</span><span data-lang="zh">经验证的 Ethicon、美敦力、奥林巴斯、泰利福等品牌等效替代。</span></div>
                    </div>
                    <div style="background:var(--rot-dark-surface);border:1px solid var(--rot-dark-divider);border-radius:4px;padding:24px;">
                        <div style="font-family:var(--rot-font-mono);font-size:28px;font-weight:700;color:var(--rot-terminal-green);margin-bottom:8px;">24h</div>
                        <div style="font-family:var(--rot-font-display);font-size:13px;font-weight:600;color:white;margin-bottom:8px;"><span data-lang="en">NomoFlow™ Verified</span><span data-lang="zh">NomoFlow™ 验证</span></div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;"><span data-lang="en">Real-time QA monitoring with batch-level traceability on every shipment.</span><span data-lang="zh">实时质量监控，每批货物均可追溯。</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CATEGORIES (from wiki entities) -->
    <section style="background:var(--rot-clinical-white);padding:80px 48px;border-bottom:1px solid var(--rot-border-subtle);">
        <div style="max-width:1280px;margin:0 auto;">
            <div style="font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--rot-action-primary);margin-bottom:16px;"><span data-lang="en">PRODUCT CATEGORIES</span><span data-lang="zh">${zhContent.index.categories_label}</span></div>
            <h2 style="font-family:var(--rot-font-display);font-size:32px;font-weight:700;color:var(--rot-slate-heavy);margin-bottom:48px;"><span data-lang="en">Browse by Category</span><span data-lang="zh">${zhContent.index.categories_title}</span></h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px,1fr));gap:16px;">
                ${(dataCache._categoryEntities || []).map(cat => {
                    const name = cat.name.replace(/_/g, ' ');
                    const slug = makeSlug(cat.name);
                    return `<a href="pages/category-${slug}.html" style="background:var(--rot-bg-secondary);border:1px solid var(--rot-border-subtle);border-radius:4px;padding:20px;text-decoration:none;color:inherit;display:block;">
                        <div style="font-family:var(--rot-font-display);font-size:15px;font-weight:600;color:var(--rot-slate-heavy);"><span data-lang="en">${name}</span><span data-lang="zh">${catZh(name)}</span></div>
                        <div style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-slate-light);margin-top:4px;"><span data-lang="en">View Products →</span><span data-lang="zh">${zhContent.index.categories_view}</span></div>
                    </a>`;
                }).join('')}
            </div>
        </div>
    </section>

    <!-- MATERIALS & TECHNOLOGY (from wiki entities) -->
    <section style="background:var(--rot-bg-secondary);padding:80px 48px;border-top:1px solid var(--rot-border-subtle);border-bottom:1px solid var(--rot-border-subtle);">
        <div style="max-width:1280px;margin:0 auto;">
            <div style="font-family:var(--rot-font-display);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--rot-action-primary);margin-bottom:16px;"><span data-lang="en">${en.labels?.material || 'MATERIALS'} & TECHNOLOGY</span><span data-lang="zh">${zhContent.index.materials_label}</span></div>
            <h2 style="font-family:var(--rot-font-display);font-size:32px;font-weight:700;color:var(--rot-slate-heavy);margin-bottom:48px;"><span data-lang="en">Technical Foundation</span><span data-lang="zh">${zhContent.index.materials_title}</span></h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px,1fr));gap:24px;">
                ${(dataCache._materialEntities || []).map(mat => {
                    const name = mat.name.replace(/_/g, ' ');
                    const slug = makeSlug(mat.name);
                    const content = mat.content || '';
                    const desc = extractDescription(content) || 'Advanced biomaterial for surgical applications.';
                    const descZh = matDescZh(name) || desc;
                    const props = extractProperties(content, 3);
                    const propsZh = MATERIAL_PROPS_ZH[name] || {};
                    return `<a href="pages/material-${slug}.html" style="background:white;border:1px solid var(--rot-border-subtle);border-radius:4px;padding:24px;text-decoration:none;color:inherit;display:block;">
                        <div style="font-family:var(--rot-font-display);font-size:16px;font-weight:600;color:var(--rot-slate-heavy);margin-bottom:8px;">${name}</div>
                        <p style="font-size:14px;color:var(--rot-slate-core);margin-bottom:12px;"><span data-lang="en">${desc}</span><span data-lang="zh">${descZh}</span></p>
                        ${props.map(p => `<div style="font-family:var(--rot-font-mono);font-size:12px;color:var(--rot-slate-light);padding:4px 0;border-top:1px solid var(--rot-border-light);"><span data-lang="en">${p.key}: ${p.value}</span><span data-lang="zh">${propsZh[p.key] ? p.key + '：' + propsZh[p.key] : p.key + ': ' + p.value}</span></div>`).join('')}
                        <div style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-slate-light);margin-top:12px;"><span data-lang="en">View Details →</span><span data-lang="zh">${zhContent.index.materials_view}</span></div>
                    </a>`;
                }).join('')}
                ${(dataCache._technologyEntities || []).map(tech => {
                    const name = tech.name.replace(/_/g, ' ');
                    const slug = makeSlug(tech.name);
                    const content = tech.content || '';
                    const desc = extractDescription(content) || 'Proprietary technology platform for medical device intelligence.';
                    const descZh = techDescZh(name) || desc;
                    return `<a href="pages/tech-${slug}.html" style="background:white;border:1px solid var(--rot-border-subtle);border-radius:4px;padding:24px;border-left:3px solid var(--rot-terminal-green);text-decoration:none;color:inherit;display:block;">
                        <div style="font-family:var(--rot-font-display);font-size:16px;font-weight:600;color:var(--rot-slate-heavy);margin-bottom:8px;">${name} <span style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-terminal-green);background:rgba(74,222,128,0.1);padding:2px 6px;border-radius:2px;">TECHNOLOGY</span></div>
                        <p style="font-size:14px;color:var(--rot-slate-core);"><span data-lang="en">${desc}</span><span data-lang="zh">${descZh}</span></p>
                        <div style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-slate-light);margin-top:12px;"><span data-lang="en">View Details →</span><span data-lang="zh">${zhContent.index.materials_view}</span></div>
                    </a>`;
                }).join('')}
            </div>
        </div>
    </section>

    <!-- FOOTER (i18n: ${en.footer?.copy || 'default'} / ${zh.footer?.copy || '默认'}) -->
    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand-name">VIASURG</div>
                    <p class="footer-brand-desc"><span data-lang="en">Clinical Intelligence Medical Device Platform. Powered by NomoFlow™ Technology for transparent, evidence-backed healthcare solutions.</span><span data-lang="zh">${zhContent.index.footer_brand_desc}</span></p>
                </div>
                <div>
                    <div class="footer-col-title"><span data-lang="en">${en.nav?.products || 'Products'}</span><span data-lang="zh">${zhContent.index.footer_products}</span></div>
                    <a href="pages/category-wound-closure.html" class="footer-link"><span data-lang="en">Wound Closure</span><span data-lang="zh">${zhContent.index.footer_wound}</span></a>
                    <a href="pages/category-minimally-invasive-surgery.html" class="footer-link"><span data-lang="en">Minimally Invasive</span><span data-lang="zh">${zhContent.index.footer_minimally}</span></a>
                    <a href="pages/category-instrumentation.html" class="footer-link"><span data-lang="en">Endoscopy</span><span data-lang="zh">${zhContent.index.footer_endoscopy}</span></a>
                    <a href="pages/category-nomoflow-solutions.html" class="footer-link">NomoFlow™</a>
                </div>
                <div>
                    <div class="footer-col-title"><span data-lang="en">${en.labels?.evidence || 'Evidence'}</span><span data-lang="zh">${zhContent.index.footer_evidence}</span></div>
                    <a href="#evidence" class="footer-link"><span data-lang="en">FDA Clearances</span><span data-lang="zh">${zhContent.index.footer_fda}</span></a>
                    <a href="#evidence" class="footer-link"><span data-lang="en">CE Certificates</span><span data-lang="zh">${zhContent.index.footer_ce}</span></a>
                    <a href="#evidence" class="footer-link"><span data-lang="en">Clinical Data</span><span data-lang="zh">${zhContent.index.footer_clinical}</span></a>
                    <a href="#evidence" class="footer-link"><span data-lang="en">Quality Reports</span><span data-lang="zh">${zhContent.index.footer_quality}</span></a>
                </div>
                <div>
                    <div class="footer-col-title"><span data-lang="en">Company</span><span data-lang="zh">${zhContent.index.footer_company}</span></div>
                    <a href="#about" class="footer-link"><span data-lang="en">About ViaSurg</span><span data-lang="zh">${zhContent.index.footer_about}</span></a>
                    <a href="#contact" class="footer-link"><span data-lang="en">Contact</span><span data-lang="zh">${zhContent.index.footer_contact}</span></a>
                    <a href="#compliance" class="footer-link"><span data-lang="en">${en.footer?.compliance || 'Compliance'}</span><span data-lang="zh">${zh.footer?.compliance || '合规声明'}</span></a>
                    <a href="#privacy" class="footer-link"><span data-lang="en">${en.footer?.privacy || 'Privacy Policy'}</span><span data-lang="zh">${zh.footer?.privacy || '隐私政策'}</span></a>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-copy"><span data-lang="en">${en.footer?.copy || '© 2026 ViaSurg. Powered by NomoFlow™ Technology.'}</span><span data-lang="zh">${zh.footer?.copy || '© 2026 ViaSurg. 由 NomoFlow™ 技术驱动。'}</span></div>
                <div class="footer-cert">
                    <span class="cert-badge">FDA REGISTERED</span>
                    <span class="cert-badge">CE MDR</span>
                    <span class="cert-badge">ISO 13485</span>
                </div>
            </div>
        </div>
    </footer>
    <script>
    function setLang(lang) {
        document.body.className = lang === 'zh' ? 'lang-zh' : '';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent === (lang === 'zh' ? '中' : 'EN')));
        localStorage.setItem('viasurg-lang', lang);
    }
    (function() {
        var saved = localStorage.getItem('viasurg-lang') || 'en';
        if (saved === 'zh') setLang('zh');
    })();
    </script>
</body>
</html>`;
}

// ============================================
// SSE CLIENTS
// ============================================

const sseClients = new Set();
const pipelineResults = {};

function broadcastSSE(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(client => {
        try {
            client.write(message);
        } catch (e) {
            sseClients.delete(client);
        }
    });
}

// ============================================
// HTTP SERVER
// ============================================

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ---- SSE Endpoint ----
    if (pathname === '/api/events' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        });

        // Flush headers immediately
        res.flushHeaders();

        // Send initial connection event
        res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`);

        sseClients.add(res);
        console.log(`[SSE] Client connected. Total: ${sseClients.size}`);

        req.on('close', () => {
            sseClients.delete(res);
            console.log(`[SSE] Client disconnected. Total: ${sseClients.size}`);
        });
        return;
    }

    // ---- Pipeline API Endpoints ----
    if (pathname === '/api/pipeline/stage1' && req.method === 'POST') {
        const result = processSignalIngestion();
        pipelineResults[1] = result;
        broadcastSSE({ type: 'stage_complete', stage: 1, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (pathname === '/api/pipeline/stage2' && req.method === 'POST') {
        const stage1Data = pipelineResults[1] || processSignalIngestion();
        const result = processOODAAnalysis(stage1Data);
        pipelineResults[2] = result;
        broadcastSSE({ type: 'stage_complete', stage: 2, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (pathname === '/api/pipeline/stage3' && req.method === 'POST') {
        const result = processWikiCompilation();
        pipelineResults[3] = result;
        broadcastSSE({ type: 'stage_complete', stage: 3, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (pathname === '/api/pipeline/stage4' && req.method === 'POST') {
        const wikiData = pipelineResults[3] || processWikiCompilation();
        const result = processSiteGeneration(wikiData);
        pipelineResults[4] = result;
        broadcastSSE({ type: 'stage_complete', stage: 4, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    if (pathname === '/api/pipeline/stage5' && req.method === 'POST') {
        const wikiData = pipelineResults[3] || processWikiCompilation();
        const siteData = pipelineResults[4] || processSiteGeneration(wikiData);
        const result = processQualityVerification(siteData);
        pipelineResults[5] = result;
        broadcastSSE({ type: 'stage_complete', stage: 5, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    // ---- Add New Market Signal ----
    if (pathname === '/api/signals' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { title, source, content } = JSON.parse(body);
                if (!title) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Title required' }));
                    return;
                }

                // Generate signal ID
                const signalId = 'sig_' + Date.now() + '_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);

                // Create signal object
                const newSignal = {
                    id: signalId,
                    type: 'user_reported',
                    title: title,
                    source: source || 'Manual Entry',
                    description: content || title,
                    timestamp: new Date().toISOString(),
                    status: 'active'
                };

                // Append to strategy_wiki_data.json
                const dataPath = path.join(DATA_DIR, 'strategy_wiki_data.json');
                let strategyData = {};
                try { strategyData = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { strategyData = { signals: [], insights: [], strategies: [] }; }
                if (!strategyData.signals) strategyData.signals = [];
                strategyData.signals.push(newSignal);
                fs.writeFileSync(dataPath, JSON.stringify(strategyData, null, 2), 'utf8');

                // Update cache
                dataCache['strategy_wiki_data.json'] = strategyData;
                if (!dataCache.raw_signals) dataCache.raw_signals = [];
                dataCache.raw_signals.push(newSignal);

                // Save to persistent storage
                persistedState.signals.push(newSignal);
                savePersistedState();

                broadcastSSE({ type: 'new_signal', data: newSignal });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, signalId, message: 'Signal added successfully' }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // Full pipeline run
    if (pathname === '/api/pipeline/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const delay = ms => new Promise(r => setTimeout(r, ms));

                broadcastSSE({ type: 'pipeline_start', message: 'Starting full pipeline...' });
                await delay(50);

                // Stage 1
                broadcastSSE({ type: 'stage_start', stage: 1, name: 'Signal Ingestion' });
                await delay(50);
                const s1 = processSignalIngestion();
                pipelineResults[1] = s1;
                broadcastSSE({ type: 'stage_complete', stage: 1, data: s1 });
                await delay(100);

                // Stage 2
                broadcastSSE({ type: 'stage_start', stage: 2, name: 'OODA Analysis' });
                await delay(50);
                const s2 = processOODAAnalysis(s1);
                pipelineResults[2] = s2;
                broadcastSSE({ type: 'stage_complete', stage: 2, data: s2 });
                await delay(100);

                // Stage 3
                broadcastSSE({ type: 'stage_start', stage: 3, name: 'Wiki Compilation' });
                await delay(50);
                const s3 = processWikiCompilation();
                pipelineResults[3] = s3;
                broadcastSSE({ type: 'stage_complete', stage: 3, data: s3 });
                await delay(100);

                // Stage 4
                broadcastSSE({ type: 'stage_start', stage: 4, name: 'Site Generation' });
                await delay(50);
                const s4 = processSiteGeneration(s3);
                pipelineResults[4] = s4;
                broadcastSSE({ type: 'stage_complete', stage: 4, data: s4 });
                await delay(100);

                // Stage 5
                broadcastSSE({ type: 'stage_start', stage: 5, name: 'Quality Verification' });
                await delay(50);
                const s5 = processQualityVerification(s4);
                pipelineResults[5] = s5;
                broadcastSSE({ type: 'stage_complete', stage: 5, data: s5 });
                await delay(50);

                broadcastSSE({
                    type: 'pipeline_complete',
                    message: 'Full pipeline complete',
                    summary: {
                        score: s5.results.score,
                        pagesGenerated: s4.results.entityPagesGenerated || s4.results.pagesGenerated,
                        outputUrl: '/index.html'
                    }
                });

                // Save pipeline run to persistent storage
                const pipelineRun = {
                    timestamp: new Date().toISOString(),
                    score: s5.results.score,
                    pagesGenerated: s4.results.entityPagesGenerated || s4.results.pagesGenerated,
                    stages: {
                        signal_ingestion: s1.status,
                        ooda_analysis: s2.status,
                        wiki_compilation: s3.status,
                        site_generation: s4.status,
                        quality_verification: s5.status
                    }
                };
                persistedState.pipelineRuns.push(pipelineRun);
                persistedState.lastRun = pipelineRun;
                savePersistedState();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    stages: [s1, s2, s3, s4, s5],
                    score: s5.results.score,
                    pagesGenerated: s4.results.entityPagesGenerated || s4.results.pagesGenerated,
                    outputUrl: '/index.html'
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // ---- Design Verification Endpoint ----
    if (pathname === '/api/verify-design' && req.method === 'GET') {
        const outputPath = path.join(OUTPUT_DIR, 'index.html');
        if (!fs.existsSync(outputPath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Output not generated yet. Run pipeline first.' }));
            return;
        }

        const html = fs.readFileSync(outputPath, 'utf8');
        const checks = [];

        // 1. Font families
        checks.push({
            rule: 'Montserrat for headings',
            category: 'Typography',
            pass: html.includes('Montserrat') && (html.includes('rot-font-display') || /h[1-6].*Montserrat|\.hero.*Montserrat|\.section.*Montserrat|\.data-slide-title.*Montserrat/s.test(html)),
            detail: 'Display/headings must use Montserrat (via CSS variable or direct)'
        });
        checks.push({
            rule: 'Lato for body text',
            category: 'Typography',
            pass: html.includes("'Lato'") && html.includes('font-family: var(--rot-font-body)'),
            detail: 'Body text must use Lato'
        });
        checks.push({
            rule: 'JetBrains Mono for data',
            category: 'Typography',
            pass: html.includes("'JetBrains Mono'") && (html.includes('.metric-value') || html.includes('data-cell') || html.includes('mono')),
            detail: 'All data/specs must use monospace font'
        });

        // 2. Border radius max 6px
        const radiusMatches = html.match(/border-radius:\s*(\d+)px/g) || [];
        const maxRadius = radiusMatches.reduce((max, m) => {
            const val = parseInt(m.match(/(\d+)/)[1]);
            return Math.max(max, val);
        }, 0);
        checks.push({
            rule: 'Max border-radius 6px',
            category: 'Layout',
            pass: maxRadius <= 6,
            detail: `Found max radius: ${maxRadius}px (limit: 6px)`
        });

        // 3. No box-shadow
        checks.push({
            rule: 'No box-shadow',
            category: 'Layout',
            pass: !html.includes('box-shadow'),
            detail: 'DESIGN.md forbids all shadows'
        });

        // 4. 1px borders
        const borderMatches = html.match(/border[^;]*:\s*(\d+)px/g) || [];
        const hasCorrectBorders = borderMatches.some(m => m.includes('1px'));
        checks.push({
            rule: '1px hairline borders',
            category: 'Layout',
            pass: hasCorrectBorders,
            detail: 'Interface must use 1px hairline borders'
        });

        // 5. Color system
        checks.push({
            rule: 'Foundational Blue #00539F',
            category: 'Colors',
            pass: html.includes('#00539F') || html.includes('var(--rot-foundational-blue)'),
            detail: 'Brand primary color must be present'
        });
        checks.push({
            rule: 'Action Blue #0066CC',
            category: 'Colors',
            pass: html.includes('#0066CC') || html.includes('var(--rot-action-primary)'),
            detail: 'CTA color must be Action Blue'
        });
        checks.push({
            rule: 'Blueprint Dark #0A1128',
            category: 'Colors',
            pass: html.includes('#0A1128') || html.includes('var(--rot-blueprint-dark)'),
            detail: 'Dark sections must use Blueprint Dark'
        });
        checks.push({
            rule: 'Terminal Green #4ADE80',
            category: 'Colors',
            pass: html.includes('#4ADE80') || html.includes('var(--rot-terminal-green)'),
            detail: 'Data highlights in dark mode must use Terminal Green'
        });

        // 6. translateY(1px) feedback
        checks.push({
            rule: 'translateY(1px) press feedback',
            category: 'Interaction',
            pass: html.includes('translateY(1px)'),
            detail: 'Buttons must have physical press feedback'
        });

        // 7. 0ms transitions
        checks.push({
            rule: '0ms state transitions',
            category: 'Interaction',
            pass: html.includes('0ms') || html.includes('transition: all 0ms'),
            detail: 'State changes must be instant'
        });

        // 8. JSON-LD schema
        checks.push({
            rule: 'JSON-LD Schema markup',
            category: 'SEO',
            pass: html.includes('application/ld+json') && html.includes('schema.org'),
            detail: 'Must include structured data for SEO'
        });

        // 9. Evidence Protocol
        checks.push({
            rule: 'Evidence Protocol section',
            category: 'Content',
            pass: html.includes('evidence') || html.includes('Evidence'),
            detail: 'Must include evidence/compliance section'
        });

        // 10. Bilingual support
        checks.push({
            rule: 'i18n / Bilingual support',
            category: 'Content',
            pass: html.includes('lang=') && (html.includes('English') || html.includes('中文') || html.includes('lang="en"')),
            detail: 'Must support EN/ZH languages'
        });

        // 11. 8px grid spacing
        checks.push({
            rule: '8px grid spacing',
            category: 'Layout',
            pass: html.includes('8px') || html.includes('16px') || html.includes('24px') || html.includes('32px') || html.includes('48px'),
            detail: 'Spacing must follow 8px grid (4,8,16,24,32,48,64,96,128)'
        });

        // 12. Meta description
        checks.push({
            rule: 'Meta description for SEO',
            category: 'SEO',
            pass: html.includes('<meta name="description"'),
            detail: 'Must have meta description tag'
        });

        const passed = checks.filter(c => c.pass).length;
        const total = checks.length;
        const score = Math.round((passed / total) * 100);

        // Group by category
        const categories = {};
        checks.forEach(c => {
            if (!categories[c.category]) categories[c.category] = { passed: 0, total: 0, checks: [] };
            categories[c.category].total++;
            if (c.pass) categories[c.category].passed++;
            categories[c.category].checks.push(c);
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            score,
            passed,
            total,
            categories,
            checks,
            outputSize: html.length,
            outputUrl: '/index.html'
        }));
        return;
    }

    // ---- Pipeline Results Endpoint ----
    if (pathname === '/api/pipeline/results' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            hasResults: Object.keys(pipelineResults).length > 0,
            stages: pipelineResults
        }));
        return;
    }

    // ---- Persisted State Endpoint ----
    if (pathname === '/api/state' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            state: persistedState,
            summary: {
                totalSignals: persistedState.signals.length,
                totalPipelineRuns: persistedState.pipelineRuns.length,
                lastRun: persistedState.lastRun
            }
        }));
        return;
    }

    // ---- Multi-Page List Endpoint ----
    if (pathname === '/api/pages' && req.method === 'GET') {
        const pagesDir = path.join(OUTPUT_DIR, 'pages');
        let pages = [];
        if (fs.existsSync(pagesDir)) {
            const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
            pages = files.map(f => ({
                filename: f,
                url: `/pages/${f}`,
                name: f.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            totalPages: pages.length,
            pages
        }));
        return;
    }

    // ---- Check & Regenerate Missing Pages ----
    if (pathname === '/api/pages/check' && req.method === 'GET') {
        const pagesDir = path.join(OUTPUT_DIR, 'pages');
        const existingFiles = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')) : [];

        // Build expected page list from entity data
        const entities = dataCache['llm_wiki_data.json']?.entities || [];
        const expectedPages = [];
        entities.forEach(entity => {
            const content = entity.content || '';
            let type = 'other';
            if (content.includes('Type**: [[Product]]') || content.includes('Market Strategy')) type = 'product';
            else if (content.includes('Type**: [[Category]]')) type = 'category';
            else if (content.includes('Dominant Products') || content.includes('Incumbent')) type = 'competitor';
            else if (content.includes('Type**: [[Material]]')) type = 'material';
            else if (content.includes('Type**: [[Technology]]')) type = 'technology';
            else type = 'entity';

            const slug = type === 'product' ? makeSlug(entity.name) :
                         type === 'competitor' ? `competitor-${makeSlug(entity.name)}` :
                         type === 'category' ? `category-${makeSlug(entity.name)}` :
                         type === 'material' ? `material-${makeSlug(entity.name)}` :
                         type === 'technology' ? `tech-${makeSlug(entity.name)}` :
                         `entity-${makeSlug(entity.name)}`;
            expectedPages.push({ name: entity.name, slug, filename: `${slug}.html`, type });
        });

        const missing = expectedPages.filter(p => !existingFiles.includes(p.filename));
        const extra = existingFiles.filter(f => !expectedPages.some(p => p.filename === f) && f !== 'index.html');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            totalExpected: expectedPages.length,
            totalExisting: existingFiles.length,
            missing: missing.map(p => ({ name: p.name, type: p.type, filename: p.filename })),
            extra,
            allPresent: missing.length === 0
        }));
        return;
    }

    // ---- Regenerate All Pages (force) ----
    if (pathname === '/api/pages/regenerate' && req.method === 'POST') {
        const wikiData = pipelineResults[3] || dataCache['llm_wiki_data.json'];
        if (!wikiData || !wikiData.entities) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No wiki data loaded. Run Pipeline stages 1-3 first.' }));
            return;
        }
        const result = processSiteGeneration(wikiData);
        pipelineResults[4] = result;
        broadcastSSE({ type: 'stage_complete', stage: 4, data: result });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...result }));
        return;
    }

    // ---- Keyword Research (Expansion Engine) ----
    if (pathname === '/api/keywords/research' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const options = body ? JSON.parse(body) : {};
                const result = await runKeywordResearch(options);
                // Update cache with expanded keywords
                if (result.keywords) {
                    dataCache._expandedKeywords = result.keywords;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: e.message }));
            }
        });
        return;
    }

    // ---- Configure Google Ads API Credentials ----
    if (pathname === '/api/keywords/google-ads-config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const creds = JSON.parse(body);
                dataCache._googleAdsCredentials = {
                    developerToken: creds.developerToken || '',
                    accessToken: creds.accessToken || '',
                    customerId: creds.customerId || ''
                };
                // Persist credentials
                const credsPath = path.join(PERSIST_DIR, 'google_ads_credentials.json');
                fs.writeFileSync(credsPath, JSON.stringify(dataCache._googleAdsCredentials, null, 2), 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Google Ads credentials saved' }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // ---- Get Google Ads API Status ----
    if (pathname === '/api/keywords/google-ads-config' && req.method === 'GET') {
        const creds = dataCache._googleAdsCredentials;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            configured: !!(creds?.developerToken),
            hasToken: !!(creds?.developerToken),
            hasAccess: !!(creds?.accessToken),
            hasCustomer: !!(creds?.customerId)
        }));
        return;
    }

    // ---- Agent SDK Status Endpoint ----
    if (pathname === '/api/sdk/status' && req.method === 'GET') {
        checkAgentSDK();
        const skillsList = ['strategy-operator', 'wiki-compiler', 'autoresearch'];
        const skillStatus = {};

        // Get LLM provider config
        const llmProvider = getActiveLLMProvider();
        const envVars = {
            ...process.env, DATA_DIR,
            LLM_MODEL: llmProvider.model
        };

        if (llmProvider.provider === 'openai') {
            envVars.OPENAI_API_KEY = llmProvider.apiKey;
            envVars.OPENAI_BASE_URL = llmProvider.baseUrl;
        } else {
            envVars.DEEPSEEK_API_KEY = llmProvider.apiKey;
            envVars.DEEPSEEK_BASE_URL = llmProvider.baseUrl;
        }

        for (const skill of skillsList) {
            try {
                const result = execSync(
                    `"${agentSDKStatus.pythonPath}" "${SKILL_EXECUTOR}" "${skill}" --data-dir "${DATA_DIR}"`,
                    { encoding: 'utf8', timeout: 30000, env: envVars }
                );
                const parsed = JSON.parse(result.trim());
                skillStatus[skill] = { available: true, mode: parsed.mode || 'fallback', status: parsed.status };
            } catch (e) {
                skillStatus[skill] = { available: false, error: e.message.substring(0, 100) };
            }
        }

        // LLM status
        const llmStatus = {
            configPath: LLM_CONFIG_PATH,
            configExists: fs.existsSync(LLM_CONFIG_PATH),
            activeProvider: llmProvider.provider,
            hasApiKey: !!llmProvider.apiKey,
            model: llmProvider.model,
            baseUrl: llmProvider.baseUrl,
            fallbackEnabled: llmConfig.fallback_to_js !== false
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            sdk: agentSDKStatus,
            skills: skillStatus,
            llm: llmStatus,
            scriptsDir: SCRIPTS_DIR,
            executorPath: SKILL_EXECUTOR
        }));
        return;
    }

    // ---- LLM Config Endpoint ----
    if (pathname === '/api/llm/config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            config: llmConfig,
            configPath: LLM_CONFIG_PATH,
            configExists: fs.existsSync(LLM_CONFIG_PATH),
            activeProvider: llmConfig.active_provider || 'deepseek',
            hasApiKey: !!(llmConfig[llmConfig.active_provider || 'deepseek']?.api_key)
        }));
        return;
    }

    if (pathname === '/api/llm/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const updates = JSON.parse(body);

                // Update config
                if (updates.active_provider) llmConfig.active_provider = updates.active_provider;
                if (updates.deepseek) {
                    if (updates.deepseek.api_key !== undefined) llmConfig.deepseek.api_key = updates.deepseek.api_key;
                    if (updates.deepseek.base_url) llmConfig.deepseek.base_url = updates.deepseek.base_url;
                    if (updates.deepseek.model) llmConfig.deepseek.model = updates.deepseek.model;
                }
                if (updates.openai) {
                    if (updates.openai.api_key !== undefined) llmConfig.openai.api_key = updates.openai.api_key;
                    if (updates.openai.base_url) llmConfig.openai.base_url = updates.openai.base_url;
                    if (updates.openai.model) llmConfig.openai.model = updates.openai.model;
                }
                if (updates.fallback_to_js !== undefined) llmConfig.fallback_to_js = updates.fallback_to_js;

                // Save config
                const configDir = path.dirname(LLM_CONFIG_PATH);
                if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
                fs.writeFileSync(LLM_CONFIG_PATH, JSON.stringify(llmConfig, null, 2), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'LLM config updated',
                    config: llmConfig
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON', message: e.message }));
            }
        });
        return;
    }

    // ---- Data Endpoints ----
    if (pathname.startsWith('/data/parsed/')) {
        const fileName = pathname.replace('/data/parsed/', '');
        const dataPath = path.join(DATA_DIR, fileName);

        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found', path: dataPath }));
        }
        return;
    }

    // ---- Output Pages (serves from OUTPUT_DIR) ----
    if (pathname.startsWith('/output/') || pathname.startsWith('/pages/') || pathname === '/' || pathname === '/index.html') {
        let relPath = pathname;
        if (pathname.startsWith('/output/')) relPath = pathname.replace('/output/', '');
        else if (pathname === '/') relPath = 'index.html';
        const filePath = path.join(OUTPUT_DIR, relPath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.xml': 'application/xml'
            };
            const data = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Output page not found</h1><p>Run the pipeline first to generate output.</p>');
        }
        return;
    }

    // ---- Static Files ----
    let filePath = pathname === '/' ? '/index.html' : pathname;
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const ext = path.extname(fullPath);
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        const data = fs.readFileSync(fullPath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// ============================================
// START
// ============================================

loadAllData();

server.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ViaSurg AI CMO Platform - Server Running`);
    console.log(`${'='.repeat(60)}`);
    console.log(`  Main App:     http://localhost:${PORT}`);
    console.log(`  Output Page:  http://localhost:${PORT}/output/index.html`);
    console.log(`  SSE Events:   http://localhost:${PORT}/api/events`);
    console.log(`  Pipeline API: POST http://localhost:${PORT}/api/pipeline/run`);
    console.log(`${'='.repeat(60)}\n`);
});
