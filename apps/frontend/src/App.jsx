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

const extractYouTubeId = (url) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1)
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v')
    if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2]
  } catch (e) {
    return ''
  }
  return ''
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
  const [inputUrl, setInputUrl] = useState('')
  const navigate = useNavigate()

  return (
    <main className="webview-layout" role="main">
      <section className="webview-frame">
        <div className="main-content">
          <header className="main-header">
            <h2 className="brand">service</h2>
            <div className="divider" />
          </header>

          <div className="hero-text">
            <p className="label">키워드 문장</p>
            <h1 className="headline">service</h1>
          </div>

          <form
            className="input-form"
            onSubmit={(e) => {
              e.preventDefault()
              const id = extractYouTubeId(inputUrl.trim())
              if (id) {
                navigate(`/video/${id}`)
              }
            }}
          >
            <input
              type="text"
              name="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="url"
              aria-label="url"
            />
          </form>
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

  useEffect(() => {
    if (!videoId) navigate('/service', { replace: true })
  }, [videoId, navigate])

  if (!videoId) return null

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
                <h4>Modal Title</h4>
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
                <p>이곳에 필요한 내용을 넣어주세요. API 연동 시 데이터를 표시할 수 있습니다.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-action" onClick={() => setIsModalOpen(false)}>
                  닫기
                </button>
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
