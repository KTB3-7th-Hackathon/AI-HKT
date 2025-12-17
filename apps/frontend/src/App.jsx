import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'

const TEXT_LABEL = 'juncci'

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

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [inputUrl, setInputUrl] = useState('')
  const [videoId, setVideoId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className={`webview-layout ${showSplash ? 'splash-mode' : ''}`} role="main">
      <section className={`webview-frame ${showSplash ? 'splash' : ''}`}>
        {showSplash ? (
          <ThreeLottieViewer />
        ) : (
          <div className="main-content">
            <header className="main-header">
              <h2 className="brand">service</h2>
              <div className="divider" />
            </header>

            {videoId ? (
              <div className="video-wrapper">
                <iframe
                  title="YouTube player"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="hero-text">
              <p className="label">키워드 문장</p>
              <h1 className="headline">service</h1>
            </div>

            <form
              className="input-form"
              onSubmit={(e) => {
                e.preventDefault()
                const id = extractYouTubeId(inputUrl.trim())
                setVideoId(id || '')
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
        )}
      </section>
    </main>
  )
}

export default App
