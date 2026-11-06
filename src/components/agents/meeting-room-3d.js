import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const ROOM = { w: 8.6, d: 11.2, h: 3.35 }
/** 会议桌 + 两侧座椅占位，行人必须绕行 */
const TABLE_BLOCK = { minX: -1.62, maxX: 1.62, minZ: -2.92, maxZ: 1.62 }
const PIN_WORLD = {
  0: new THREE.Vector3(-3.2, 1.35, 2.4),
  1: new THREE.Vector3(-1.6, 2.55, -0.4),
  3: new THREE.Vector3(2.4, 2.4, -1.2),
  '3b': new THREE.Vector3(0.05, 3.15, -1.85),
  '3c': new THREE.Vector3(0.2, 0.95, -0.6),
  4: new THREE.Vector3(-2.6, 0.55, 3.2),
}

function pushOutOfTable(pos) {
  const { minX, maxX, minZ, maxZ } = TABLE_BLOCK
  if (pos.x <= minX || pos.x >= maxX || pos.z <= minZ || pos.z >= maxZ) return pos
  const toL = pos.x - minX
  const toR = maxX - pos.x
  const toB = pos.z - minZ
  const toF = maxZ - pos.z
  const nearest = Math.min(toL, toR, toB, toF)
  if (nearest === toL) pos.x = minX
  else if (nearest === toR) pos.x = maxX
  else if (nearest === toB) pos.z = minZ
  else pos.z = maxZ
  return pos
}

function makeCanvasTexture(draw, size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

function noise(ctx, size, alpha = 0.08) {
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * alpha
    d[i] = Math.min(255, Math.max(0, d[i] + n))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
  }
  ctx.putImageData(img, 0, 0)
}

function createTextures() {
  // 中灰商务桌面：明确灰色，带细复合板肌理，避免发白
  const woodMap = makeCanvasTexture((ctx, size) => {
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#7a828c')
    base.addColorStop(0.28, '#6e7682')
    base.addColorStop(0.62, '#636b76')
    base.addColorStop(1, '#58616c')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    // 细横纹 + 纵向明暗，模拟哑光灰复合板
    for (let y = 0; y < size; y += 2) {
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + (y % 13) * 0.004})`
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y * 0.03) * 1.2)
      ctx.bezierCurveTo(size * 0.35, y + 2, size * 0.65, y - 1.5, size, y + Math.cos(y * 0.025) * 1.2)
      ctx.stroke()
    }
    for (let i = 0; i < 36; i += 1) {
      const x = (i / 36) * size
      const band = ctx.createLinearGradient(x - 10, 0, x + 10, 0)
      band.addColorStop(0, 'rgba(20, 24, 30, 0)')
      band.addColorStop(0.5, `rgba(12, 16, 22, ${0.05 + (i % 5) * 0.02})`)
      band.addColorStop(1, 'rgba(20, 24, 30, 0)')
      ctx.fillStyle = band
      ctx.fillRect(x - 10, 0, 20, size)
    }
    // 轻微点状颗粒，提升近景质感
    for (let i = 0; i < 2800; i += 1) {
      const x = Math.random() * size
      const y = Math.random() * size
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,255,255,${0.02 + Math.random() * 0.04})`
        : `rgba(0,0,0,${0.03 + Math.random() * 0.05})`
      ctx.fillRect(x, y, 1, 1)
    }
    const sheen = ctx.createRadialGradient(size * 0.48, size * 0.38, 10, size * 0.5, size * 0.42, size * 0.5)
    sheen.addColorStop(0, 'rgba(210,220,230,0.08)')
    sheen.addColorStop(1, 'rgba(210,220,230,0)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.045)
  })
  woodMap.repeat.set(1.15, 2.1)

  const woodRough = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#8a8a8a'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 160; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`
      ctx.fillRect(Math.random() * size, 0, 1 + Math.random() * 3, size)
    }
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.08})`
      ctx.fillRect(Math.random() * size, Math.random() * size, 10 + Math.random() * 28, 2)
    }
    noise(ctx, size, 0.12)
  }, 512)
  woodRough.repeat.copy(woodMap.repeat)

  // 占位：墙/地真实贴图由 TextureLoader 异步替换为参考图材质
  const floorWood = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#7a7e82'
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.08)
  }, 64)
  floorWood.repeat.set(4.8, 6.2)

  const floorWoodRough = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#a8a8a8'
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.16)
  }, 64)
  floorWoodRough.repeat.copy(floorWood.repeat)
  floorWoodRough.colorSpace = THREE.NoColorSpace

  const plaster = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#f3f5f8'
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.05)
  }, 256)
  plaster.repeat.set(2, 1.2)

  // 深色竖纹皮面：参考商务会议椅肋纹皮料
  const fabric = makeCanvasTexture((ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, size, size)
    g.addColorStop(0, '#2c3138')
    g.addColorStop(0.45, '#1a1e24')
    g.addColorStop(1, '#262b33')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    for (let x = 0; x < size; x += 5) {
      const rib = ctx.createLinearGradient(x, 0, x + 5, 0)
      rib.addColorStop(0, 'rgba(255,255,255,0.03)')
      rib.addColorStop(0.45, 'rgba(0,0,0,0.18)')
      rib.addColorStop(1, 'rgba(255,255,255,0.02)')
      ctx.fillStyle = rib
      ctx.fillRect(x, 0, 5, size)
    }
    for (let y = 0; y < size; y += 7) {
      ctx.fillStyle = 'rgba(255,255,255,0.015)'
      ctx.fillRect(0, y, size, 1)
    }
    noise(ctx, size, 0.05)
  }, 256)
  fabric.repeat.set(2.4, 2.4)

  const metal = makeCanvasTexture((ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, '#b8c0c8')
    g.addColorStop(0.5, '#8e98a2')
    g.addColorStop(1, '#a7b0b8')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 40; i += 1) {
      ctx.strokeStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`
      ctx.beginPath()
      ctx.moveTo(0, Math.random() * size)
      ctx.lineTo(size, Math.random() * size)
      ctx.stroke()
    }
    noise(ctx, size, 0.07)
  }, 256)

  const foliage = makeCanvasTexture((ctx, size) => {
    const sky = ctx.createLinearGradient(0, 0, 0, size)
    sky.addColorStop(0, '#9ec9ef')
    sky.addColorStop(0.55, '#c5dff5')
    sky.addColorStop(1, '#e8f2dc')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 48; i += 1) {
      const x = Math.random() * size
      const y = size * 0.45 + Math.random() * size * 0.5
      const r = 18 + Math.random() * 40
      ctx.fillStyle = `rgba(${40 + Math.random() * 50},${110 + Math.random() * 60},${40 + Math.random() * 30},${0.45 + Math.random() * 0.35})`
      ctx.beginPath()
      ctx.ellipse(x, y, r * (0.7 + Math.random() * 0.5), r, Math.random(), 0, Math.PI * 2)
      ctx.fill()
    }
  }, 512)

  const sky = makeCanvasTexture((ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, '#7eb6e8')
    g.addColorStop(0.45, '#b7d8f5')
    g.addColorStop(1, '#e7eef6')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.ellipse(size * 0.3, size * 0.28, 60, 22, 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(size * 0.7, size * 0.22, 80, 26, -0.1, 0, Math.PI * 2)
    ctx.fill()
  }, 256)

  return {
    woodMap,
    woodRough,
    floorWood,
    floorWoodRough,
    plaster,
    fabric,
    metal,
    foliage,
    sky,
  }
}

