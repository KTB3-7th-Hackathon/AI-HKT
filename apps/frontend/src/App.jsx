import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'

const TEXT_LABEL = 'juncci'
const DEFAULT_REPORT = {
  score: 63,
  label: '편향도',
  title: '# Report',
  body:
    '38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold 38kWh solar energy sold',
}

function ThreeLottieViewer() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    const getSize = () => ({
      width: mount.clientWidth || 1,
      height: mount.clientHeight || 1,
    })

    const { width, height } = getSize()
    renderer.setSize(width, height)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10)
    camera.position.z = 2.5

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111)

    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(environment).texture

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = true
    controls.autoRotateSpeed = 5
    controls.enableDamping = true

    let mesh = null
    const createTextTexture = (text) => {
      const size = 512
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.clearRect(0, 0, size, size)

      ctx.font = 'bold 96px "Helvetica Neue", Arial, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, size / 2, size / 2)

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
      texture.minFilter = THREE.LinearFilter
      return texture
    }

    const textTexture = createTextTexture(TEXT_LABEL)
    const geometry = new RoundedBoxGeometry(0.5, 0.5, 0.5, 7, 0.14)
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.05,
      map: textTexture || undefined,
    })
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nextWidth, height: nextHeight } = entry.contentRect
        if (!nextWidth || !nextHeight) continue
        renderer.setSize(nextWidth, nextHeight)
        camera.aspect = nextWidth / nextHeight
        camera.updateProjectionMatrix()
      }
    })
    resizeObserver.observe(mount)

    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()

      if (mesh) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose())
        } else {
          mesh.material.dispose()
        }
      }

      controls.dispose()
      pmremGenerator.dispose()
      renderer.dispose()

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="viewer-shell">
      <div className="scene-root" ref={mountRef} aria-label="3D preview" />
    </div>
  )
}

function GaugeReport({ score = 0, label = '', title = '', body = '' }) {
  const [displayScore, setDisplayScore] = useState(0)
  const clampedScore = Math.max(0, Math.min(100, score))

  useEffect(() => {
    let rafId
    const duration = 1200
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(clampedScore * eased))
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [clampedScore])

  return (
    <div className="gauge-card">
      <div className="gauge-wrapper">
        <svg viewBox="0 0 200 120" className="gauge-svg" role="img" aria-label={`${displayScore}%`}>
          <path
            d="M10 110 A90 90 0 0 1 190 110"
            className="gauge-track"
            pathLength="100"
          />
          <path
            d="M10 110 A90 90 0 0 1 190 110"
            className="gauge-fill"
            pathLength="100"
            strokeDasharray={`${displayScore} 100`}
          />
        </svg>
        <div className="gauge-value">
          <div className="gauge-percent">{displayScore}%</div>
          <div className="gauge-label">{label}</div>
        </div>
      </div>

      <div className="report">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  )
}

function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/service', { replace: true }), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <main className="webview-layout splash-mode" role="main">
      <section className="webview-frame splash">
        <ThreeLottieViewer />
      </section>
    </main>
  )
}

function ServicePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [inputMode, setInputMode] = useState('keyword')
  const navigate = useNavigate()

  const handleModeChange = (mode) => {
    setInputMode(mode)
    setSearchError('')
    setIsSearching(false)
    if (mode === 'url') {
      setResults([])
    }
  }

  const isLikelyUrl = (value) => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed) return false
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true
    return trimmed.startsWith('www.') || trimmed.includes('youtu.be') || trimmed.includes('youtube.com')
  }

  const extractYouTubeId = (value) => {
    let candidate = value.trim()
    if (!candidate) return ''
    if (!/^https?:\/\//i.test(candidate)) {
      if (candidate.startsWith('www.')) {
        candidate = `https://${candidate}`
      } else if (candidate.includes('youtu.be') || candidate.includes('youtube.com')) {
        candidate = `https://${candidate}`
      }
    }

    let url
    try {
      url = new URL(candidate)
    } catch (error) {
      return ''
    }

    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || ''
      return id
    }

    if (host.endsWith('youtube.com')) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v') || ''
      }
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (pathParts[0] === 'shorts' || pathParts[0] === 'embed' || pathParts[0] === 'live') {
        return pathParts[1] || ''
      }
      if (pathParts[0] === 'v') {
        return pathParts[1] || ''
      }
    }

    return ''
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isSearching) return

    setIsSearching(true)
    setSearchError('')

    const shouldHandleUrl = inputMode === 'url' || isLikelyUrl(trimmed)
    if (shouldHandleUrl) {
      const videoId = extractYouTubeId(trimmed)
      if (!videoId) {
        setSearchError('유효한 유튜브 URL을 입력해주세요.')
        setIsSearching(false)
        return
      }

      setResults([])
      setIsSearching(false)
      navigate(`/video/${videoId}`)
      return
    }

    try {
      const res = await fetch(`/api/youtube/search?query=${encodeURIComponent(trimmed)}`)
      if (!res.ok) throw new Error('search failed')
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setSearchError('검색 결과를 가져오지 못했습니다.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className="webview-layout" role="main">
      <section className="webview-frame">
        <div className="main-content">
          <header className="main-header">
            <h2 className="brand">service</h2>
            <div className="divider" />
          </header>

          <div className="hero-text">
            <p className="label">{inputMode === 'url' ? 'URL 입력' : '키워드 문장'}</p>
            <h1 className="headline">service</h1>
          </div>

          <div className="mode-toggle" role="tablist" aria-label="입력 모드">
            <button
              type="button"
              className={inputMode === 'keyword' ? 'active' : ''}
              onClick={() => handleModeChange('keyword')}
              aria-pressed={inputMode === 'keyword'}
            >
              검색어
            </button>
            <button
              type="button"
              className={inputMode === 'url' ? 'active' : ''}
              onClick={() => handleModeChange('url')}
              aria-pressed={inputMode === 'url'}
            >
              URL
            </button>
          </div>

          <form
            className="input-form"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={inputMode === 'url' ? '유튜브 URL을 입력하세요' : '검색어를 입력하세요'}
              aria-label={inputMode === 'url' ? '유튜브 URL' : '검색어'}
            />
          </form>
          <div className="search-results">
            {isSearching ? <p className="search-status">검색 중...</p> : null}
            {searchError ? <p className="search-status error">{searchError}</p> : null}
            {inputMode === 'keyword' &&
            !isSearching &&
            !searchError &&
            results.length === 0 &&
            query.trim().length > 0 ? (
              <p className="search-status">검색 결과가 없습니다.</p>
            ) : null}
            {inputMode === 'keyword'
              ? results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="search-item"
                    onClick={() => navigate(`/video/${item.id}`)}
                  >
                    <div className="search-thumb">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                      ) : (
                        <div className="thumb-placeholder" />
                      )}
                    </div>
                    <div className="search-meta">
                      <h4>{item.title}</h4>
                      <p>{item.channelTitle}</p>
                    </div>
                  </button>
                ))
              : null}
          </div>
        </div>
      </section>
    </main>
  )
}

