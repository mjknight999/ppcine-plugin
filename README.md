<p align="center">
  <img src="https://img.shields.io/badge/PPCine-Plugin-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMjIgOC0xLjg5IDkuNDRhMiAyIDAgMCAxLTEuOTYgMS41Nkg1Ljg1YTIgMiAwIDAgMS0xLjk2LTEuNTZMMS4xMSA4SDIyWiI+PC9wYXRoPjxwYXRoIGQ9Im02IDE3LTQuMy05Ljk2YTEgMSAwIDAgMSAuOTgtMS4yOGgxOC42NGExIDEgMCAwIDEgLjk4IDEuMjhMNTggMTciPjwvcGF0aD48cGF0aCBkPSJNMTIgMTdWOCI+PC9wYXRoPjwvc3ZnPg==" alt="PPCine Plugin">
  <br><br>
  <b>Universal Streaming Plugin</b>
  <br>
  <sub>Stream movies, TV series, and anime across all platforms</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/deploy-Railway-purple?style=flat-square&logo=railway" alt="Railway">
  <img src="https://img.shields.io/badge/deploy-Render-green?style=flat-square&logo=render" alt="Render">
  <img src="https://img.shields.io/badge/deploy-Fly.io-purple?style=flat-square&logo=fly.io" alt="Fly.io">
  <img src="https://img.shields.io/badge/deploy-Netlify-teal?style=flat-square&logo=netlify" alt="Netlify">
  <img src="https://img.shields.io/badge/deploy-Docker-blue?style=flat-square&logo=docker" alt="Docker">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deploy-anywhere">Deploy Anywhere</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 🎬 Overview

**PPCine Plugin** is a powerful, universal streaming API that provides seamless access to movies, TV series, and anime content. Built with simplicity in mind, it can be deployed in minutes to **ANY platform** and works with any media player.

```
One Codebase → Deploy Anywhere → Stream Everywhere
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Rich Metadata** | Title, poster, description, cast, director, rating, genres |
| 📺 **Multi-Content** | Movies, TV Series, and Anime catalogs |
| 🔍 **Smart Search** | Full-text search with suggestions and trending |
| 🔗 **Stream URLs** | Direct HLS/MP4 streaming links |
| 📱 **Universal** | Works on iOS, tvOS, Android, Web, and more |
| ⚡ **Fast** | Built-in caching for optimal performance |
| 🌐 **Multi-Platform** | Deploy to 6+ hosting platforms |

## 📦 What You Get

```
✅ Movie/Show Title          ✅ Poster Image URL
✅ Description               ✅ Cast (Actors)
✅ Director                  ✅ Year
✅ Genres                    ✅ Rating
✅ Streaming URLs            ✅ Episode List
✅ Search                    ✅ Trending Content
```

## 🚀 Quick Start

### Choose Your Platform

| Platform | Free Tier | Always On | Deploy |
|----------|-----------|-----------|--------|
| **Vercel** | ✅ Unlimited | ❌ | [![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ppcine-plugin) |
| **Railway** | ✅ $5/month | ✅ | [Deploy →](https://railway.app) |
| **Render** | ✅ 750 hrs | ⚠️ | [Deploy →](https://render.com) |
| **Fly.io** | ✅ 3 VMs | ✅ | [Deploy →](https://fly.io) |
| **Netlify** | ✅ 125k req | ❌ | [Deploy →](https://netlify.com) |
| **Koyeb** | ✅ 2 services | ✅ | [Deploy →](https://koyeb.com) |

> 📘 **New to deployment?** Follow our [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 📁 Project Structure

```
PPCinePlugin/
├── 📄 README.md              # This file
├── 📘 DEPLOYMENT_GUIDE.md    # Multi-platform deployment guide
├── 📘 BEGINNER_GUIDE.md      # Vercel-only beginner guide
├── 📚 API_REFERENCE.md       # Complete API documentation
└── 📂 server/
    ├── 📂 api/
    │   └── index.js          # Main server (all-in-one)
    ├── 📂 netlify/
    │   └── 📂 functions/
    │       └── server.js     # Netlify wrapper
    ├── package.json          # Dependencies
    ├── vercel.json           # Vercel config
    ├── railway.json          # Railway config
    ├── render.yaml           # Render config
    ├── fly.toml              # Fly.io config
    ├── netlify.toml          # Netlify config
    ├── Dockerfile            # Docker (universal)
    └── Procfile              # Heroku-compatible