/** 加载参考材质图；stretch=true 时整面拉伸，不重复平铺 */
function loadRefMap(url, repeatX = 1, repeatY = 1, { stretch = false } = {}) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.wrapS = tex.wrapT = stretch ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping
        tex.anisotropy = 8
        tex.repeat.set(stretch ? 1 : repeatX, stretch ? 1 : repeatY)
        tex.needsUpdate = true
        resolve(tex)
      },
      undefined,
      reject
    )
  })
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    envMapIntensity: opts.envMapIntensity ?? 0.85,
    ...opts,
  })
}

function addShadow(mesh, cast = true, receive = true) {
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  return mesh
}

function makeChair(fabricMat, metalMat) {
  // 行政会议椅：高靠背肋纹皮面 + 金属扶手 + 五星底座
  const g = new THREE.Group()
  const seat = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.08, 0.54, 5, 0.05), fabricMat))
  seat.position.y = 0.48
  g.add(seat)
  const cushion = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.045, 0.46, 4, 0.03), fabricMat), true, false)
  cushion.position.y = 0.535
  g.add(cushion)
  const back = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.74, 0.08, 5, 0.04), fabricMat))
  back.position.set(0, 0.93, -0.23)
  g.add(back)
  const lumbar = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.15, 0.055, 3, 0.025), fabricMat), true, false)
  lumbar.position.set(0, 0.7, -0.17)
  g.add(lumbar)
  ;[-1, 1].forEach((side) => {
    const arm = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.04, 0.38, 3, 0.015), metalMat), true, false)
    arm.position.set(side * 0.3, 0.68, -0.02)
    g.add(arm)
    const post = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 12), metalMat), true, false)
    post.position.set(side * 0.3, 0.57, 0.12)
    g.add(post)
  })
  const column = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.38, 18), metalMat), true, false)
  column.position.y = 0.24
  g.add(column)
  const hub = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 24), metalMat), true, false)
  hub.position.y = 0.055
  g.add(hub)
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2
    const spoke = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.32, 5, 10), metalMat), true, false)
    spoke.position.set(Math.cos(a) * 0.18, 0.05, Math.sin(a) * 0.18)
    spoke.rotation.z = Math.PI / 2
    spoke.rotation.y = -a
    g.add(spoke)
    const caster = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12), metalMat), true, false)
    caster.position.set(Math.cos(a) * 0.34, 0.032, Math.sin(a) * 0.34)
    g.add(caster)
  }
  return g
}