function VideoPage() {
  const { id } = useParams()
  const videoId = id || ''
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  ])
  const [isSending, setIsSending] = useState(false)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const [selectionPrompt, setSelectionPrompt] = useState({
    text: '',
    x: 0,
    y: 0,
    visible: false,
  })
  const reportRef = useRef(null)
  const chatMessagesRef = useRef(null)

  useEffect(() => {
    if (!videoId) navigate('/service', { replace: true })
  }, [videoId, navigate])

  useEffect(() => {
    const container = chatMessagesRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [chatMessages])

  if (!videoId) return null

  const handleSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectionPrompt((prev) => ({ ...prev, visible: false }))
      return
    }
    const text = selection.toString().trim()
    if (!text) {
      setSelectionPrompt((prev) => ({ ...prev, visible: false }))
      return
    }
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const container = reportRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const x = rect.left - containerRect.left + rect.width / 2
    const y = rect.top - containerRect.top - 8
    setSelectionPrompt({ text, x, y, visible: true })
  }

  const openChatWithText = (text) => {
    setChatInput(text)
    setIsModalOpen(true)
    setSelectionPrompt((prev) => ({ ...prev, visible: false }))
  }

  const appendMessage = (text, role) => {
    setChatMessages((prev) => [...prev, { role, text }])
  }

  const sendMessage = async (rawText) => {
    const text = rawText.trim()
    if (!text || isSending) return

    appendMessage(text, 'user')
    setChatInput('')
    setIsSending(true)

    try {
      const res = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
        }),
      })
      if (!res.ok) throw new Error('chat api failed')
      const data = await res.json()
      appendMessage(data?.answer || '응답을 가져오지 못했습니다.', 'bot')
    } catch (e) {
      appendMessage('오류가 발생했습니다.', 'bot')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="webview-layout" role="main">
      <section className="webview-frame">
        <div className="main-content">
          <header className="main-header">
            <h2 className="brand">service</h2>
            <div className="divider" />
          </header>

          <div className="video-wrapper">
            <iframe
              title="YouTube player"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <GaugeReport
            score={DEFAULT_REPORT.score}
            label={DEFAULT_REPORT.label}
            title={DEFAULT_REPORT.title}
            body={DEFAULT_REPORT.body}
          />
          <div
            className="report"
            ref={reportRef}
            onMouseUp={handleSelection}
            onTouchEnd={handleSelection}
          >
            <h3>{DEFAULT_REPORT.title}</h3>
            <p>{DEFAULT_REPORT.body}</p>
            {selectionPrompt.visible ? (
              <div
                className="selection-prompt"
                style={{ left: selectionPrompt.x, top: selectionPrompt.y }}
              >
                <button type="button" onClick={() => openChatWithText(selectionPrompt.text)}>
                  챗봇에 검색하시겠습니까?
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <button
          className="floating-page-btn"
          type="button"
          aria-label="액션 버튼"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>

        {isModalOpen ? (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h4>챗봇</h4>
                <button
                  type="button"
                  className="modal-close"
                  aria-label="닫기"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}
                    >
                      <span className="chat-text">{msg.text}</span>
                    </div>
                  ))}
                </div>
                <form
                  className="chat-input"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(chatInput)
                  }}
                >
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    aria-label="챗봇 입력"
                    disabled={isSending}
                  />
                  <button type="submit" disabled={isSending}>
                    전송
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/service" element={<ServicePage />} />
      <Route path="/video/:id" element={<VideoPage />} />
      <Route path="*" element={<Navigate to="/service" replace />} />
    </Routes>
  )
}

export default App
