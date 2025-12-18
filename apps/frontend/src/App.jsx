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
  title: '분석 리포트',
  reportText:
    '내란특검은 김건희 씨의 비상계엄 선포 관여 의혹이 사실이 아니라고 결론 내렸으며, 박지영 특검보는 관련 증거가 없다고 밝혔습니다.\n김씨가 명태균 사건 등에 개입한 사실은 있으나, 비상 선포에 관여하거나 주요 원인은 아니었다고 설명했습니다.\n오히려 특검은 김씨가 계엄 선포 이후 윤 전 대통령과 "너 때문에 망했다"고 말하며 격렬히 다퉜다는 진술을 확보했습니다.',
  words: [
    '특검은 이와 함께 계엄 선포 이후 김씨가 윤 전 대통령과 심하게 싸웠다는 진술도 확보했다고 밝혔습니다.',
    '그러면서 김씨의 계엄 당시 행적뿐만 아니라 주변인 진술 등을 봐도 계엄에 관여했다는 증거가 발견되지 않았다고 설명했습니다.',
  ],
}

const LOADING_QUIZZES = [
  {
    question: '자신의 생각과 같은 정보만 믿는 경향은 확증 편향이다.',
    answer: 'O',
    explanation: '내 생각을 확인해주는 정보만 찾는 경향을 말해요.',
  },
  {
    question: '반대 의견을 먼저 찾아보는 것은 확증 편향을 줄이는 데 도움이 된다.',
    answer: 'O',
    explanation: '다른 관점을 보는 것이 편향을 줄여요.',
  },
  {
    question: '사실 확인보다 감정에 맞는 정보가 더 설득력 있게 느껴질 수 있다.',
    answer: 'O',
    explanation: '감정은 판단을 쉽게 흔들 수 있어요.',
  },
  {
    question: '필터 버블은 내가 본 적 없는 다양한 정보가 더 많이 보이게 한다.',
    answer: 'X',
    explanation: '비슷한 정보만 더 많이 보이게 만들어요.',
  },
  {
    question: '추천 알고리즘은 사용자의 관심을 더 강화할 수 있다.',
    answer: 'O',
    explanation: '비슷한 콘텐츠가 반복 추천될 수 있어요.',
  },
  {
    question: '모든 뉴스는 완전히 중립적이다.',
    answer: 'X',
    explanation: '관점이 섞일 수 있어요.',
  },
  {
    question: '같은 사건도 매체마다 표현이 다를 수 있다.',
    answer: 'O',
    explanation: '관점과 표현 방식이 달라요.',
  },
  {
    question: '제목만 보고 판단하면 오해가 생길 수 있다.',
    answer: 'O',
    explanation: '본문 맥락이 중요해요.',
  },
  {
    question: '내가 보고 싶은 정보만 보면 관점이 좁아질 수 있다.',
    answer: 'O',
    explanation: '다양한 정보가 필요해요.',
  },
  {
    question: '사실과 의견은 항상 구분해서 볼 필요가 없다.',
    answer: 'X',
    explanation: '사실과 의견은 구분이 중요해요.',
  },
  {
    question: '댓글 반응만으로 뉴스의 사실 여부를 판단할 수 있다.',
    answer: 'X',
    explanation: '댓글은 감정적일 수 있어요.',
  },
  {
    question: '같은 숫자라도 문맥에 따라 의미가 달라질 수 있다.',
    answer: 'O',
    explanation: '맥락이 해석을 바꿔요.',
  },
  {
    question: '출처가 불분명한 정보는 조심해서 봐야 한다.',
    answer: 'O',
    explanation: '출처 확인이 기본이에요.',
  },
  {
    question: '정보를 공유하기 전에 사실 확인을 하는 것이 좋다.',
    answer: 'O',
    explanation: '잘못된 정보 확산을 막아요.',
  },
  {
    question: '내 생각과 다른 정보도 한 번은 살펴볼 가치가 있다.',
    answer: 'O',
    explanation: '시야를 넓히는 데 도움이 돼요.',
  },
  {
    question: '한두 개의 사례로 전체를 판단하는 것은 위험하다.',
    answer: 'O',
    explanation: '전체 맥락을 봐야 해요.',
  },
  {
    question: '숫자와 통계는 언제나 완전히 객관적이다.',
    answer: 'X',
    explanation: '해석 방식에 따라 달라질 수 있어요.',
  },
  {
    question: '감정이 강한 표현은 판단을 흐릴 수 있다.',
    answer: 'O',
    explanation: '감정적 언어는 주의를 필요로 해요.',
  },
  {
    question: '사실을 확인하려면 여러 출처를 비교하는 것이 좋다.',
    answer: 'O',
    explanation: '교차 확인이 도움이 돼요.',
  },
  {
    question: '내가 자주 보는 콘텐츠만이 전체 현실을 대표한다.',
    answer: 'X',
    explanation: '부분만 보고 있을 수 있어요.',
  },
]

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
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
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

      {body ? (
        <div className="report">
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
      ) : null}
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
        <div className="splash-screen">
          <img src="/splash.png" alt="splash" className="splash-image" />
        </div>
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
  const [selectedTopic, setSelectedTopic] = useState('')
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
      navigate(`/loading/${videoId}`)
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
      <section className="webview-frame" data-theme={inputMode}>
        <div className="main-content">
          <header className="main-header">
            <img className="logo-image logo-image--header" src="/logo.png" alt="service" />
            <div className="divider" />
          </header>

          <div className="hero-text">
            <div className="hero-motion" aria-hidden="true">
              <img className="hero-swap hero-swap--first" src="/BG2.png" alt="" />
              <img className="hero-swap hero-swap--second" src="/BG3.png" alt="" />
              <img className="hero-swap hero-swap--third" src="/BG4.png" alt="" />
            </div>
          </div>

          <div
            className="mode-toggle"
            role="tablist"
            aria-label="입력 모드"
            style={{ '--toggle-offset': inputMode === 'url' ? '100%' : '0%' }}
          >
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
            <button className="search-button" type="submit" aria-label="검색">
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </form>
          <div className="filter-buttons" role="group" aria-label="주제 선택">
            {['정치', '젠더', '세대', '지역'].map((topic) => (
              <button
                key={topic}
                type="button"
                className={`filter-button${selectedTopic === topic ? ' active' : ''}`}
                aria-pressed={selectedTopic === topic}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
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
                    onClick={() => navigate(`/loading/${item.id}`)}
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
            <img className="logo-image logo-image--header" src="/logo.png" alt="service" />
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
            body=""
          />
          <details
            className="report-card"
            ref={reportRef}
            onMouseUp={handleSelection}
            onTouchEnd={handleSelection}
          >
            <summary className="report-title">
              <img className="report-icon" src="/component.png" alt="" />
              {DEFAULT_REPORT.title}
            </summary>
            <div className="report-body">
              {DEFAULT_REPORT.reportText.split('\n').map((line, index) => (
                <p key={`${index}-${line.slice(0, 8)}`}>{line}</p>
              ))}
            </div>
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
          </details>
          <details className="report-card report-card--words" aria-label="편향 문장">
            <summary className="report-title">
              <img className="report-icon" src="/component.png" alt="" />
              편향 문장
            </summary>
            <ul className="report-list">
              {DEFAULT_REPORT.words.map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
          </details>
        </div>

        <button
          className="floating-page-btn"
          type="button"
          aria-label="챗봇 열기"
          onClick={() => setIsModalOpen(true)}
        >
          <img src="/component2.png" alt="" />
        </button>

        {isModalOpen ? (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h4>RE:spect</h4>
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

function LoadingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selection, setSelection] = useState('')
  const [quizIndex, setQuizIndex] = useState(0)
  const [isCorrect, setIsCorrect] = useState(null)
  const nextQuizTimeoutRef = useRef(null)

  useEffect(() => {
    setQuizIndex(Math.floor(Math.random() * LOADING_QUIZZES.length))
    const timer = setTimeout(() => {
      if (id) navigate(`/video/${id}`)
    }, 10000)
    return () => clearTimeout(timer)
  }, [id, navigate])

  useEffect(() => {
    setSelection('')
    setIsCorrect(null)
  }, [quizIndex])

  useEffect(() => {
    return () => {
      if (nextQuizTimeoutRef.current) clearTimeout(nextQuizTimeoutRef.current)
    }
  }, [])

  const quiz = LOADING_QUIZZES[quizIndex]
  const hasAnswered = selection !== ''

  const pickNextQuiz = () => {
    if (LOADING_QUIZZES.length <= 1) return quizIndex
    let nextIndex = quizIndex
    while (nextIndex === quizIndex) {
      nextIndex = Math.floor(Math.random() * LOADING_QUIZZES.length)
    }
    return nextIndex
  }

  const handleAnswer = (option) => {
    if (hasAnswered) return
    setSelection(option)
    setIsCorrect(option === quiz.answer)
    if (nextQuizTimeoutRef.current) clearTimeout(nextQuizTimeoutRef.current)
    nextQuizTimeoutRef.current = setTimeout(() => {
      setQuizIndex(pickNextQuiz())
    }, 1200)
  }

  return (
    <main className="webview-layout loading-mode" role="main">
      <section className="webview-frame loading">
        <div className="loading-card">
          <div className="loading-title">로딩 중...</div>
          <p className="loading-subtitle">확증 편향에 대해 알고 있나요?</p>
          <div className="quiz-card">
            <p className="quiz-question">{quiz.question}</p>
            <div className="quiz-actions" role="group" aria-label="퀴즈 선택">
              {['O', 'X'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`quiz-button${selection === option ? ' active' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            {isCorrect !== null ? (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect ? '정답입니다.' : '오답입니다.'} {quiz.explanation}
              </div>
            ) : null}
          </div>
          <div className="loading-note">10초 후 자동으로 영상으로 이동합니다.</div>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/service" element={<ServicePage />} />
      <Route path="/loading/:id" element={<LoadingPage />} />
      <Route path="/video/:id" element={<VideoPage />} />
      <Route path="*" element={<Navigate to="/service" replace />} />
    </Routes>
  )
}

export default App