/** 商务人模：更写实的比例与服装层次，鞋底贴地，保留行走骨骼接口 */
function makePerson({ coatColor = 0x1a3f78, visible = false } = {}) {
  const root = new THREE.Group()
  root.visible = visible

  const skin = mat(0xd8b094, { roughness: 0.72, envMapIntensity: 0.22 })
  const coat = mat(coatColor, { roughness: 0.58, envMapIntensity: 0.45 })
  const pants = mat(0x232933, { roughness: 0.78, envMapIntensity: 0.22 })
  const hair = mat(0x171b22, { roughness: 0.88, envMapIntensity: 0.15 })
  const shoeMat = mat(0x141820, { roughness: 0.42, metalness: 0.08, envMapIntensity: 0.35 })
  const shirt = mat(0xeef1f4, { roughness: 0.78, envMapIntensity: 0.18 })
  const eyeMat = mat(0x1c2430, { roughness: 0.35, envMapIntensity: 0.2 })

  const hips = new THREE.Group()
  // 髋高对齐：大腿+小腿+鞋底后，鞋底落在 y≈0
  hips.position.y = 0.88
  root.add(hips)

  const pelvis = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.2, 0.2, 3, 0.045), pants), true, false)
  hips.add(pelvis)

  const spine = new THREE.Group()
  spine.position.y = 0.1
  hips.add(spine)

  const torso = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.52, 0.24, 3, 0.055), coat))
  torso.position.y = 0.3
  spine.add(torso)

  // 西装翻领暗示，减少“方块躯干”感
  ;[-1, 1].forEach((side) => {
    const lapel = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.28, 0.03, 1, 0.01), coat), true, false)
    lapel.position.set(side * 0.1, 0.38, 0.12)
    lapel.rotation.z = side * -0.18
    lapel.rotation.x = -0.08
    spine.add(lapel)
  })

  const collar = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.07, 0.14, 2, 0.02), shirt), true, false)
  collar.position.set(0, 0.54, 0.05)
  spine.add(collar)

  const shoulder = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.11, 0.22, 3, 0.04), coat), true, false)
  shoulder.position.y = 0.52
  spine.add(shoulder)

  const neck = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.11, 12), skin), true, false)
  neck.position.y = 0.62
  spine.add(neck)

  // 略扁的头型 + 简单五官，降低胶囊人观感
  const head = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.118, 22, 18), skin), true, false)
  head.scale.set(0.92, 1.05, 0.95)
  head.position.y = 0.76
  spine.add(head)

  ;[-1, 1].forEach((side) => {
    const eye = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeMat), true, false)
    eye.position.set(side * 0.038, 0.77, 0.1)
    spine.add(eye)
  })
  const nose = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), skin), true, false)
  nose.scale.set(0.7, 0.9, 1.2)
  nose.position.set(0, 0.745, 0.112)
  spine.add(nose)

  const hairMesh = addShadow(
    new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hair),
    true,
    false
  )
  hairMesh.scale.set(0.95, 1.02, 1)
  hairMesh.position.set(0, 0.8, -0.012)
  spine.add(hairMesh)

  const makeArm = (side) => {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.26, 0.5, 0)
    spine.add(pivot)

    const upper = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.28, 5, 10), coat), true, false)
    upper.position.y = -0.17
    pivot.add(upper)

    const elbow = new THREE.Group()
    elbow.position.y = -0.34
    pivot.add(elbow)

    const lower = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.24, 5, 10), coat), true, false)
    lower.position.y = -0.15
    elbow.add(lower)

    const hand = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.055, 0.085, 0.045, 2, 0.012), skin), true, false)
    hand.position.y = -0.31
    elbow.add(hand)

    pivot.rotation.z = side * 0.1
    return { pivot, elbow }
  }

  const armL = makeArm(-1)
  const armR = makeArm(1)

  const makeLeg = (side) => {
    const hip = new THREE.Group()
    hip.position.set(side * 0.09, -0.02, 0)
    hips.add(hip)

    const thigh = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.36, 5, 10), pants), true, false)
    thigh.position.y = -0.21
    hip.add(thigh)

    const knee = new THREE.Group()
    knee.position.y = -0.44
    hip.add(knee)

    const shin = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.34, 5, 10), pants), true, false)
    shin.position.y = -0.2
    knee.add(shin)

    const ankle = new THREE.Group()
    ankle.position.y = -0.42
    knee.add(ankle)

    const shoe = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.065, 0.25, 2, 0.018), shoeMat), true, false)
    shoe.position.set(0, 0.032, 0.048)
    ankle.add(shoe)

    return { hip, knee, ankle, shoe }
  }

  const legL = makeLeg(-1)
  const legR = makeLeg(1)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 28),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.006
  root.add(shadow)

  root.userData.parts = { hips, spine, armL, armR, legL, legR, head, shadow }
  return root
}

function makeCeilingRadar() {
  const group = new THREE.Group()
  group.position.set(2.15, ROOM.h - 0.06, -1.35)

  const housing = addShadow(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.08, 24),
      mat(0x1c2433, { metalness: 0.55, roughness: 0.35, envMapIntensity: 1.1 })
    ),
    true,
    false
  )
  group.add(housing)

  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 24),
    new THREE.MeshStandardMaterial({
      color: 0x00d5c7,
      emissive: 0x00d5c7,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.2,
    })
  )
  lens.rotation.x = Math.PI / 2
  lens.position.y = -0.045
  group.add(lens)

  const waves = []
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.22, 48),
      new THREE.MeshBasicMaterial({
        color: 0x00d5c7,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = -0.05
    ring.userData.phase = i / 3
    group.add(ring)
    waves.push(ring)
  }

  group.userData = { waves, lens, sensing: false }
  return group
}

function makeMeetingScreenTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 576
  const ctx = canvas.getContext('2d')
  const paint = () => {
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bg.addColorStop(0, '#0a1a33')
    bg.addColorStop(1, '#102846')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // 顶栏
    ctx.fillStyle = 'rgba(8, 121, 249, 0.22)'
    ctx.fillRect(0, 0, canvas.width, 64)
    ctx.fillStyle = '#7ef0e4'
    ctx.font = '700 26px "Microsoft YaHei", sans-serif'
    ctx.fillText('Aspace 会议室 · 周例会', 36, 42)
    ctx.fillStyle = '#9eb4d0'
    ctx.font = '500 16px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('进行中  00:24:18', canvas.width - 36, 40)
    ctx.textAlign = 'left'
    // 左侧议程
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, 36, 92, 420, 430, 16)
    ctx.fill()
    ctx.fillStyle = '#d7e6ff'
    ctx.font = '700 22px "Microsoft YaHei", sans-serif'
    ctx.fillText('今日议程', 60, 136)
    const agenda = [
      '01  上周空间运营回顾',
      '02  能耗异常点复盘',
      '03  访客邀约流程优化',
      '04  下季度孪生看板规划',
    ]
    agenda.forEach((line, i) => {
      ctx.fillStyle = i === 1 ? '#7ef0e4' : '#c5d4ea'
      ctx.font = `${i === 1 ? '700' : '500'} 20px "Microsoft YaHei", sans-serif`
      ctx.fillText(line, 60, 196 + i * 52)
    })
    // 右侧参会宫格
    const names = ['张明', '李华', '王芳', '陈晨']
    const cols = 2
    const gap = 16
    const left = 480
    const top = 92
    const cellW = (canvas.width - left - 36 - gap) / cols
    const cellH = (430 - gap) / 2
    names.forEach((name, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      const x = left + c * (cellW + gap)
      const y = top + r * (cellH + gap)
      const g = ctx.createLinearGradient(x, y, x + cellW, y + cellH)
      g.addColorStop(0, '#1a3f6e')
      g.addColorStop(1, '#102848')
      ctx.fillStyle = g
      roundRect(ctx, x, y, cellW, cellH, 14)
      ctx.fill()
      ctx.fillStyle = '#3d6aa3'
      ctx.beginPath()
      ctx.arc(x + cellW / 2, y + cellH * 0.42, Math.min(cellW, cellH) * 0.16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e8f1ff'
      ctx.font = '700 34px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(name.slice(0, 1), x + cellW / 2, y + cellH * 0.42 + 12)
      ctx.fillStyle = 'rgba(7,20,40,0.7)'
      ctx.fillRect(x, y + cellH - 42, cellW, 42)
      ctx.fillStyle = '#fff'
      ctx.font = '600 18px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(name, x + 16, y + cellH - 16)
      if (i === 0) {
        ctx.fillStyle = '#00d5c7'
        ctx.beginPath()
        ctx.arc(x + cellW - 20, y + 20, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.textAlign = 'left'
  }
  const roundRect = (c, x, y, w, h, r) => {
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + w, y, x + w, y + h, r)
    c.arcTo(x + w, y + h, x, y + h, r)
    c.arcTo(x, y + h, x, y, r)
    c.arcTo(x, y, x + w, y, r)
    c.closePath()
  }
  paint()
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return { texture: tex, canvas, paint }
}

function buildRoom(scene, tex) {
  /** @type {{ light: THREE.PointLight, glow: THREE.Mesh, on: number }[]} */
  const pendants = []
  /** @type {{ light: THREE.SpotLight, glow: THREE.Mesh, on: number }[]} */
  const cans = []
  /** @type {{ louvers: THREE.Mesh[], led: THREE.Mesh, openAngle: number } | null} */
  let cassetteAc = null
  /** @type {THREE.Mesh[]} */
  const curtains = []

  // 地面：图2 粗织灰织物材质（异步换上参考图）
  const floorMat = mat(0xffffff, {
    map: tex.floorWood,
    bumpMap: tex.floorWood,
    bumpScale: 0.028,
    roughnessMap: tex.floorWoodRough,
    roughness: 0.96,
    metalness: 0,
    envMapIntensity: 0.12,
  })
  const floor = addShadow(new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat), false, true)
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  const ceiling = addShadow(
    new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.w, ROOM.d),
      mat(0xffffff, { map: tex.plaster, roughness: 0.92, envMapIntensity: 0.25 })
    ),
    false,
    true
  )
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = ROOM.h
  scene.add(ceiling)

  // 后墙：图1 灰白交错长方砖材质（异步换上参考图）
  const wallMat = mat(0xffffff, {
    map: tex.plaster,
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.2,
  })
  const back = addShadow(new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.h), wallMat), false, true)
  back.position.set(0, ROOM.h / 2, -ROOM.d / 2)
  scene.add(back)

  // 异步挂载参考材质图
  if (tex.wallRefMap) {
    wallMat.map = tex.wallRefMap
    wallMat.bumpMap = tex.wallRefMap
    wallMat.bumpScale = 0.012
    wallMat.needsUpdate = true
  }
  if (tex.floorRefMap) {
    floorMat.map = tex.floorRefMap
    floorMat.bumpMap = tex.floorRefMap
    floorMat.bumpScale = 0.008
    floorMat.roughnessMap = null
    floorMat.color.set(0xffffff)
    floorMat.needsUpdate = true
  }

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8eef4,
    transmission: 0.88,
    transparent: true,
    opacity: 1,
    roughness: 0.08,
    metalness: 0,
    thickness: 0.28,
    ior: 1.45,
    envMapIntensity: 1.05,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide,
  })
  const frameMat = mat(0x2a3038, { metalness: 0.78, roughness: 0.34, envMapIntensity: 1.05 })

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

  const skyL = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.d, ROOM.h),
    new THREE.MeshBasicMaterial({ map: tex.sky })
  )
  skyL.position.set(-ROOM.w / 2 - 0.55, ROOM.h / 2, 0)
  skyL.rotation.y = Math.PI / 2
  scene.add(skyL)
  const trees = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.d * 0.95, ROOM.h * 0.85),
    new THREE.MeshBasicMaterial({ map: tex.foliage, transparent: true })
  )
  trees.position.set(-ROOM.w / 2 - 0.4, ROOM.h * 0.42, 0)
  trees.rotation.y = Math.PI / 2
  scene.add(trees)

  const skyR = skyL.clone()
  skyR.position.set(ROOM.w / 2 + 0.55, ROOM.h / 2, 0)
  skyR.rotation.y = -Math.PI / 2
  scene.add(skyR)

  // 左右窗帘：参考灰织布材质，默认收起
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: tex.curtainRefMap || null,
    bumpMap: tex.curtainRefMap || null,
    bumpScale: tex.curtainRefMap ? 0.022 : 0,
    roughness: 0.95,
    metalness: 0,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    envMapIntensity: 0.12,
  })
  ;[-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d * 0.92, ROOM.h * 0.9, 1, 1), curtainMat.clone())
    panel.position.set(side * (ROOM.w / 2 - 0.06), ROOM.h * 0.52, 0)
    panel.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
    panel.scale.set(1, 0.04, 1)
    panel.visible = true
    scene.add(panel)
    curtains.push(panel)
  })

  // 房顶四方出风中央空调（卡式机）：开=指示灯亮 + 叶片打开，无出风粒子
  {
    const acSize = 0.92
    const acDepth = 0.08
    const acGroup = new THREE.Group()
    acGroup.position.set(0, ROOM.h - acDepth / 2 - 0.01, -1.85)
    const shellMat = mat(0xf2f4f6, { roughness: 0.78, metalness: 0.08, envMapIntensity: 0.28 })
    const shell = addShadow(
      new THREE.Mesh(new RoundedBoxGeometry(acSize, acDepth, acSize, 2, 0.02), shellMat),
      true,
      true
    )
    acGroup.add(shell)
    const grille = addShadow(
      new THREE.Mesh(
        new RoundedBoxGeometry(acSize * 0.42, 0.02, acSize * 0.42, 2, 0.01),
        mat(0xe6e9ed, { roughness: 0.7, metalness: 0.12, envMapIntensity: 0.25 })
      ),
      false,
      true
    )
    grille.position.y = -acDepth / 2 + 0.005
    acGroup.add(grille)
    // 中央进风格栅细条
    for (let i = -2; i <= 2; i += 1) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(acSize * 0.34, 0.006, 0.012),
        mat(0xcfd4da, { roughness: 0.65, metalness: 0.15 })
      )
      bar.position.set(0, -acDepth / 2 - 0.002, i * 0.055)
      acGroup.add(bar)
    }
    const louverMat = mat(0xe8ebef, { roughness: 0.62, metalness: 0.1, envMapIntensity: 0.22 })
    const louvers = []
    const louverSpecs = [
      { x: 0, z: acSize * 0.32, rotY: 0 },
      { x: 0, z: -acSize * 0.32, rotY: Math.PI },
      { x: acSize * 0.32, z: 0, rotY: Math.PI / 2 },
      { x: -acSize * 0.32, z: 0, rotY: -Math.PI / 2 },
    ]
    louverSpecs.forEach(({ x, z, rotY }) => {
      const pivot = new THREE.Group()
      pivot.position.set(x, -acDepth / 2 + 0.01, z)
      pivot.rotation.y = rotY
      const blade = new THREE.Mesh(new THREE.BoxGeometry(acSize * 0.62, 0.012, 0.055), louverMat)
      blade.position.set(0, 0, 0.01)
      pivot.add(blade)
      acGroup.add(pivot)
      louvers.push(pivot)
    })
    // 状态指示灯（关灯暗灰，开灯青绿）
    const led = new THREE.Mesh(
      new THREE.CircleGeometry(0.018, 16),
      new THREE.MeshStandardMaterial({
        color: 0x8a9098,
        emissive: 0x00d4c4,
        emissiveIntensity: 0,
        roughness: 0.35,
        metalness: 0.2,
      })
    )
    led.rotation.x = -Math.PI / 2
    led.position.set(acSize * 0.28, -acDepth / 2 - 0.001, acSize * 0.28)
    acGroup.add(led)
    scene.add(acGroup)
    cassetteAc = { louvers, led, openAngle: 0.55 }
  }

  // 中灰哑光台面：明确灰色，带柔清漆层，近看有细颗粒
  const woodMat = new THREE.MeshPhysicalMaterial({
    color: 0x8a929c,
    map: tex.woodMap,
    roughnessMap: tex.woodRough,
    roughness: 0.48,
    metalness: 0.08,
    clearcoat: 0.35,
    clearcoatRoughness: 0.42,
    reflectivity: 0.35,
    envMapIntensity: 0.7,
  })
  const tableEdgeMat = mat(0x4a525c, { roughness: 0.4, metalness: 0.28, envMapIntensity: 0.85 })
  // 厚实圆角会议桌 + 拉丝金属双柱底座
  const tableTop = addShadow(new THREE.Mesh(new RoundedBoxGeometry(1.58, 0.1, 3.85, 5, 0.045), woodMat))
  tableTop.position.set(0, 0.79, -0.35)
  scene.add(tableTop)
  const tableEdge = addShadow(
    new THREE.Mesh(new RoundedBoxGeometry(1.62, 0.035, 3.9, 4, 0.02), tableEdgeMat),
    true,
    false
  )
  tableEdge.position.set(0, 0.73, -0.35)
  scene.add(tableEdge)
  const chrome = mat(0xaeb8c2, { metalness: 0.92, roughness: 0.22, envMapIntensity: 1.25, map: tex.metal })
  ;[-1.15, 1.15].forEach((z) => {
    const pedestal = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.64, 28), chrome), true, false)
    pedestal.position.set(0, 0.35, z - 0.35)
    scene.add(pedestal)
    const foot = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.045, 32), chrome), true, false)
    foot.position.set(0, 0.035, z - 0.35)
    scene.add(foot)
  })
  // 桌面线盒 / 麦克风基座，贴近真实会议室细节
  const hubMat = mat(0x6a7380, { metalness: 0.78, roughness: 0.28, envMapIntensity: 1.1 })
  ;[-1.2, -0.2, 0.8].forEach((z) => {
    const hub = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.035, 0.14, 2, 0.012), hubMat), true, false)
    hub.position.set(0, 0.86, z - 0.35)
    scene.add(hub)
    const mic = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.02, 16), hubMat), true, false)
    mic.position.set(0, 0.885, z - 0.35)
    scene.add(mic)
  })

  const fabricMat = mat(0xffffff, {
    map: tex.fabric,
    roughness: 0.78,
    metalness: 0.015,
    envMapIntensity: 0.22,
  })
  const chairMetal = mat(0xb6bfc8, { metalness: 0.88, roughness: 0.24, envMapIntensity: 1.2, map: tex.metal })
  ;[-1, 1].forEach((side) => {
    ;[-1.3, -0.15, 1.0].forEach((z) => {
      const chair = makeChair(fabricMat, chairMetal)
      chair.position.set(side * 1.12, 0, z - 0.35)
      chair.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
      scene.add(chair)
    })
  })
  const headChair = makeChair(fabricMat, chairMetal)
  headChair.position.set(0, 0, -2.62)
  scene.add(headChair)

  const sideboardMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a848e,
    map: tex.woodMap,
    roughnessMap: tex.woodRough,
    roughness: 0.52,
    metalness: 0.06,
    clearcoat: 0.22,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.55,
  })
  const sideboard = addShadow(new THREE.Mesh(new RoundedBoxGeometry(2.8, 0.55, 0.42, 3, 0.03), sideboardMat))
  sideboard.position.set(0, 0.55, -ROOM.d / 2 + 0.45)
  scene.add(sideboard)

  const tv = addShadow(
    new THREE.Mesh(
      new RoundedBoxGeometry(2.2, 1.15, 0.08, 2, 0.01),
      mat(0x111111, { roughness: 0.25, metalness: 0.55, envMapIntensity: 1.3 })
    ),
    true,
    false
  )
  tv.position.set(0, 1.85, -ROOM.d / 2 + 0.12)
  scene.add(tv)
  const meeting = makeMeetingScreenTexture()
  // 息屏仍保留弱内容；亮屏提高自发光，避免电视一直黑屏
  const screenOffMat = new THREE.MeshStandardMaterial({
    map: meeting.texture,
    emissiveMap: meeting.texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.22,
    roughness: 0.4,
    metalness: 0.12,
  })
  const screenOnMat = new THREE.MeshStandardMaterial({
    map: meeting.texture,
    emissiveMap: meeting.texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.72,
    roughness: 0.28,
    metalness: 0.08,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.0), screenOnMat)
  screen.position.set(0, 1.85, -ROOM.d / 2 + 0.17)
  scene.add(screen)
  screen.userData.meeting = meeting
  screen.userData.offMat = screenOffMat
  screen.userData.onMat = screenOnMat
  meeting.texture.needsUpdate = true

  // 办公线性面板灯：关灯=白色磨砂罩；开灯=罩面高亮 + 一圈柔白光晕
  const panelFrameMat = mat(0x1a1c1f, { roughness: 0.72, metalness: 0.35, envMapIntensity: 0.45 })
  const makeDiffuserMat = () =>
    new THREE.MeshStandardMaterial({
      color: 0xf3f5f7,
      emissive: 0xffffff,
      emissiveIntensity: 0,
      roughness: 0.86,
      metalness: 0,
      envMapIntensity: 0.12,
    })
  const makeHaloMat = () =>
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  const panelLen = 1.5
  const panelWid = 0.3
  const panelThk = 0.055
  const addPanelLight = (x, z, spotOn) => {
    const group = new THREE.Group()
    group.position.set(x, ROOM.h - panelThk / 2, z)
    const frame = addShadow(
      new THREE.Mesh(new RoundedBoxGeometry(panelWid + 0.02, panelThk, panelLen + 0.02, 1, 0.006), panelFrameMat),
      true,
      false
    )
    group.add(frame)
    const diffuser = new THREE.Mesh(new THREE.PlaneGeometry(panelWid * 0.88, panelLen * 0.92), makeDiffuserMat())
    diffuser.rotation.x = Math.PI / 2
    diffuser.position.y = -panelThk / 2 - 0.001
    group.add(diffuser)
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(panelWid * 1.7, panelLen * 1.45), makeHaloMat())
    halo.rotation.x = Math.PI / 2
    halo.position.y = -panelThk / 2 - 0.004
    group.add(halo)
    scene.add(group)

    const spot = new THREE.SpotLight(0xe8eef6, 0, 9.5, Math.PI / 3.2, 0.9, 1.45)
    spot.position.set(x, ROOM.h - panelThk - 0.02, z)
    spot.target.position.set(x, 0, z)
    scene.add(spot)
    scene.add(spot.target)
    cans.push({ light: spot, glow: diffuser, halo, on: spotOn })
  }
  // 会议区三盏平行 + 前后补光
  ;[
    [-1.05, -0.35, 0.62],
    [0, -0.35, 0.68],
    [1.05, -0.35, 0.62],
    [-1.05, 2.15, 0.48],
    [1.05, 2.15, 0.48],
    [-1.05, -2.85, 0.48],
    [1.05, -2.85, 0.48],
  ].forEach(([x, z, on]) => addPanelLight(x, z, on))

  return { pendants, cans, cassetteAc, curtains, screen }
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
  renderer.toneMappingExposure = 0.82

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xc4ccd6)
  scene.fog = new THREE.Fog(0xc4ccd6, 18, 34)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture
  scene.environment = env
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60)
  camera.position.set(0.4, 1.62, 6.45)
  camera.lookAt(0, 1.1, -1.15)

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

  const ambient = new THREE.AmbientLight(0xe4e8ee, 0.28)
  scene.add(ambient)
  const hemi = new THREE.HemisphereLight(0xe2e8f0, 0x9aa3ae, 0.42)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xf0ebe4, 1.35)
  sun.position.set(-5.8, 7.2, 2.2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 24
  sun.shadow.camera.left = -8
  sun.shadow.camera.right = 8
  sun.shadow.camera.top = 8
  sun.shadow.camera.bottom = -8
  sun.shadow.bias = -0.00015
  sun.shadow.normalBias = 0.025
  sun.shadow.radius = 3.2
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xd8e0ea, 0.32)
  fill.position.set(4, 3.2, 3)
  scene.add(fill)
  const bounce = new THREE.DirectionalLight(0xe8e4de, 0.16)
  bounce.position.set(0.5, 1.2, 4)
  scene.add(bounce)

  /** @type {{ light: THREE.PointLight, glow: THREE.Mesh, on: number }[]} */
  let pendants = []
  /** @type {{ light: THREE.SpotLight, glow: THREE.Mesh, on: number }[]} */
  let cans = []
  /** @type {{ louvers: THREE.Group[], led: THREE.Mesh, openAngle: number } | null} */
  let cassetteAc = null
  /** @type {THREE.Mesh[]} */
  let curtains = []
  /** @type {THREE.Mesh | null} */
  let screen = null
  /** @type {THREE.Group | null} */
  let person = null
  /** @type {THREE.Group | null} */
  let radar = null

  const clock = new THREE.Clock()
  let raf = 0
  let disposed = false
  let roomReady = false
  /** @type {0 | 0.5 | 1} */
  let lightLevel = 0
  let screenOn = true
  let acOn = false
  let envOn = false
  let curtainTarget = 0.04
  let curtainCurrent = 0.04
  let peopleCount = 0
  let tempBase = 24.6
  const weatherOptions = ['晴朗', '多云', '薄雾', '小雨']
  let weather = weatherOptions[0]
  let weatherTick = 0
  let statsListener = null
  let statsEmitTick = 0
  let lastStatsKey = ''
  let demoActive = true
  /** @type {'enter' | 'stay' | 'exit' | 'wait'} */
  let demoPhase = 'wait'
  let demoPhaseAt = 0
  let devicesOn = false

  const DOOR = new THREE.Vector3(0.2, 0, 5.55)
  const AISLE = new THREE.Vector3(-2.05, 0, 2.35)
  const STAND = new THREE.Vector3(-2.15, 0, 0.15)

  const applyLights = (level) => {
    const next = level === true ? 1 : level === false ? 0 : level
    lightLevel = next
    const lamp = next
    const lit = lamp > 0.05
    pendants.forEach((item) => {
      item.light.intensity = item.on * lamp
    })
    cans.forEach((item) => {
      // 环境补光克制；对比主要靠「白罩 vs 高亮罩+光晕」
      item.light.intensity = item.on * lamp
      if (item.glow?.material) {
        item.glow.material.color?.setHex(0xf3f5f7)
        if ('emissiveIntensity' in item.glow.material) {
          item.glow.material.emissiveIntensity = lit ? 4.2 * lamp : 0
        }
      }
      if (item.halo?.material) {
        item.halo.material.opacity = lit ? 0.42 * lamp : 0
      }
    })
    // 整体环境几乎不变，只保证关灯时房间仍看得清
    ambient.intensity = 0.18 + 0.02 * lamp
    hemi.intensity = 0.3 + 0.02 * lamp
    sun.intensity = 0.66 + 0.04 * lamp
    fill.intensity = 0.16 + 0.02 * lamp
    bounce.intensity = 0.1 + 0.02 * lamp
    renderer.toneMappingExposure = 0.82 + 0.03 * lamp
  }

  const applyScreen = (on) => {
    if (!screen) return
    screenOn = on
    screen.material = on ? screen.userData.onMat : screen.userData.offMat
    screen.userData.meeting.texture.needsUpdate = true
  }

  const applyAc = (on) => {
    acOn = on
    if (!cassetteAc) return
    const angle = on ? cassetteAc.openAngle : 0
    cassetteAc.louvers.forEach((pivot) => {
      // 绕叶片长轴打开（本地 X），关时贴平
      pivot.children[0].rotation.x = on ? angle : 0
    })
    if (cassetteAc.led?.material) {
      cassetteAc.led.material.emissiveIntensity = on ? 2.4 : 0
      cassetteAc.led.material.color.setHex(on ? 0xb8fff8 : 0x8a9098)
    }
  }

  const applyPresence = (occupied) => {
    if (devicesOn === occupied) return
    devicesOn = occupied
    if (occupied) {
      applyLights(1)
      applyScreen(true)
      applyAc(true)
      envOn = true
      curtainTarget = 0.98
    } else {
      applyLights(0)
      applyScreen(false)
      applyAc(false)
      envOn = false
      curtainTarget = 0.04
    }
  }

  const setDemoPhase = (phase) => {
    demoPhase = phase
    demoPhaseAt = performance.now()
  }

  const startEnterCycle = () => {
    if (!person) return
    person.visible = true
    person.position.copy(DOOR)
    person.rotation.y = Math.PI
    applyPresence(false)
    setDemoPhase('enter')
  }

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

  const setPersonPose = (target, t, walking) => {
    const { armL, armR, legL, legR, spine, hips } = target.userData.parts
    const swing = walking ? Math.sin(t * 7.5) * 0.42 : Math.sin(t * 1.2) * 0.03
    const bendL = walking ? Math.max(0, -swing) * 0.7 : 0
    const bendR = walking ? Math.max(0, swing) * 0.7 : 0

    legL.hip.rotation.x = swing
    legR.hip.rotation.x = -swing
    legL.knee.rotation.x = bendL
    legR.knee.rotation.x = bendR
    legL.ankle.rotation.x = walking ? -bendL * 0.35 - Math.min(0, swing) * 0.2 : 0
    legR.ankle.rotation.x = walking ? -bendR * 0.35 - Math.min(0, -swing) * 0.2 : 0

    armL.pivot.rotation.x = -swing * 0.55
    armR.pivot.rotation.x = swing * 0.55
    armL.elbow.rotation.x = walking ? -0.35 - Math.max(0, swing) * 0.25 : -0.2
    armR.elbow.rotation.x = walking ? -0.35 - Math.max(0, -swing) * 0.25 : -0.2

    if (spine) spine.rotation.y = walking ? Math.sin(t * 7.5) * 0.04 : 0
    if (hips) hips.position.y = 0.85
    // 始终贴地，不靠整体抬升制造“飘”
    target.position.y = 0
  }

  const tickDemo = (now) => {
    if (!roomReady || !person) return
    if (!demoActive) {
      peopleCount = 0
      return
    }

    const elapsed = now - demoPhaseAt

    if (demoPhase === 'wait') {
      person.visible = false
      peopleCount = 0
      applyPresence(false)
      if (elapsed >= 1800) startEnterCycle()
      return
    }

    person.visible = true

    if (demoPhase === 'enter') {
      const dur = 4800
      const u = Math.min(1, elapsed / dur)
      if (u < 0.55) {
        const p = u / 0.55
        person.position.lerpVectors(DOOR, AISLE, p)
        person.rotation.y = Math.PI
        setPersonPose(person, now * 0.001, true)
      } else {
        const p = (u - 0.55) / 0.45
        person.position.lerpVectors(AISLE, STAND, p)
        person.rotation.y = Math.PI + p * 0.45
        setPersonPose(person, now * 0.001, p < 0.92)
      }
      pushOutOfTable(person.position)
      const inside = person.position.z < 4.0
      peopleCount = inside ? 1 : 0
      if (inside) applyPresence(true)
      if (u >= 1) setDemoPhase('stay')
      return
    }

    if (demoPhase === 'stay') {
      person.position.copy(STAND)
      pushOutOfTable(person.position)
      person.rotation.y = Math.PI * 0.55 + Math.sin(elapsed * 0.0016) * 0.25
      setPersonPose(person, now * 0.001, false)
      peopleCount = 1
      applyPresence(true)
      if (elapsed >= 3200) setDemoPhase('exit')
      return
    }

    if (demoPhase === 'exit') {
      const dur = 4600
      const u = Math.min(1, elapsed / dur)
      if (u < 0.45) {
        const p = u / 0.45
        person.position.lerpVectors(STAND, AISLE, p)
        person.rotation.y = 0
        setPersonPose(person, now * 0.001, true)
      } else {
        const p = (u - 0.45) / 0.55
        person.position.lerpVectors(AISLE, DOOR, p)
        person.rotation.y = 0
        setPersonPose(person, now * 0.001, true)
      }
      pushOutOfTable(person.position)
      const inside = person.position.z < 4.2
      peopleCount = inside ? 1 : 0
      if (!inside) applyPresence(false)
      if (u >= 1) {
        person.visible = false
        peopleCount = 0
        applyPresence(false)
        setDemoPhase('wait')
      }
    }
  }

  const tickRadar = (now) => {
    if (!radar) return
    const sensing = peopleCount > 0
    radar.userData.sensing = sensing
    radar.userData.lens.material.emissiveIntensity = sensing ? 0.9 + Math.sin(now * 0.01) * 0.25 : 0.2
    radar.userData.waves.forEach((ring) => {
      if (!sensing) {
        ring.material.opacity = 0
        ring.scale.setScalar(1)
        return
      }
      const cycle = ((now * 0.00055 + ring.userData.phase) % 1)
      const scale = 1 + cycle * 4.5
      ring.scale.setScalar(scale)
      ring.material.opacity = Math.max(0, 0.55 * (1 - cycle))
    })
  }

  const countLitFixtures = () => {
    if (lightLevel <= 0.01) return 0
    const total = pendants.length + cans.length
    return lightLevel >= 0.99 ? total : Math.max(1, Math.round(total * lightLevel))
  }

  const getTwinStats = () => ({
    people: peopleCount,
    lightsOn: countLitFixtures(),
    lightsTotal: pendants.length + cans.length,
    temperature: Number((tempBase + Math.sin(clock.elapsedTime * 0.15) * 0.35 - (acOn ? 0.8 : 0)).toFixed(1)),
    weather,
    ac: acOn ? '舒适送风' : '待机',
    screen: screenOn ? '会议中' : '关闭',
    curtain: envOn ? '已关闭' : '全开',
    radar: peopleCount > 0 ? '感应中' : '空闲',
    lightLevel,
  })

  const tickCurtains = (dt) => {
    curtainCurrent += (curtainTarget - curtainCurrent) * Math.min(1, dt * 3.2)
    const H = ROOM.h * 0.9
    curtains.forEach((panel) => {
      panel.scale.y = Math.max(0.04, curtainCurrent)
      panel.position.y = ROOM.h - 0.08 - (H * panel.scale.y) / 2
    })
  }

  const loop = () => {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    if (!roomReady) {
      renderer.render(scene, camera)
      return
    }
    const now = performance.now()
    const dt = Math.min(0.05, clock.getDelta())
    tickDemo(now)
    tickRadar(now)
    tickCurtains(dt)
    weatherTick += dt
    if (weatherTick > 18) {
      weatherTick = 0
      weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
    }
    controls.update()
    renderer.render(scene, camera)
    statsEmitTick += dt
    if (statsListener && statsEmitTick >= 0.25) {
      statsEmitTick = 0
      const stats = getTwinStats()
      const key = `${stats.people}|${stats.lightsOn}|${stats.temperature}|${stats.weather}|${stats.radar}|${stats.ac}|${stats.screen}|${stats.curtain}`
      if (key !== lastStatsKey) {
        lastStatsKey = key
        statsListener(stats)
      }
    }
    api._onFrame?.(api)
  }

  /** @type {Record<string, THREE.Texture>} */
  let textures = {}

  const bootstrapRoom = async () => {
    const procedural = createTextures()
    let wallRefMap = null
    let floorRefMap = null
    let curtainRefMap = null
    try {
      ;[wallRefMap, floorRefMap, curtainRefMap] = await Promise.all([
        loadRefMap('/meeting-wall-mat.png', 3.4, 1.7),
        // 按屏幕观感控制颗粒密度（约 3×4 平铺），贴近实景照片里的细地毯，避免整面拉伸发糙
        loadRefMap('/meeting-floor-mat.jpg', 3.2, 4.1),
        loadRefMap('/meeting-curtain-mat.png', 2.8, 3.6),
      ])
    } catch {
      // 参考图加载失败时保留占位材质
    }
    if (disposed) {
      wallRefMap?.dispose()
      floorRefMap?.dispose()
      curtainRefMap?.dispose()
      Object.values(procedural).forEach((t) => t.dispose?.())
      return
    }
    textures = { ...procedural, wallRefMap, floorRefMap, curtainRefMap }
    const built = buildRoom(scene, textures)
    pendants = built.pendants
    cans = built.cans
    cassetteAc = built.cassetteAc
    curtains = built.curtains
    screen = built.screen
    person = makePerson({ coatColor: 0x1d4f9c, visible: false })
    scene.add(person)
    radar = makeCeilingRadar()
    scene.add(radar)
    roomReady = true
    applyLights(0)
    applyScreen(true)
    applyAc(false)
    setDemoPhase('wait')
    demoPhaseAt = performance.now()
  }
  bootstrapRoom()

  const onResize = () => resize()
  resize()
  window.addEventListener('resize', onResize)
  raf = requestAnimationFrame(loop)

  const api = {
    host,
    canvas,
    projectPin,
    getTwinStats,
    onStats(fn) {
      statsListener = typeof fn === 'function' ? fn : null
      if (statsListener) {
        lastStatsKey = ''
        statsEmitTick = 1
      }
    },
    isLightsOn: () => lightLevel >= 0.99,
    getLightLevel: () => lightLevel,
    isScreenOn: () => screenOn,
    isAcOn: () => acOn,
    isEnvOn: () => envOn,
    setLightsOn(on) {
      applyLights(on ? 1 : 0)
      return lightLevel >= 0.99
    },
    toggleLights() {
      applyLights(lightLevel >= 0.99 ? 0 : 1)
      return lightLevel >= 0.99
    },
    toggleScreen() {
      applyScreen(!screenOn)
      return screenOn
    },
    toggleAc() {
      applyAc(!acOn)
      return acOn
    },
    toggleEnv() {
      const next = !envOn
      envOn = next
      curtainTarget = next ? 0.98 : 0.04
      return envOn
    },
    playEnter() {
      demoActive = true
      startEnterCycle()
    },
    resetPerson() {
      demoActive = false
      if (person) person.visible = false
      peopleCount = 0
      applyPresence(false)
      setDemoPhase('wait')
    },
    setActive(active) {
      canvas.style.pointerEvents = active ? 'auto' : 'none'
      demoActive = !!active
      if (!active) {
        if (person) person.visible = false
        peopleCount = 0
        applyPresence(false)
        setDemoPhase('wait')
      } else if (roomReady && demoPhase === 'wait' && person && !person.visible) {
        startEnterCycle()
      }
    },
    dispose() {
      disposed = true
      statsListener = null
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      Object.values(textures).forEach((t) => t?.dispose?.())
      screen?.userData?.meeting?.texture?.dispose()
      env.dispose()
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
    恢复环境: 1,
    照明开启: 3,
    灯全亮: 3,
    灯全关: 3,
    空调舒适模式: '3b',
    停止送风: '3b',
    信息屏更新: '3c',
    信息屏关闭: '3c',
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