```

## 🌐 Deploy Anywhere

### Platform Comparison

| Feature | Vercel | Railway | Render | Fly.io |
|---------|--------|---------|--------|--------|
| **Free Tier** | ✅ Great | ✅ $5/mo | ✅ 750hrs | ✅ 3 VMs |
| **Cold Starts** | Yes | No | No | No |
| **Always Running** | No | Yes | Sleeps | Yes |
| **Global Edge** | Yes | No | No | Yes |
| **Docker Support** | No | Yes | Yes | Yes |
| **Difficulty** | Easy | Easy | Easy | Medium |

### Recommendation

- **Beginners:** Start with **Vercel** (easiest)
- **Best Overall:** Use **Railway** (always running + free)
- **Global Speed:** Use **Fly.io** (multiple regions)
- **Redundancy:** Deploy to 2-3 platforms!

## 📡 API Reference

### Base URL
```
https://your-deployed-url.com
```

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/manifest.json` | GET | Plugin manifest & info |
| `/catalog/:type/:id` | GET | Browse content catalogs |
| `/meta/:type/:id` | GET | Get detailed metadata |
| `/stream/:type/:id` | GET | Get streaming URLs |
| `/search?q=query` | GET | Search content |
| `/health` | GET | Health check |

### Catalog IDs

| ID | Type | Description |
|----|------|-------------|
| `ppcine-trending` | movie | 🔥 Trending Movies |
| `ppcine-latest` | movie | 🆕 Latest Movies |
| `ppcine-series` | series | 📺 TV Series |
| `ppcine-anime` | series | 🎌 Anime |
| `ppcine-search` | movie/series | 🔍 Search Results |

### Quick Examples

**Get Trending Movies**
```bash
curl https://your-url/catalog/movie/ppcine-trending
```

**Search Content**
```bash
curl https://your-url/search?q=batman
```

**Get Streaming URL**
```bash
curl https://your-url/stream/movie/ppcine:12345
```

> 📚 **Full API documentation**: [API_REFERENCE.md](./API_REFERENCE.md)

## 📱 Platform Support

<table>
<tr>
<td align="center"><img src="https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS"><br><b>iOS</b></td>
<td align="center"><img src="https://img.shields.io/badge/tvOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="tvOS"><br><b>tvOS</b></td>
<td align="center"><img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android"><br><b>Android</b></td>
<td align="center"><img src="https://img.shields.io/badge/Android_TV-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android TV"><br><b>Android TV</b></td>
<td align="center"><img src="https://img.shields.io/badge/Web-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Web"><br><b>Web</b></td>
</tr>
</table>

### Compatible Players

| Player | Platform | Status |
|--------|----------|--------|
| **VLCKit** | iOS/macOS | ✅ Full Support |
| **AVPlayer** | iOS/tvOS | ✅ Full Support |
| **ExoPlayer** | Android | ✅ Full Support |
| **HLS.js** | Web | ✅ Full Support |
| **Video.js** | Web | ✅ Full Support |

## 💻 Usage Examples

### Swift (iOS/tvOS)

```swift
// Fetch streaming URL
let url = URL(string: "https://your-url/stream/movie/ppcine:12345")!
let (data, _) = try await URLSession.shared.data(from: url)
let response = try JSONDecoder().decode(StreamResponse.self, from: data)

// Play with VLCKit
if let streamUrl = response.streams.first?.url {
    let media = VLCMedia(url: URL(string: streamUrl)!)
    mediaPlayer.media = media
    mediaPlayer.play()
}
```

### JavaScript/TypeScript

```javascript
// Get movie streams
const response = await fetch('https://your-url/stream/movie/ppcine:12345');
const { streams } = await response.json();

// Play with HLS.js
if (Hls.isSupported() && streams.length > 0) {
    const hls = new Hls();
    hls.loadSource(streams[0].url);
    hls.attachMedia(videoElement);
}
```

### Kotlin (Android)

```kotlin
// Get streaming URL
val response = client.get("https://your-url/stream/movie/ppcine:12345")
val streams = response.body<StreamResponse>().streams

// Play with ExoPlayer
streams.firstOrNull()?.url?.let { url ->
    val mediaItem = MediaItem.fromUri(url)
    exoPlayer.setMediaItem(mediaItem)
    exoPlayer.prepare()
    exoPlayer.play()
}
```

## 🔧 Response Formats

### Catalog Response
```json
{
  "metas": [
    {
      "id": "ppcine:12345",
      "type": "movie",
      "name": "Movie Title",
      "poster": "https://...",
      "year": "2024",
      "rating": "8.5",
      "genres": ["Action", "Thriller"]
    }
  ]
}
```

### Stream Response
```json
{
  "streams": [
    {
      "name": "PPCine",
      "title": "1080p HD",
      "url": "https://...m3u8",
      "quality": "1080p"
    }
  ]
}
```

## 🛠 Local Development

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm start

# Server runs at http://localhost:3000
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | **NEW!** Multi-platform deployment guide |
| [BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md) | Vercel-only step-by-step guide |
| [API_REFERENCE.md](./API_REFERENCE.md) | Full API documentation with examples |

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Page not found** | Ensure all files are uploaded correctly |
| **500 error** | Wait 30s for cold start, check logs |
| **No streams** | Content may not have available sources |
| **CORS errors** | Plugin already has CORS enabled |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with ❤️ for the streaming community</b>
  <br><br>
  <a href="#-overview">Back to top</a>
</p>
