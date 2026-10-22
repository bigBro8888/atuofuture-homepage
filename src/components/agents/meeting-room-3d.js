import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const ROOM = { w: 8.6, d: 11.2, h: 3.35 }
const PIN_WORLD = {
  0: new THREE.Vector3(-3.2, 1.35, 2.4),
  1: new THREE.Vector3(-1.6, 2.55, -0.4),
  3: new THREE.Vector3(2.4, 2.4, -1.2),
  '3b': new THREE.Vector3(3.1, 1.55, 0.2),
  '3c': new THREE.Vector3(0.2, 0.95, -0.6),
  4: new THREE.Vector3(-2.6, 0.55, 3.2),
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    ...opts,
  })
}

function addShadow(mesh, cast = true, receive = true) {
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  return mesh
}

function makeChair(seatColor) {
  const g = new THREE.Group()
  const seat = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.52), mat(seatColor, { roughness: 0.85 })))
  seat.position.y = 0.46
  g.add(seat)
  const back = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.48, 0.07), mat(seatColor, { roughness: 0.85 })))
  back.position.set(0, 0.72, -0.22)
  g.add(back)
  const base = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 12), mat(0x1a1a1a, { metalness: 0.55, roughness: 0.35 })), true, false)
  base.position.y = 0.22
  g.add(base)
  for (let i = 0; i < 4; i += 1) {
    const leg = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.34), mat(0x151515, { metalness: 0.6, roughness: 0.3 })), true, false)
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    leg.position.set(Math.cos(a) * 0.18, 0.04, Math.sin(a) * 0.18)
    leg.rotation.y = -a
    g.add(leg)
  }
  return g
}

function makePerson() {
  const root = new THREE.Group()
  root.visible = false

  const skin = mat(0xf0d5c0, { roughness: 0.7 })
  const coat = mat(0x1d4f9c, { roughness: 0.55 })
  const pants = mat(0x243044, { roughness: 0.7 })
  const hair = mat(0x2c3344, { roughness: 0.8 })
  const shoe = mat(0x1a2030, { roughness: 0.55, metalness: 0.1 })

  const torso = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 12), coat))
  torso.position.y = 1.18
  root.add(torso)

  const head = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), skin), true, false)
  head.position.y = 1.62
  root.add(head)
  const hairMesh = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hair), true, false)
  hairMesh.position.set(0, 1.66, -0.01)
  root.add(hairMesh)

  const hip = new THREE.Group()
  hip.position.y = 0.92
  root.add(hip)

  const makeLimb = (geo, material, y) => {
    const pivot = new THREE.Group()
    const mesh = addShadow(new THREE.Mesh(geo, material), true, false)
    mesh.position.y = y
    pivot.add(mesh)
    return { pivot, mesh }
  }

  const armL = makeLimb(new THREE.CapsuleGeometry(0.055, 0.34, 4, 8), coat, -0.2)
  armL.pivot.position.set(-0.28, 1.38, 0)
  root.add(armL.pivot)
  const armR = makeLimb(new THREE.CapsuleGeometry(0.055, 0.34, 4, 8), coat, -0.2)
  armR.pivot.position.set(0.28, 1.38, 0)
  root.add(armR.pivot)

  const legL = makeLimb(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), pants, -0.28)
  legL.pivot.position.set(-0.11, 0.92, 0)
  root.add(legL.pivot)
  const legR = makeLimb(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), pants, -0.28)
  legR.pivot.position.set(0.11, 0.92, 0)
  root.add(legR.pivot)

  const shoeL = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.28), shoe), true, false)
  shoeL.position.set(-0.11, 0.05, 0.04)
  root.add(shoeL)
  const shoeR = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.28), shoe), true, false)
  shoeR.position.set(0.11, 0.05, 0.04)
  root.add(shoeR)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  root.add(shadow)

  root.userData.parts = { armL, armR, legL, legR, head, shoeL, shoeR }
  return root
}

