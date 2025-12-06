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
  <img src="https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-platform-support">Platforms</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 🎬 Overview

**PPCine Plugin** is a powerful, universal streaming API that provides seamless access to movies, TV series, and anime content. Built with simplicity in mind, it can be deployed in minutes and works with any platform or media player.

```
One API → All Platforms → Unlimited Streaming
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
| 🆓 **Free Hosting** | Deploy to Vercel at no cost |

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

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ppcine-plugin)

### Manual Deployment

1. **Clone or download** the `server/` folder
2. **Push to GitHub** (see [Beginner Guide](./BEGINNER_GUIDE.md))
3. **Import to Vercel** → Click Deploy
4. **Get your URL**: `https://your-app.vercel.app`

> 📘 **New to deployment?** Follow our step-by-step [Beginner Guide](./BEGINNER_GUIDE.md)

## 📁 Project Structure

```
PPCinePlugin/
├── 📄 README.md              # This file
├── 📘 BEGINNER_GUIDE.md      # Step-by-step deployment guide
├── 📚 API_REFERENCE.md       # Complete API documentation
└── 📂 server/
    ├── 📂 api/
    │   └── index.js          # Main server (all-in-one)
    ├── package.json          # Dependencies
    └── vercel.json           # Vercel configuration
```

## 📡 API Reference

### Base URL
```
https://your-deployed-url.vercel.app
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
curl https://your-url.vercel.app/catalog/movie/ppcine-trending
```

**Search Content**
```bash
curl https://your-url.vercel.app/search?q=batman
```

**Get Streaming URL**
```bash
curl https://your-url.vercel.app/stream/movie/ppcine:12345
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
let url = URL(string: "https://your-url.vercel.app/stream/movie/ppcine:12345")!
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
const response = await fetch('https://your-url.vercel.app/stream/movie/ppcine:12345');
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
val response = client.get("https://your-url.vercel.app/stream/movie/ppcine:12345")
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
| [BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md) | Complete step-by-step deployment guide |
| [API_REFERENCE.md](./API_REFERENCE.md) | Full API documentation with examples |

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Page not found** | Ensure all files are uploaded correctly |
| **500 error** | Wait 30s for cold start, check Vercel logs |
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
