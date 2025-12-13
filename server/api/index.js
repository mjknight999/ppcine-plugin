/**
 * PPCine Universal Plugin Server - Single File Version
 * Deploy to Vercel easily!
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');


const app = express();

// ============================================
// PPCINE CLIENT
// ============================================
class PPCineClient {
    // ==========================================
    // AUTHENTICATION CONSTANTS (extracted from Android app)
    // ==========================================
    static SECRET_KEY = '47Q8tBqO4YqrMHf4'; // Decrypted from Android app's encrypted key
    static APP_ID = 'movieph';
    static VERSION = '40000';
    static SYS_PLATFORM = '2'; // 2 = Android
    static CHANNEL_CODE = 'movieph_1002'; // From AndroidManifest UMENG_CHANNEL

    // AES decryption constants (from ak/a.java - AESOperator)
    static AES_KEY = '0123456789123456';
    static AES_IV = '2015030120123456';

    // Generate MD5 hash
    static md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    // Generate signature: MD5(SECRET_KEY + device_id + timestamp).toUpperCase()
    static generateSign(deviceId, timestamp) {
        const toHash = PPCineClient.SECRET_KEY + deviceId + timestamp;
        return PPCineClient.md5(toHash).toUpperCase();
    }

    // Decrypt AES-encrypted API response (from ak/a.java)
    static decryptResponse(encryptedBase64) {
        try {
            // Base64 decode
            const encrypted = Buffer.from(encryptedBase64, 'base64');
            console.log(`PPCineClient: Decrypting ${encrypted.length} bytes`);

            // AES decrypt using CBC mode with PKCS5 padding
            const decipher = crypto.createDecipheriv('aes-128-cbc',
                Buffer.from(PPCineClient.AES_KEY),
                Buffer.from(PPCineClient.AES_IV));
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString('utf8');
        } catch (e) {
            console.error(`PPCineClient: Decryption error: ${e.message}`);
            console.error(`PPCineClient: Encrypted data starts with: ${encryptedBase64.substring(0, 50)}...`);
            return null;
        }
    }

    // Generate a more Android-like device ID (32 char hex string)
    static generateDeviceId() {
        const chars = '0123456789abcdef';
        let deviceId = '';
        for (let i = 0; i < 32; i++) {
            deviceId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return deviceId;
    }


    constructor() {
        // Try multiple base URLs (Android app uses kuht.52s7g.com, but init may redirect)
        this.baseURLs = [
            'https://1ifz.w6mj.com/',
            'https://kuht.52s7g.com/'
        ];
        this.baseURL = this.baseURLs[0];
        this.deviceId = PPCineClient.generateDeviceId();
        this.token = null;
        this.initialized = false;
        this.initializationAttempted = false;
        this.cache = new Map();

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/4.9.0'
            },
            // Allow self-signed certificates (some backends use them)
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Accept 4xx as valid responses
            }
        });
    }

    isInitialized() { return this.initialized; }

    generateDeviceId() {
        return PPCineClient.generateDeviceId();
    }

    // Get authentication HEADERS for API requests (Android app sends these as headers, not body params!)
    getAuthHeaders() {
        const curTime = Date.now().toString();
        const sign = PPCineClient.generateSign(this.deviceId, curTime);

        // Generate a fake GAID (Google Advertising ID)
        const gaid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return {
            'app_id': PPCineClient.APP_ID,
            'package_name': 'com.movieph.bj.playvibes',
            'version': PPCineClient.VERSION,
            'sys_platform': PPCineClient.SYS_PLATFORM,
            'mob_mfr': 'samsung',
            'mobmodel': 'SM-G998U',
            'sysrelease': '13',
            'device_id': this.deviceId,
            'gaid': gaid,
            'channel_code': PPCineClient.CHANNEL_CODE,
            'androidid': this.deviceId.substring(0, 16), // Use first 16 chars of device_id
            'cur_time': curTime,
            'token': this.token || '',
            'sign': sign,
            'is_vvv': '0',
            'is_language': 'en',
            'is_display': '',
            'app_language': 'en',
            'en_al': '0'
        };
    }


    async initialize() {
        if (this.initializationAttempted && !this.initialized) {
            console.log('PPCineClient: Previous initialization failed, will retry with different approach');
            // Allow retry but with different device_id format
            this.deviceId = this.generateDeviceId();
        }

        this.initializationAttempted = true;

        // Try each base URL
        for (const baseUrl of this.baseURLs) {
            try {
                console.log('PPCineClient: Initializing with device_id:', this.deviceId);
                console.log('PPCineClient: Trying base URL:', baseUrl);

                // Set base URL for this attempt
                this.baseURL = baseUrl;
                this.client.defaults.baseURL = baseUrl;

                const response = await this.request('api/public/init', {
                    device_id: this.deviceId,
                    is_install: '1'
                }, true);

                console.log('PPCineClient: Init response received:', JSON.stringify(response).substring(0, 500));

                // Handle different response formats
                if (response) {
                    // Format 1: { result: { user_info: { token }, sys_conf: { api_url2 } } }
                    if (response.result) {
                        if (response.result.user_info?.token) {
                            this.token = response.result.user_info.token;
                            console.log('PPCineClient: Token received');
                        }
                        if (response.result.sys_conf?.api_url2) {
                            const newBaseURL = response.result.sys_conf.api_url2;
                            if (!newBaseURL.endsWith('/')) {
                                this.baseURL = newBaseURL + '/';
                            } else {
                                this.baseURL = newBaseURL;
                            }
                            this.client.defaults.baseURL = this.baseURL;
                            console.log('PPCineClient: Updated base URL to:', this.baseURL);
                        }
                        this.initialized = true;
                        console.log('PPCineClient: Initialization successful (result format)');
                        return response.result;
                    }

                    // Format 2: { code: 10000/1/200, msg/message: "...", data/result: {...} }
                    if (response.code !== undefined) {
                        console.log('PPCineClient: Init returned code:', response.code, 'msg:', response.message || response.msg);
                        if (response.code === 10000 || response.code === 1 || response.code === 200) {

                            if (response.data) {
                                if (response.data.user_info?.token) {
                                    this.token = response.data.user_info.token;
                                }
                                if (response.data.sys_conf?.api_url2) {
                                    const newBaseURL = response.data.sys_conf.api_url2;
                                    this.baseURL = newBaseURL.endsWith('/') ? newBaseURL : newBaseURL + '/';
                                    this.client.defaults.baseURL = this.baseURL;
                                }
                            }
                            this.initialized = true;
                            console.log('PPCineClient: Initialization successful (code format)');
                            return response;
                        }
                    }

                    // Format 3: Direct data
                    if (response.user_info || response.sys_conf) {
                        if (response.user_info?.token) {
                            this.token = response.user_info.token;
                        }
                        if (response.sys_conf?.api_url2) {
                            const newBaseURL = response.sys_conf.api_url2;
                            this.baseURL = newBaseURL.endsWith('/') ? newBaseURL : newBaseURL + '/';
                            this.client.defaults.baseURL = this.baseURL;
                        }
                        this.initialized = true;
                        console.log('PPCineClient: Initialization successful (direct format)');
                        return response;
                    }
                }

                // If we get here, response format not recognized
                console.warn('PPCineClient: Unrecognized response format for', baseUrl);
                console.warn('PPCineClient: Response keys:', Object.keys(response || {}));
            } catch (error) {
                console.error('PPCineClient: Initialize error with', baseUrl, ':', error.message);
                if (error.response) {
                    console.error('PPCineClient: Response status:', error.response.status);
                    console.error('PPCineClient: Response data:', JSON.stringify(error.response.data).substring(0, 500));
                } else if (error.code) {
                    console.error('PPCineClient: Error code:', error.code);
                }
                // Continue to next base URL
                continue;
            }
        }

        // If all base URLs failed, mark as attempted but not initialized
        console.error('PPCineClient: All initialization attempts failed');
        console.error('PPCineClient: Will continue without initialization - some endpoints may work');
        this.initialized = false;
        return null;
    }


    async request(endpoint, params = {}, skipInit = false) {
        // Get authentication HEADERS (Android app sends these as headers, not body params!)
        const authHeaders = this.getAuthHeaders();

        // Body params - include device_id as the Android app does for some endpoints
        const bodyParams = { device_id: this.deviceId, ...params };
        if (this.token) bodyParams.token = this.token;

        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(bodyParams)) {
            formData.append(key, value);
        }

        try {
            const url = `${this.baseURL}${endpoint}`;
            console.log(`PPCineClient: Requesting ${url}`);
            console.log(`PPCineClient: Headers:`, Object.keys(authHeaders).join(', '));
            console.log(`PPCineClient: Body params:`, Object.keys(bodyParams).join(', '));

            const response = await this.client.post(endpoint, formData.toString(), {
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'okhttp/4.9.0'
                },
                responseType: 'text' // Get raw text to handle both encrypted and plain responses
            });

            // Response is AES encrypted and base64 encoded
            let responseData = response.data;

            // If response is a string (encrypted), try to decrypt
            if (typeof responseData === 'string' && responseData.length > 0) {
                // Check if it's encrypted (doesn't start with '{')
                if (!responseData.startsWith('{')) {
                    const decrypted = PPCineClient.decryptResponse(responseData);
                    if (decrypted) {
                        try {
                            responseData = JSON.parse(decrypted);
                            console.log(`PPCineClient: Decrypted response for ${endpoint}`);
                        } catch (e) {
                            console.error('PPCineClient: Failed to parse decrypted JSON:', e.message);
                            responseData = decrypted;
                        }
                    } else {
                        console.error('PPCineClient: Failed to decrypt response for', endpoint);
                        // Try to parse the raw response as-is (might be an error message)
                        try {
                            const trimmed = responseData.trim();
                            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                                responseData = JSON.parse(trimmed);
                                console.log(`PPCineClient: Parsed raw response for ${endpoint}`);
                            }
                        } catch (e2) {
                            console.error('PPCineClient: Could not parse raw response either');
                        }
                    }
                } else {
                    // Already JSON string, parse it
                    try {
                        responseData = JSON.parse(responseData);
                    } catch (e) {
                        console.error('PPCineClient: Failed to parse JSON response:', e.message);
                    }
                }
            }

            // Log response for debugging
            if (endpoint === 'api/public/init' || response.status >= 400) {
                console.log(`PPCineClient: Response for ${endpoint}:`, JSON.stringify(responseData).substring(0, 500));
            }

            // Check for error codes in response  
            if (responseData && typeof responseData === 'object') {
                // API uses code 10000 for success
                if (responseData.code !== undefined) {
                    if (responseData.code === 10000 || responseData.code === 1 || responseData.code === 200) {
                        return responseData;
                    } else {
                        console.warn(`PPCineClient: API returned code ${responseData.code}:`, responseData.message || responseData.msg || 'Unknown error');
                    }
                }
            }

            return responseData;

        } catch (error) {
            console.error(`PPCineClient: Request failed for ${endpoint}:`, error.message);
            if (error.response) {
                console.error(`PPCineClient: Response status: ${error.response.status}`);
                console.error(`PPCineClient: Response headers:`, JSON.stringify(error.response.headers).substring(0, 200));
                if (error.response.data) {
                    console.error(`PPCineClient: Response data:`, JSON.stringify(error.response.data).substring(0, 500));
                }
            } else if (error.request) {
                console.error('PPCineClient: No response received - network error');
                console.error('PPCineClient: Request config:', JSON.stringify({
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL
                }));
            } else {
                console.error('PPCineClient: Error setting up request:', error.message);
            }
            throw error;
        }
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
        // Handle different response formats
        const result = Array.isArray(response?.result) ? response.result : (Array.isArray(response) ? response : []);
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
        // Handle different response formats
        const result = Array.isArray(response?.result) ? response.result : (Array.isArray(response) ? response : []);
        this.setCache(cacheKey, result);
        return result;
    }

    async getRankingVideos(topicId, page = 1) {
        try {
            console.log(`PPCineClient: getRankingVideos - topicId: ${topicId}, page: ${page}`);
            const response = await this.request('api/topic/vod_list', { topic_id: topicId, pn: page });
            // Handle different response formats
            let result = [];
            if (response?.result?.list && Array.isArray(response.result.list)) {
                result = response.result.list;
            } else if (Array.isArray(response?.result)) {
                result = response.result;
            } else if (Array.isArray(response)) {
                result = response;
            }
            console.log(`PPCineClient: getRankingVideos returned ${result.length} items`);
            return result;
        } catch (error) {
            console.error('PPCineClient: getRankingVideos error:', error.message);
            console.error('PPCineClient: Error response:', error.response?.data || 'No response data');
            return [];
        }
    }


    async getSpecialLists(typeId = 1) {
        const cached = this.getCached(`special_${typeId}`);
        if (cached) {
            console.log(`PPCineClient: getSpecialLists (cached) - typeId: ${typeId}, topics: ${cached.length}`);
            return cached;
        }
        try {
            console.log(`PPCineClient: getSpecialLists - typeId: ${typeId}`);
            const response = await this.request('api/topic/list', { type_id: typeId });

            // Handle different response formats
            let result = [];
            if (response) {
                if (Array.isArray(response.result)) {
                    result = response.result;
                } else if (Array.isArray(response)) {
                    result = response;
                } else if (response.result && typeof response.result === 'object') {
                    // result might be an object with topics inside
                    result = response.result.list || response.result.data || [];
                }
            }

            console.log(`PPCineClient: getSpecialLists returned ${Array.isArray(result) ? result.length : 0} topics`);
            if (Array.isArray(result)) {
                this.setCache(`special_${typeId}`, result);
            }
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('PPCineClient: getSpecialLists error:', error.message);
            console.error('PPCineClient: Error response:', error.response?.data || 'No response data');
            return [];
        }
    }


    async findTrendingTopic(typeId = 1) {
        try {
            const topics = await this.getSpecialLists(typeId);
            // Ensure topics is an array
            if (!Array.isArray(topics) || topics.length === 0) {
                console.log('PPCineClient: No topics array for trending, topics:', typeof topics);
                return null;
            }
            // Look for trending/hot topics (common names in Chinese/English)
            const trendingKeywords = ['trending', '热门', 'hot', 'hot', '推荐', 'recommend', '最新', 'latest'];
            return topics.find(t => {
                const name = (t.name || t.title || '').toLowerCase();
                return trendingKeywords.some(keyword => name.includes(keyword));
            }) || topics[0]; // Fallback to first topic if no match
        } catch (error) {
            console.error('Error finding trending topic:', error.message);
            return null;
        }
    }

    async findLatestTopic(typeId = 1) {
        try {
            const topics = await this.getSpecialLists(typeId);
            // Ensure topics is an array
            if (!Array.isArray(topics) || topics.length === 0) {
                console.log('PPCineClient: No topics array for latest, topics:', typeof topics);
                return null;
            }
            // Look for latest/new topics
            const latestKeywords = ['latest', '最新', 'new', 'newest', '最近', 'recent'];
            return topics.find(t => {
                const name = (t.name || t.title || '').toLowerCase();
                return latestKeywords.some(keyword => name.includes(keyword));
            }) || (topics.length > 1 ? topics[1] : topics[0]); // Fallback to second topic or first
        } catch (error) {
            console.error('Error finding latest topic:', error.message);
            return null;
        }
    }


    async filterVideos(typeId, options = {}) {
        const { genre, area, year, page = 1 } = options;
        const params = { type_id: typeId, pn: page };
        if (genre) params.class = genre;
        if (area) params.area = area;
        if (year) params.year = year;

        try {
            console.log(`PPCineClient: filterVideos - typeId: ${typeId}, page: ${page}, params:`, params);
            // Try without initialization - some endpoints might work
            const response = await this.request('api/search/screen', params, true);

            // Handle different response formats
            let result = [];
            if (response) {
                if (Array.isArray(response.result)) {
                    result = response.result;
                } else if (Array.isArray(response)) {
                    result = response;
                } else if ((response.code === 10000 || response.code === 1) && response.result) {
                    result = Array.isArray(response.result) ? response.result : [];
                } else if (response.data) {
                    result = Array.isArray(response.data) ? response.data : [];
                }
            }


            console.log(`PPCineClient: filterVideos returned ${result.length} items`);
            return result;
        } catch (error) {
            console.error('PPCineClient: filterVideos error:', error.message);
            if (error.response) {
                console.error('PPCineClient: Error status:', error.response.status);
                console.error('PPCineClient: Error data:', JSON.stringify(error.response.data).substring(0, 300));
            }
            return [];
        }
    }

    async search(keyword, page = 1) {
        const response = await this.request('api/search/result', { wd: keyword, pn: page });
        // Handle different response formats
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response)) return response;
        return [];
    }

    async getVideoDetails(vodId, sourceId = null) {
        const cacheKey = `video_${vodId}_${sourceId || 'default'}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const params = { vod_id: vodId };
        if (sourceId) params.source_id = sourceId;

        // Try info_new endpoint first (has vod_collection with stream URLs)
        let response = await this.request('api/vod/info_new', params);
        let result = response?.result || response?.data ||
            (typeof response === 'object' && !response.code ? response : null);

        // Fallback to info endpoint if info_new doesn't return data
        if (!result || (!result.vod_collection && !result.vod_url)) {
            console.log('PPCineClient: info_new returned no streaming data, trying info endpoint');
            response = await this.request('api/vod/info', params);
            result = response?.result || response?.data ||
                (typeof response === 'object' && !response.code ? response : null);
        }

        if (result) {
            // Log vod_collection status for debugging
            const hasStreams = result.vod_collection &&
                Array.isArray(result.vod_collection) &&
                result.vod_collection.length > 0;
            console.log(`PPCineClient: Video ${vodId} has ${hasStreams ? result.vod_collection.length : 0} streams`);
            this.setCache(cacheKey, result);
        }
        return result;
    }

    async getHotSearchTerms() {
        const cached = this.getCached('hot_search');
        if (cached) return cached;
        const response = await this.request('api/search/hot_search');
        const result = Array.isArray(response?.result) ? response.result : (Array.isArray(response) ? response : []);
        this.setCache('hot_search', result);
        return result;
    }

    async getSearchSuggestions(keyword) {
        const response = await this.request('api/search/suggest', { wd: keyword });
        return Array.isArray(response?.result) ? response.result : (Array.isArray(response) ? response : []);
    }

    transformToMeta(video, type = 'movie') {
        if (!video) return null;
        const id = video.id || video.vod_id;

        // Get rating and ensure it's a string (iOS expects String?)
        let rating = video.vod_douban_score || video.vod_score || null;
        if (rating !== null && rating !== undefined) {
            rating = String(rating);
        }

        // Get year and ensure it's a string (iOS expects String?)
        let year = video.vod_year || null;
        if (year !== null && year !== undefined) {
            year = String(year);
        }

        return {
            id: `ppcine:${id}`,
            type: type,
            name: video.vod_name || video.title || 'Unknown',
            poster: video.vod_pic || null,
            background: video.vod_pic || null,
            description: video.vod_blurb || video.vod_content || '',
            year: year,  // String
            genres: video.vod_tag ? video.vod_tag.split(',').map(g => g.trim()) : [],
            rating: rating,  // String
            cast: video.vod_actor ? video.vod_actor.split(',').map(a => a.trim()) : [],
            director: video.vod_director ? video.vod_director.split(',').map(d => d.trim()) : [],
            country: video.vod_area ? String(video.vod_area) : null,  // String
            runtime: this.calculateRuntime(video),  // Already returns String
            status: video.vod_isend === 1 ? 'Completed' : 'Ongoing',
            totalEpisodes: video.vod_total ? parseInt(video.vod_total) : null,  // Int
            currentEpisode: video.vod_serial ? parseInt(video.vod_serial) : null,  // Int
            remarks: video.remarks || video.vod_remarks || null,
            ppcineId: typeof id === 'number' ? id : parseInt(id) || null,  // Int
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
    // Force HTTPS for baseUrl (Vercel always uses HTTPS)
    const baseUrl = `https://${req.get('host')}`;
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

        // Try to initialize, but don't block if it fails - some endpoints work without init
        if (!ppcine.isInitialized() && !ppcine.initializationAttempted) {
            try {
                console.log('Catalog endpoint: Attempting initialization (non-blocking)...');
                // Don't wait for initialization - make it fire-and-forget
                ppcine.initialize().catch(err => {
                    console.warn('Catalog endpoint: Background initialization failed:', err.message);
                });
                // Give it a moment, but don't block
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (initError) {
                console.warn('Catalog endpoint: Initialization attempt error:', initError.message);
            }
        }

        // Continue with catalog fetch regardless of initialization status
        console.log('Catalog endpoint: Proceeding with catalog fetch (initialized:', ppcine.isInitialized(), ')');

        let metas = [];
        const page = Math.floor(extra.skip / 20) + 1;

        if (id === 'ppcine-trending') {
            const typeId = type === 'movie' ? 1 : 2;
            // Try to use topic-based trending first (more accurate)
            try {
                const trendingTopic = await ppcine.findTrendingTopic(typeId);
                if (trendingTopic && trendingTopic.id) {
                    const topicVideos = await ppcine.getRankingVideos(trendingTopic.id, page);
                    if (topicVideos && topicVideos.length > 0) {
                        metas = topicVideos.map(v => ppcine.transformToMeta(v, type));
                    } else {
                        // Fallback to filter if topic returns empty
                        const videos = await ppcine.filterVideos(typeId, { page });
                        metas = videos.map(v => ppcine.transformToMeta(v, type));
                    }
                } else {
                    // Fallback to filter if no topic found
                    const videos = await ppcine.filterVideos(typeId, { page });
                    metas = videos.map(v => ppcine.transformToMeta(v, type));
                }
            } catch (error) {
                console.error('Trending topic error, using filter fallback:', error.message);
                // Fallback to filter method
                const videos = await ppcine.filterVideos(typeId, { page });
                metas = videos.map(v => ppcine.transformToMeta(v, type));
            }
        } else if (id === 'ppcine-latest') {
            const typeId = type === 'movie' ? 1 : 2;
            // Try to use topic-based latest first (more accurate)
            try {
                const latestTopic = await ppcine.findLatestTopic(typeId);
                if (latestTopic && latestTopic.id) {
                    const topicVideos = await ppcine.getRankingVideos(latestTopic.id, page);
                    if (topicVideos && topicVideos.length > 0) {
                        metas = topicVideos.map(v => ppcine.transformToMeta(v, type));
                    } else {
                        // Fallback to filter if topic returns empty
                        const videos = await ppcine.filterVideos(typeId, { page });
                        metas = videos.map(v => ppcine.transformToMeta(v, type));
                    }
                } else {
                    // Fallback to filter if no topic found
                    const videos = await ppcine.filterVideos(typeId, { page });
                    metas = videos.map(v => ppcine.transformToMeta(v, type));
                }
            } catch (error) {
                console.error('Latest topic error, using filter fallback:', error.message);
                // Fallback to filter method
                const videos = await ppcine.filterVideos(typeId, { page });
                metas = videos.map(v => ppcine.transformToMeta(v, type));
            }
        } else if (id === 'ppcine-series') {
            try {
                const videos = await ppcine.filterVideos(2, { page });
                metas = videos.map(v => ppcine.transformToMeta(v, 'series'));
            } catch (error) {
                console.error('Series catalog error:', error.message);
                metas = [];
            }
        } else if (id === 'ppcine-anime') {
            try {
                const videos = await ppcine.filterVideos(4, { page });
                metas = videos.map(v => ppcine.transformToMeta(v, 'series'));
            } catch (error) {
                console.error('Anime catalog error:', error.message);
                metas = [];
            }
        } else if (id === 'ppcine-search' && extra.search) {
            const videos = await ppcine.search(extra.search);
            metas = videos.map(v => {
                const contentType = (v.type_id === 1 || v.type_pid === 1) ? 'movie' : 'series';
                return ppcine.transformToMeta(v, contentType);
            });
        } else if (id.startsWith('topic-')) {
            // Dynamic topic-based catalog - fetch from specific topic ID
            const topicId = parseInt(id.replace('topic-', ''));
            if (!isNaN(topicId)) {
                try {
                    console.log(`Catalog: Fetching topic ${topicId}, page ${page}`);
                    const topicVideos = await ppcine.getRankingVideos(topicId, page);
                    if (topicVideos && topicVideos.length > 0) {
                        metas = topicVideos.map(v => ppcine.transformToMeta(v, type));
                    }
                    console.log(`Catalog topic-${topicId}: Got ${metas.length} items`);
                } catch (error) {
                    console.error(`Topic ${topicId} catalog error:`, error.message);
                    metas = [];
                }
            }
        }

        // Log result for debugging
        console.log(`Catalog ${id}: Returning ${metas.length} items`);

        res.json({ metas });
    } catch (error) {
        console.error('Catalog error:', error.message);
        console.error('Catalog error stack:', error.stack);
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
app.get('/health', async (req, res) => {
    const isInit = ppcine.isInitialized();
    // Try to initialize if not already done
    if (!isInit && !ppcine.initializationAttempted) {
        try {
            await Promise.race([
                ppcine.initialize(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]);
        } catch (error) {
            console.error('Health check: Init attempt failed:', error.message);
        }
    }
    res.json({
        status: 'ok',
        version: '1.0.0',
        initialized: ppcine.isInitialized(),
        baseURL: ppcine.baseURL,
        deviceId: ppcine.deviceId.substring(0, 20) + '...'
    });
});

// Debug endpoint to see raw API response
app.get('/debug/video/:id', async (req, res) => {
    try {
        const vodId = parseInt(req.params.id);
        if (!ppcine.isInitialized()) await ppcine.initialize();

        // Try info_new first
        const infoNewResponse = await ppcine.request('api/vod/info_new', { vod_id: vodId });
        const infoNewResult = infoNewResponse?.result || infoNewResponse?.data || infoNewResponse;

        // Try info endpoint
        const infoResponse = await ppcine.request('api/vod/info', { vod_id: vodId });
        const infoResult = infoResponse?.result || infoResponse?.data || infoResponse;

        res.json({
            vodId,
            info_new: {
                hasVodCollection: !!(infoNewResult?.vod_collection),
                vodCollectionLength: infoNewResult?.vod_collection?.length || 0,
                vodCollectionSample: infoNewResult?.vod_collection?.[0] || null,
                allKeys: infoNewResult ? Object.keys(infoNewResult) : []
            },
            info: {
                hasVodCollection: !!(infoResult?.vod_collection),
                vodCollectionLength: infoResult?.vod_collection?.length || 0,
                vodCollectionSample: infoResult?.vod_collection?.[0] || null,
                allKeys: infoResult ? Object.keys(infoResult) : []
            }
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// DYNAMIC CATEGORIES ENDPOINT
// ============================================
app.get('/categories', async (req, res) => {
    try {
        if (!ppcine.isInitialized()) {
            try {
                await ppcine.initialize();
            } catch (initError) {
                console.warn('Categories: Initialization failed:', initError.message);
            }
        }

        // Fetch topics for movies (type_id=1) and series (type_id=2)
        const [movieTopics, seriesTopics] = await Promise.all([
            ppcine.getSpecialLists(1),
            ppcine.getSpecialLists(2)
        ]);

        const categories = [];

        // Add movie categories
        if (Array.isArray(movieTopics)) {
            movieTopics.forEach(topic => {
                if (topic.id && topic.topic_name) {
                    categories.push({
                        id: `topic-${topic.id}`,
                        name: topic.topic_name,
                        type: 'movie',
                        topicId: topic.id,
                        extra: [{ name: 'skip', isRequired: false }]
                    });
                }
            });
        }

        // Add series categories
        if (Array.isArray(seriesTopics)) {
            seriesTopics.forEach(topic => {
                if (topic.id && topic.topic_name) {
                    categories.push({
                        id: `topic-${topic.id}`,
                        name: topic.topic_name,
                        type: 'series',
                        topicId: topic.id,
                        extra: [{ name: 'skip', isRequired: false }]
                    });
                }
            });
        }

        // Add search as a special category
        categories.push({
            id: 'ppcine-search',
            name: '🔍 Search',
            type: 'movie',
            extra: [{ name: 'search', isRequired: true }]
        });

        console.log(`Categories: Returning ${categories.length} categories`);
        res.json({ categories });
    } catch (error) {
        console.error('Categories error:', error.message);
        res.json({ categories: [], error: error.message });
    }
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