function buildRoom(scene) {
  const floor = addShadow(
    new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.w, ROOM.d),
      mat(0xc8ced6, { roughness: 0.22, metalness: 0.15 })
    ),
    false,
    true
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  const ceiling = addShadow(
    new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mat(0xb7bdc6, { roughness: 0.92 })),
    false,
    true
  )
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = ROOM.h
  scene.add(ceiling)

  const back = addShadow(
    new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.h), mat(0xf2f4f7, { roughness: 0.9 })),
    false,
    true
  )
  back.position.set(0, ROOM.h / 2, -ROOM.d / 2)
  scene.add(back)

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdce9f7,
    transmission: 0.86,
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    metalness: 0,
    thickness: 0.2,
    ior: 1.45,
    side: THREE.DoubleSide,
  })
  const frameMat = mat(0x141414, { metalness: 0.7, roughness: 0.35 })

  const makeGlassWall = (xSign) => {
    const wall = new THREE.Group()
    wall.position.x = xSign * (ROOM.w / 2)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d * 0.96, ROOM.h * 0.92), glassMat)
    glass.rotation.y = xSign > 0 ? -Math.PI / 2 : Math.PI / 2
    glass.position.y = ROOM.h / 2
    wall.add(glass)
    for (let i = -2; i <= 2; i += 1) {
      const post = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.08, ROOM.h, 0.08), frameMat), true, false)
      post.position.set(0, ROOM.h / 2, i * 2.1)
      wall.add(post)
      if (i < 2) {
        const cross = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.9), frameMat), true, false)
        cross.position.set(0, ROOM.h * 0.55, i * 2.1 + 1.05)
        cross.rotation.z = xSign * 0.55
        wall.add(cross)
        const cross2 = cross.clone()
        cross2.rotation.z = -xSign * 0.55
        wall.add(cross2)
      }
    }
    const sill = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, ROOM.d), frameMat), true, false)
    sill.position.set(0, 0.04, 0)
    wall.add(sill)
    scene.add(wall)
  }
  makeGlassWall(-1)
  makeGlassWall(1)

  // exterior hint
  const skyL = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.d, ROOM.h),
    new THREE.MeshBasicMaterial({ color: 0x9ec9ef })
  )
  skyL.position.set(-ROOM.w / 2 - 0.4, ROOM.h / 2, 0)
  skyL.rotation.y = Math.PI / 2
  scene.add(skyL)
  const trees = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.d * 0.9, 1.8),
    new THREE.MeshBasicMaterial({ color: 0x4f8a4a })
  )
  trees.position.set(-ROOM.w / 2 - 0.35, 1.1, 0)
  trees.rotation.y = Math.PI / 2
  scene.add(trees)

  const duct = addShadow(
    new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, ROOM.d * 0.78), mat(0x9aa3ad, { metalness: 0.55, roughness: 0.4 })),
    true,
    false
  )
  duct.position.set(0.15, ROOM.h - 0.35, -0.4)
  scene.add(duct)
  for (let i = -3; i <= 3; i += 1) {
    const pipe = addShadow(
      new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, ROOM.d * 0.7, 10), mat(0x8b939c, { metalness: 0.6, roughness: 0.35 })),
      true,
      false
    )
    pipe.rotation.x = Math.PI / 2
    pipe.position.set(-1.4 + i * 0.08, ROOM.h - 0.18, -0.2)
    scene.add(pipe)
  }
  for (const z of [-3.2, -0.6, 2.2]) {
    const diffuser = addShadow(
      new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), mat(0xe8ebef, { roughness: 0.55 })),
      false,
      true
    )
    diffuser.position.set(-2.2, ROOM.h - 0.05, z)
    scene.add(diffuser)
  }

  const tableTop = addShadow(
    new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 3.6), mat(0xb8895a, { roughness: 0.45, metalness: 0.05 }))
  )
  tableTop.position.set(0, 0.76, -0.35)
  scene.add(tableTop)
  const trestleMat = mat(0x171717, { metalness: 0.55, roughness: 0.4 })
  ;[-1.2, 1.2].forEach((z) => {
    const rail = addShadow(new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.05), trestleMat), true, false)
    rail.position.set(0, 0.38, z - 0.35)
    scene.add(rail)
    ;[-0.45, 0.45].forEach((x) => {
      const leg = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), trestleMat), true, false)
      leg.position.set(x, 0.35, z - 0.35)
      scene.add(leg)
    })
  })

  const chairColor = 0xc48b8d
  ;[-1, 1].forEach((side) => {
    ;[-1.3, -0.15, 1.0].forEach((z) => {
      const chair = makeChair(chairColor)
      chair.position.set(side * 1.05, 0, z - 0.35)
      chair.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
      scene.add(chair)
    })
  })
  const headChair = makeChair(chairColor)
  headChair.position.set(0, 0, -2.55)
  scene.add(headChair)

  const sideboard = addShadow(
    new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.55, 0.42), mat(0xb8895a, { roughness: 0.5 }))
  )
  sideboard.position.set(0, 0.55, -ROOM.d / 2 + 0.45)
  scene.add(sideboard)

  const tv = addShadow(
    new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.15, 0.08), mat(0x111111, { roughness: 0.35, metalness: 0.4 })),
    true,
    false
  )
  tv.position.set(0, 1.85, -ROOM.d / 2 + 0.12)
  scene.add(tv)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.0),
    new THREE.MeshBasicMaterial({ color: 0x0b1c3a })
  )
  screen.position.set(0, 1.85, -ROOM.d / 2 + 0.17)
  scene.add(screen)

  ;[-1.1, 1.1].forEach((z) => {
    const cord = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 8), mat(0x111111)), false, false)
    cord.position.set(0, ROOM.h - 0.55, z - 0.35)
    scene.add(cord)
    const shade = addShadow(
      new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.34, 24, 1, true), mat(0x151515, { side: THREE.DoubleSide, roughness: 0.55 })),
      true,
      false
    )
    shade.position.set(0, ROOM.h - 1.05, z - 0.35)
    shade.rotation.x = Math.PI
    scene.add(shade)
    const bulb = new THREE.PointLight(0xffe6c8, 1.15, 6.5, 2)
    bulb.position.set(0, ROOM.h - 1.15, z - 0.35)
    bulb.castShadow = false
    scene.add(bulb)
  })

  for (let i = 0; i < 8; i += 1) {
    const can = addShadow(
      new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 12), mat(0x1a1a1a, { metalness: 0.4, roughness: 0.45 })),
      true,
      false
    )
    can.position.set(-2.8 + (i % 4) * 1.8, ROOM.h - 0.08, -3.5 + Math.floor(i / 4) * 4.2)
    scene.add(can)
  }
}

