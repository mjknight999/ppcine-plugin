/**
 * PPCine Universal Plugin Server - Single File Version
 * Deploy to Vercel easily!
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ============================================
// PPCINE CLIENT
// ============================================
class PPCineClient {
    constructor() {
        this.baseURL = 'https://1ifz.w6mj.com/';
        this.deviceId = 'plugin_' + Math.random().toString(36).substring(2, 15);
        this.token = null;
        this.initialized = false;
        this.cache = new Map();
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/4.9.0'
            }
        });
    }

    isInitialized() { return this.initialized; }

    async initialize() {
        try {
            const response = await this.request('api/public/init', {
                device_id: this.deviceId,
                is_install: '1'
            });

            if (response.result) {
                if (response.result.user_info?.token) {
                    this.token = response.result.user_info.token;
                }
                if (response.result.sys_conf?.api_url2) {
                    this.baseURL = response.result.sys_conf.api_url2;
                    if (!this.baseURL.endsWith('/')) this.baseURL += '/';
                    this.client.defaults.baseURL = this.baseURL;
                }
                this.initialized = true;
                return response.result;
            }
            throw new Error('Invalid initialization response');
        } catch (error) {
            console.error('Initialize error:', error.message);
            throw error;
        }
    }

    async request(endpoint, params = {}) {
        const allParams = { device_id: this.deviceId, ...params };
        if (this.token) allParams.token = this.token;

        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(allParams)) {
            formData.append(key, value);
        }

        const response = await this.client.post(endpoint, formData.toString());
        return response.data;
    }

    getCached(key) {
        const item = this.cache.get(key);
        if (item && Date.now() - item.time < 300000) return item.data;
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, { data, time: Date.now() });
    }

    async getChannels() {
        const cached = this.getCached('channels');
        if (cached) return cached;
        const response = await this.request('api/channel/get_list', { channel_id: 0 });
        const result = response.result || [];
        this.setCache('channels', result);
        return result;
    }

    async getChannelVideos(channelId, page = 1) {
        const cacheKey = `channel_${channelId}_${page}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        const response = await this.request('api/channel/get_info', {
            channel_id: channelId, pn: page, psize: 100
        });
        const result = response.result || [];
        this.setCache(cacheKey, result);
        return result;
    }

    async getRankingVideos(topicId, page = 1) {
        const response = await this.request('api/topic/vod_list', { topic_id: topicId, pn: page });
        return response.result?.list || [];
    }

    async getSpecialLists(typeId = 1) {
        const cached = this.getCached(`special_${typeId}`);
        if (cached) return cached;
        const response = await this.request('api/topic/list', { type_id: typeId });
        const result = response.result || [];
        this.setCache(`special_${typeId}`, result);
        return result;
    }

    async filterVideos(typeId, options = {}) {
        const { genre, area, year, page = 1 } = options;
        const params = { type_id: typeId, pn: page };
        if (genre) params.class = genre;
        if (area) params.area = area;
        if (year) params.year = year;
        const response = await this.request('api/search/screen', params);
        return response.result || [];
    }

    async search(keyword, page = 1) {
        const response = await this.request('api/search/result', { wd: keyword, pn: page });
        return response.result || [];
    }

    async getVideoDetails(vodId, sourceId = null) {
        const cacheKey = `video_${vodId}_${sourceId || 'default'}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        const params = { vod_id: vodId };
        if (sourceId) params.source_id = sourceId;
        const response = await this.request('api/vod/info', params);
        const result = response.result;
        if (result) this.setCache(cacheKey, result);
        return result;
    }

    async getHotSearchTerms() {
        const cached = this.getCached('hot_search');
        if (cached) return cached;
        const response = await this.request('api/search/hot_search');
        const result = response.result || [];
        this.setCache('hot_search', result);
        return result;
    }

    async getSearchSuggestions(keyword) {
        const response = await this.request('api/search/suggest', { wd: keyword });
        return response.result || [];
    }

    transformToMeta(video, type = 'movie') {
        if (!video) return null;
        const id = video.id || video.vod_id;
        return {
            id: `ppcine:${id}`,
            type: type,
            name: video.vod_name || video.title || 'Unknown',
            poster: video.vod_pic || null,
            background: video.vod_pic || null,
            description: video.vod_blurb || video.vod_content || '',
            year: video.vod_year || null,
            genres: video.vod_tag ? video.vod_tag.split(',').map(g => g.trim()) : [],
            rating: video.vod_douban_score || video.vod_score || null,
            cast: video.vod_actor ? video.vod_actor.split(',').map(a => a.trim()) : [],
            director: video.vod_director ? video.vod_director.split(',').map(d => d.trim()) : [],
            country: video.vod_area || null,
            runtime: this.calculateRuntime(video),
            status: video.vod_isend === 1 ? 'Completed' : 'Ongoing',
            totalEpisodes: video.vod_total ? parseInt(video.vod_total) : null,
            currentEpisode: video.vod_serial ? parseInt(video.vod_serial) : null,
            remarks: video.remarks || video.vod_remarks || null,
            ppcineId: id,
            episodes: this.transformEpisodes(video.vod_collection),
            ...(type === 'series' && {
                videos: this.transformEpisodesToVideos(video.vod_collection, id)
            })
        };
    }

    transformEpisodes(vodCollection) {
        if (!vodCollection || !Array.isArray(vodCollection)) return [];
        return vodCollection.map((ep, index) => ({
            id: ep.vod_id || index + 1,
            title: ep.title || `Episode ${index + 1}`,
            episode: ep.collection || index + 1,
            streamUrl: ep.vod_url || null,
            downloadUrl: ep.down_url || null,
            duration: ep.vod_duration ? parseInt(ep.vod_duration) : null,
            sourceId: ep.source_id || null,
            isP2P: ep.is_p2p === 1
        }));
    }

    transformEpisodesToVideos(vodCollection, parentId) {
        if (!vodCollection || !Array.isArray(vodCollection)) return [];
        return vodCollection.map((ep, index) => ({
            id: `ppcine:${parentId}:${ep.collection || index + 1}`,
            title: ep.title || `Episode ${ep.collection || index + 1}`,
            episode: ep.collection || index + 1,
            season: 1
        }));
    }

    transformToStreams(video) {
        if (!video || !video.vod_collection) return [];
        return video.vod_collection.map((ep, index) => {
            if (!ep.vod_url) return null;
            return {
                name: 'PPCine',
                title: ep.title || `Episode ${index + 1}`,
                url: ep.vod_url,
                quality: this.detectQuality(ep.title || ''),
                episode: ep.collection || index + 1,
                duration: ep.vod_duration ? parseInt(ep.vod_duration) : null,
                behaviorHints: { notWebReady: false, bingeGroup: `ppcine-${video.id || video.vod_id}` }
            };
        }).filter(s => s !== null);
    }

    detectQuality(title) {
        const t = title.toLowerCase();
        if (t.includes('4k') || t.includes('2160')) return '4K';
        if (t.includes('1080') || t.includes('fhd')) return '1080p';
        if (t.includes('720') || t.includes('hd')) return '720p';
        if (t.includes('480') || t.includes('sd')) return '480p';
        return 'HD';
    }

    calculateRuntime(video) {
        if (video.vod_collection && video.vod_collection.length > 0) {
            const firstEp = video.vod_collection[0];
            if (firstEp.vod_duration) {
                return Math.round(parseInt(firstEp.vod_duration) / 60) + ' min';
            }
        }
        return null;
    }

    async searchByTMDBTitle(title, year = null) {
        let searchTerm = title.replace(/[:\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
        const results = await this.search(searchTerm);
        if (!results || results.length === 0) {
            const simplifiedTitle = title.split(':')[0].trim();
            if (simplifiedTitle !== searchTerm) {
                return await this.search(simplifiedTitle);
            }
            return [];
        }
        if (year && results.length > 1) {
            const yearStr = year.toString();
            const exactMatch = results.find(r => r.vod_year === yearStr || r.vod_year?.includes(yearStr));
            if (exactMatch) {
                return [exactMatch, ...results.filter(r => r !== exactMatch)];
            }
        }
        return results;
    }
}

// Initialize client
const ppcine = new PPCineClient();

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());
app.use((req, res, next) => { req.ppcine = ppcine; next(); });

// ============================================
// MANIFEST
// ============================================
const manifest = {
    id: "com.ppcine.streams",
    name: "PPCine Streams",
    version: "1.0.0",
    description: "Stream movies, TV series, and anime from PPCine",
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series"],
    catalogs: [
        { type: "movie", id: "ppcine-trending", name: "🔥 Trending Movies", extra: [{ name: "skip", isRequired: false }] },
        { type: "movie", id: "ppcine-latest", name: "🆕 Latest Movies", extra: [{ name: "skip", isRequired: false }] },
        { type: "series", id: "ppcine-series", name: "📺 TV Series", extra: [{ name: "skip", isRequired: false }] },
        { type: "series", id: "ppcine-anime", name: "🎌 Anime", extra: [{ name: "skip", isRequired: false }] },
        { type: "movie", id: "ppcine-search", name: "🔍 Search", extra: [{ name: "search", isRequired: true }] }
    ],
    idPrefixes: ["ppcine:", "tmdb:", "tt"],
    behaviorHints: { adult: false, p2p: false }
};

app.get('/manifest.json', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ ...manifest, baseUrl });
});

app.get('/', (req, res) => res.redirect('/manifest.json'));

// ============================================
// CATALOG ENDPOINTS
// ============================================
app.get('/catalog/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const extra = {
            genre: req.query.genre || null,
            skip: parseInt(req.query.skip) || 0,
            search: req.query.search || null
        };

        if (!ppcine.isInitialized()) await ppcine.initialize();

        let metas = [];
        const page = Math.floor(extra.skip / 20) + 1;

        if (id === 'ppcine-trending' || id === 'ppcine-latest') {
            const typeId = type === 'movie' ? 1 : 2;
            const videos = await ppcine.filterVideos(typeId, { page });
            metas = videos.map(v => ppcine.transformToMeta(v, type));
        } else if (id === 'ppcine-series') {
            const videos = await ppcine.filterVideos(2, { page });
            metas = videos.map(v => ppcine.transformToMeta(v, 'series'));
        } else if (id === 'ppcine-anime') {
            const videos = await ppcine.filterVideos(4, { page });
            metas = videos.map(v => ppcine.transformToMeta(v, 'series'));
        } else if (id === 'ppcine-search' && extra.search) {
            const videos = await ppcine.search(extra.search);
            metas = videos.map(v => {
                const contentType = (v.type_id === 1 || v.type_pid === 1) ? 'movie' : 'series';
                return ppcine.transformToMeta(v, contentType);
            });
        }

        res.json({ metas });
    } catch (error) {
        console.error('Catalog error:', error.message);
        res.json({ metas: [], error: error.message });
    }
});

// ============================================
// META ENDPOINTS
// ============================================
app.get('/meta/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!ppcine.isInitialized()) await ppcine.initialize();

        let meta = null;

        if (id.startsWith('ppcine:')) {
            const vodId = parseInt(id.replace('ppcine:', '').split(':')[0]);
            if (!isNaN(vodId)) {
                const video = await ppcine.getVideoDetails(vodId);
                meta = ppcine.transformToMeta(video, type);
            }
        } else {
            const vodId = parseInt(id);
            if (!isNaN(vodId)) {
                const video = await ppcine.getVideoDetails(vodId);
                meta = ppcine.transformToMeta(video, type);
            }
        }

        res.json({ meta: meta || null });
    } catch (error) {
        console.error('Meta error:', error.message);
        res.json({ meta: null, error: error.message });
    }
});

app.get('/meta/:type/:id/bytitle', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { title, year } = req.query;
        if (!title) return res.json({ meta: null, error: 'Title is required' });
        if (!ppcine.isInitialized()) await ppcine.initialize();

        const results = await ppcine.searchByTMDBTitle(title, year);
        if (results && results.length > 0) {
            const video = await ppcine.getVideoDetails(results[0].id || results[0].vod_id);
            const meta = ppcine.transformToMeta(video, type);
            meta.externalId = id;
            return res.json({ meta });
        }
        res.json({ meta: null, error: 'No matching content found' });
    } catch (error) {
        console.error('Meta bytitle error:', error.message);
        res.json({ meta: null, error: error.message });
    }
});

// ============================================
// STREAM ENDPOINTS
// ============================================
app.get('/stream/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { episode, title, year } = req.query;
        if (!ppcine.isInitialized()) await ppcine.initialize();

        let streams = [];

        if (id.startsWith('ppcine:')) {
            const parts = id.replace('ppcine:', '').split(':');
            const vodId = parseInt(parts[0]);
            const episodeNum = parts[1] ? parseInt(parts[1]) : (episode ? parseInt(episode) : null);

            if (!isNaN(vodId)) {
                const video = await ppcine.getVideoDetails(vodId);
                if (video) {
                    streams = ppcine.transformToStreams(video);
                    if (episodeNum !== null && !isNaN(episodeNum)) {
                        streams = streams.filter(s => s.episode === episodeNum);
                    }
                }
            }
        } else if ((id.startsWith('tmdb:') || id.startsWith('tt')) && title) {
            const results = await ppcine.searchByTMDBTitle(title, year);
            if (results && results.length > 0) {
                const video = await ppcine.getVideoDetails(results[0].id || results[0].vod_id);
                if (video) {
                    streams = ppcine.transformToStreams(video);
                    if (episode) {
                        const ep = parseInt(episode);
                        streams = streams.filter(s => s.episode === ep);
                    }
                }
            }
        } else {
            const vodId = parseInt(id);
            if (!isNaN(vodId)) {
                const video = await ppcine.getVideoDetails(vodId);
                if (video) {
                    streams = ppcine.transformToStreams(video);
                    if (episode) {
                        const ep = parseInt(episode);
                        streams = streams.filter(s => s.episode === ep);
                    }
                }
            }
        }

        res.json({ streams });
    } catch (error) {
        console.error('Stream error:', error.message);
        res.json({ streams: [], error: error.message });
    }
});

app.get('/stream/lookup', async (req, res) => {
    try {
        const { title, year, episode, type } = req.query;
        if (!title) return res.json({ streams: [], error: 'Title is required' });
        if (!ppcine.isInitialized()) await ppcine.initialize();

        const results = await ppcine.searchByTMDBTitle(title, year);
        if (results && results.length > 0) {
            const video = await ppcine.getVideoDetails(results[0].id || results[0].vod_id);
            if (video) {
                let streams = ppcine.transformToStreams(video);
                if (episode) {
                    const ep = parseInt(episode);
                    streams = streams.filter(s => s.episode === ep);
                }
                return res.json({ streams });
            }
        }
        res.json({ streams: [] });
    } catch (error) {
        console.error('Stream lookup error:', error.message);
        res.json({ streams: [], error: error.message });
    }
});

// ============================================
// SEARCH ENDPOINTS
// ============================================
app.get('/search', async (req, res) => {
    try {
        const { q, query, type, page = 1 } = req.query;
        const searchTerm = q || query;
        if (!searchTerm) return res.json({ results: [], error: 'Search query required' });
        if (!ppcine.isInitialized()) await ppcine.initialize();

        const videos = await ppcine.search(searchTerm, parseInt(page));
        let results = videos.map(v => {
            const contentType = (v.type_id === 1 || v.type_pid === 1) ? 'movie' : 'series';
            return ppcine.transformToMeta(v, contentType);
        });
        if (type) results = results.filter(r => r.type === type);

        res.json({ results });
    } catch (error) {
        console.error('Search error:', error.message);
        res.json({ results: [], error: error.message });
    }
});

app.get('/search/trending', async (req, res) => {
    try {
        if (!ppcine.isInitialized()) await ppcine.initialize();
        const hotTerms = await ppcine.getHotSearchTerms();
        res.json({ terms: hotTerms.map(t => t.keyword || t.wd || t.name).filter(Boolean) });
    } catch (error) {
        res.json({ terms: [], error: error.message });
    }
});

app.get('/search/suggest', async (req, res) => {
    try {
        const { q, query } = req.query;
        const searchTerm = q || query;
        if (!searchTerm) return res.json({ suggestions: [] });
        if (!ppcine.isInitialized()) await ppcine.initialize();
        const suggestions = await ppcine.getSearchSuggestions(searchTerm);
        res.json({ suggestions: suggestions.map(s => s.keyword || s.wd || s.name || s).filter(Boolean) });
    } catch (error) {
        res.json({ suggestions: [], error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0', initialized: ppcine.isInitialized() });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        endpoints: ['/manifest.json', '/catalog/:type/:id', '/meta/:type/:id', '/stream/:type/:id', '/search?q=query']
    });
});

// ============================================
// SERVER STARTUP (Works on ALL platforms)
// ============================================

// Export for serverless platforms (Vercel, Netlify, AWS Lambda)
module.exports = app;

// Start server for container/traditional hosting (Railway, Render, Fly.io, Heroku, VPS)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';
    
    ppcine.initialize().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`✅ PPCine Plugin Server running!`);
            console.log(`📍 Local:   http://localhost:${PORT}`);
            console.log(`📍 Network: http://${HOST}:${PORT}`);
            console.log(`🔗 Manifest: http://localhost:${PORT}/manifest.json`);
            console.log(`💚 Health:   http://localhost:${PORT}/health`);
        });
    }).catch((err) => {
        console.warn('⚠️ Initial connection failed, starting anyway...', err.message);
        app.listen(PORT, HOST, () => {
            console.log(`✅ PPCine Plugin Server running on port ${PORT}`);
            console.log(`⚠️ Note: Will initialize on first request`);
        });
    });
}