/**
 * @param {HTMLElement} host
 */
export function mountMeetingRoom3D(host) {
  if (!host) return null
  const canvas = document.createElement('canvas')
  canvas.className = 'ag-story__canvas'
  canvas.setAttribute('aria-label', '会议室三维场景')
  host.innerHTML = ''
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd8e4f0)
  scene.fog = new THREE.Fog(0xd8e4f0, 14, 28)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60)
  camera.position.set(0.35, 1.55, 6.35)
  camera.lookAt(0, 1.15, -1.2)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 4.5
  controls.maxDistance = 9.5
  controls.minPolarAngle = Math.PI * 0.28
  controls.maxPolarAngle = Math.PI * 0.48
  controls.minAzimuthAngle = -0.35
  controls.maxAzimuthAngle = 0.45
  controls.target.set(0, 1.1, -0.8)

  scene.add(new THREE.AmbientLight(0xf2f6fb, 0.55))
  const hemi = new THREE.HemisphereLight(0xe8f2ff, 0xb7b2a8, 0.55)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.15)
  sun.position.set(-6.5, 7.5, 2.5)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 24
  sun.shadow.camera.left = -8
  sun.shadow.camera.right = 8
  sun.shadow.camera.top = 8
  sun.shadow.camera.bottom = -8
  sun.shadow.bias = -0.00015
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xcfe4ff, 0.45)
  fill.position.set(4, 3, 3)
  scene.add(fill)

  buildRoom(scene)
  const person = makePerson()
  scene.add(person)

  const clock = new THREE.Clock()
  let raf = 0
  let disposed = false
  let enter = null

  const resize = () => {
    const w = host.clientWidth || 640
    const h = host.clientHeight || 420
    camera.aspect = w / Math.max(h, 1)
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  const projectPin = (key) => {
    const world = PIN_WORLD[key]
    if (!world) return null
    const v = world.clone().project(camera)
    if (v.z > 1) return null
    return {
      x: (v.x * 0.5 + 0.5) * 100,
      y: (-v.y * 0.5 + 0.5) * 100,
    }
  }

  const setPersonPose = (t, walking) => {
    const { armL, armR, legL, legR, shoeL, shoeR } = person.userData.parts
    const swing = walking ? Math.sin(t * 9) * 0.55 : Math.sin(t * 1.5) * 0.04
    legL.pivot.rotation.x = swing
    legR.pivot.rotation.x = -swing
    armL.pivot.rotation.x = -swing * 0.7
    armR.pivot.rotation.x = swing * 0.7
    shoeL.position.z = 0.04 + swing * 0.08
    shoeR.position.z = 0.04 - swing * 0.08
    person.position.y = walking ? Math.abs(Math.sin(t * 9)) * 0.025 : 0
  }

  const tickEnter = (now) => {
    if (!enter) return
    const u = Math.min(1, (now - enter.startedAt) / enter.duration)
    const ease = 1 - (1 - u) ** 3
    if (u < 0.42) {
      const p = ease / 0.42
      person.position.lerpVectors(enter.from, enter.mid, p)
      person.rotation.y = Math.PI
      setPersonPose(now * 0.001, true)
    } else if (u < 0.7) {
      const p = (u - 0.42) / 0.28
      person.position.lerpVectors(enter.mid, enter.look, p)
      person.rotation.y = Math.PI + Math.sin(p * Math.PI * 2) * 0.55
      setPersonPose(now * 0.001, false)
    } else {
      const p = (u - 0.7) / 0.3
      person.position.lerpVectors(enter.look, enter.window, p)
      person.rotation.y = Math.PI * 0.5 + (1 - p) * 0.35
      setPersonPose(now * 0.001, p < 0.85)
      if (u >= 1) enter = null
    }
  }

  const loop = () => {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    tickEnter(now)
    if (!enter && person.visible) setPersonPose(clock.elapsedTime, false)
    controls.update()
    renderer.render(scene, camera)
    api._onFrame?.(api)
  }

  const onResize = () => resize()
  resize()
  window.addEventListener('resize', onResize)
  raf = requestAnimationFrame(loop)

  const api = {
    host,
    canvas,
    projectPin,
    playEnter() {
      person.visible = true
      person.position.set(0.2, 0, 5.4)
      person.rotation.y = Math.PI
      enter = {
        startedAt: performance.now(),
        duration: 4800,
        from: new THREE.Vector3(0.2, 0, 5.4),
        mid: new THREE.Vector3(-0.15, 0, 2.1),
        look: new THREE.Vector3(0.35, 0, 0.6),
        window: new THREE.Vector3(-2.55, 0, 0.85),
      }
    },
    resetPerson() {
      enter = null
      person.visible = false
    },
    setActive(active) {
      canvas.style.pointerEvents = active ? 'auto' : 'none'
      if (!active) {
        enter = null
        person.visible = false
      }
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      host.innerHTML = ''
    },
  }

  return api
}

export function syncStoryPinsTo3D(root, roomApi) {
  if (!roomApi || !root) return
  const byLabel = {
    人员进入: 0,
    环境已更新: 1,
    照明开启: 3,
    空调舒适模式: '3b',
    信息屏更新: '3c',
    执行成功: 4,
  }
  root.querySelectorAll('[data-ag-pin-step]').forEach((pin) => {
    const label = pin.textContent.trim()
    const pos = roomApi.projectPin(byLabel[label] ?? Number(pin.dataset.agPinStep))
    if (!pos) return
    pin.style.left = `${pos.x}%`
    pin.style.top = `${pos.y}%`
  })
}
