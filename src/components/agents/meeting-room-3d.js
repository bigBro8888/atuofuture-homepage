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
  '3b': new THREE.Vector3(3.1, 1.55, 0.2),
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
  // 深胡桃木桌面：更高端会议桌纹理
  const woodMap = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#5c3a24'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 48; i += 1) {
      const x = (i / 48) * size + Math.sin(i * 1.7) * 5
      const grad = ctx.createLinearGradient(x - 10, 0, x + 10, 0)
      grad.addColorStop(0, 'rgba(28, 16, 8, 0)')
      grad.addColorStop(0.5, `rgba(20, 11, 5, ${0.12 + (i % 5) * 0.04})`)
      grad.addColorStop(1, 'rgba(28, 16, 8, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(x - 12, 0, 24, size)
    }
    for (let y = 0; y < size; y += 2) {
      ctx.strokeStyle = `rgba(180, 140, 95, ${0.02 + (y % 9) * 0.008})`
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y * 0.035) * 2)
      ctx.bezierCurveTo(size * 0.3, y + 3, size * 0.7, y - 2, size, y + Math.cos(y * 0.028) * 2)
      ctx.stroke()
    }
    // 轻抛光高光带
    const sheen = ctx.createLinearGradient(0, 0, size, 0)
    sheen.addColorStop(0, 'rgba(255,220,180,0)')
    sheen.addColorStop(0.45, 'rgba(255,220,180,0.06)')
    sheen.addColorStop(1, 'rgba(255,220,180,0)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.05)
  })
  woodMap.repeat.set(1.6, 2.8)

  const woodRough = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#9a9a9a'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`
      ctx.fillRect(Math.random() * size, 0, 2 + Math.random() * 4, size)
    }
    noise(ctx, size, 0.12)
  }, 256)
  woodRough.repeat.copy(woodMap.repeat)

  // 灰色商务地毯：细密绒面 + 轻微颗粒，替代木地板
  const floorWood = makeCanvasTexture((ctx, size) => {
    const base = ctx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#8d939c')
    base.addColorStop(0.45, '#7a808a')
    base.addColorStop(1, '#6e7480')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    for (let y = 0; y < size; y += 3) {
      for (let x = 0; x < size; x += 3) {
        const shade = ((x * 17 + y * 31) % 9) / 9
        ctx.fillStyle = `rgba(${shade > 0.55 ? 255 : 20},${shade > 0.55 ? 255 : 22},${shade > 0.55 ? 255 : 28},${0.035 + shade * 0.07})`
        ctx.fillRect(x, y, 2, 2)
      }
    }
    for (let i = 0; i < 1800; i += 1) {
      const x = Math.random() * size
      const y = Math.random() * size
      ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.04})`
      ctx.fillRect(x, y, 1 + Math.random() * 1.5, 1)
    }
    // 地毯拼缝弱网格
    ctx.strokeStyle = 'rgba(40, 44, 52, 0.12)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i += 1) {
      const p = (i / 4) * size
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, p)
      ctx.lineTo(size, p)
      ctx.stroke()
    }
    noise(ctx, size, 0.05)
  }, 1024)
  floorWood.repeat.set(4.5, 5.5)

  const floorWoodRough = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#b4b4b4'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 2200; i += 1) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${0.04 + Math.random() * 0.1})`
      ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    noise(ctx, size, 0.14)
  }, 512)
  floorWoodRough.repeat.copy(floorWood.repeat)

  const plaster = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = '#f3f5f8'
    ctx.fillRect(0, 0, size, size)
    noise(ctx, size, 0.05)
  }, 256)
  plaster.repeat.set(2, 1.2)

  // 深炭皮面：商务行政椅质感
  const fabric = makeCanvasTexture((ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, size, size)
    g.addColorStop(0, '#2a3038')
    g.addColorStop(0.5, '#1c2128')
    g.addColorStop(1, '#252b33')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        if ((x + y) % 4 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.035)'
          ctx.fillRect(x, y, 1, 1)
        } else if ((x * y) % 11 === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.12)'
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
    noise(ctx, size, 0.07)
  }, 256)
  fabric.repeat.set(2, 2)

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

  return { woodMap, woodRough, floorWood, floorWoodRough, plaster, fabric, metal, foliage, sky }
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
  // 行政会议椅：高靠背 + 扶手 + 五星抛光底座
  const g = new THREE.Group()
  const seat = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.09, 0.54, 4, 0.045), fabricMat))
  seat.position.y = 0.48
  g.add(seat)
  const cushion = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.05, 0.46, 3, 0.03), fabricMat), true, false)
  cushion.position.y = 0.54
  g.add(cushion)
  const back = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.72, 0.09, 4, 0.04), fabricMat))
  back.position.set(0, 0.92, -0.23)
  g.add(back)
  const lumbar = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.16, 0.06, 3, 0.03), fabricMat), true, false)
  lumbar.position.set(0, 0.7, -0.17)
  g.add(lumbar)
  ;[-1, 1].forEach((side) => {
    const arm = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.05, 0.38, 2, 0.02), metalMat), true, false)
    arm.position.set(side * 0.3, 0.68, -0.02)
    g.add(arm)
    const post = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10), metalMat), true, false)
    post.position.set(side * 0.3, 0.57, 0.12)
    g.add(post)
  })
  const column = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.38, 16), metalMat), true, false)
  column.position.y = 0.24
  g.add(column)
  const hub = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20), metalMat), true, false)
  hub.position.y = 0.06
  g.add(hub)
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2
    const spoke = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.32, 4, 8), metalMat), true, false)
    spoke.position.set(Math.cos(a) * 0.18, 0.05, Math.sin(a) * 0.18)
    spoke.rotation.z = Math.PI / 2
    spoke.rotation.y = -a
    g.add(spoke)
    const caster = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), metalMat), true, false)
    caster.position.set(Math.cos(a) * 0.34, 0.035, Math.sin(a) * 0.34)
    g.add(caster)
  }
  return g
}

/** 低面数商务人模：鞋底贴地，腿/脚层级联动，避免胶囊人悬空 */
function makePerson({ coatColor = 0x1d4f9c, visible = false } = {}) {
  const root = new THREE.Group()
  root.visible = visible

  const skin = mat(0xe9c4a6, { roughness: 0.58, envMapIntensity: 0.4 })
  const coat = mat(coatColor, { roughness: 0.46, envMapIntensity: 0.75 })
  const pants = mat(0x2a3347, { roughness: 0.68, envMapIntensity: 0.35 })
  const hair = mat(0x1a2030, { roughness: 0.82 })
  const shoeMat = mat(0x12161f, { roughness: 0.38, metalness: 0.12 })
  const shirt = mat(0xf4f6f8, { roughness: 0.72, envMapIntensity: 0.3 })

  const hips = new THREE.Group()
  // 髋高对齐：大腿+小腿+鞋底后，鞋底落在 y≈0
  hips.position.y = 0.85
  root.add(hips)

  const pelvis = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.18, 0.22, 2, 0.04), pants), true, false)
  hips.add(pelvis)

  const spine = new THREE.Group()
  spine.position.y = 0.1
  hips.add(spine)

  const torso = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.5, 0.26, 2, 0.05), coat))
  torso.position.y = 0.28
  spine.add(torso)

  const collar = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.08, 0.16, 1, 0.02), shirt), true, false)
  collar.position.set(0, 0.52, 0.04)
  spine.add(collar)

  const shoulder = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.12, 0.24, 2, 0.04), coat), true, false)
  shoulder.position.y = 0.5
  spine.add(shoulder)

  const neck = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10), skin), true, false)
  neck.position.y = 0.6
  spine.add(neck)

  const head = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 14), skin), true, false)
  head.position.y = 0.74
  spine.add(head)

  const hairMesh = addShadow(
    new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hair),
    true,
    false
  )
  hairMesh.position.set(0, 0.78, -0.01)
  spine.add(hairMesh)

  const makeArm = (side) => {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.28, 0.48, 0)
    spine.add(pivot)

    const upper = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.26, 4, 8), coat), true, false)
    upper.position.y = -0.16
    pivot.add(upper)

    const elbow = new THREE.Group()
    elbow.position.y = -0.32
    pivot.add(elbow)

    const lower = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.22, 4, 8), coat), true, false)
    lower.position.y = -0.14
    elbow.add(lower)

    const hand = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.08, 0.05, 1, 0.01), skin), true, false)
    hand.position.y = -0.3
    elbow.add(hand)

    pivot.rotation.z = side * 0.08
    return { pivot, elbow }
  }

  const armL = makeArm(-1)
  const armR = makeArm(1)

  const makeLeg = (side) => {
    const hip = new THREE.Group()
    hip.position.set(side * 0.1, -0.02, 0)
    hips.add(hip)

    const thigh = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.34, 4, 8), pants), true, false)
    thigh.position.y = -0.2
    hip.add(thigh)

    const knee = new THREE.Group()
    knee.position.y = -0.42
    hip.add(knee)

    const shin = addShadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.32, 4, 8), pants), true, false)
    shin.position.y = -0.19
    knee.add(shin)

    const ankle = new THREE.Group()
    ankle.position.y = -0.4
    knee.add(ankle)

    const shoe = addShadow(new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.07, 0.26, 1, 0.02), shoeMat), true, false)
    shoe.position.set(0, 0.035, 0.05)
    ankle.add(shoe)

    return { hip, knee, ankle, shoe }
  }

  const legL = makeLeg(-1)
  const legR = makeLeg(1)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.008
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
  /** @type {THREE.Points[]} */
  const airflow = []
  /** @type {THREE.Mesh[]} */
  const curtains = []

  const floor = addShadow(
    new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.w, ROOM.d),
      mat(0xffffff, {
        map: tex.floorWood,
        roughnessMap: tex.floorWoodRough,
        roughness: 0.92,
        metalness: 0,
        envMapIntensity: 0.22,
      })
    ),
    false,
    true
  )
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

  const back = addShadow(
    new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.w, ROOM.h),
      mat(0xffffff, { map: tex.plaster, roughness: 0.88, envMapIntensity: 0.3 })
    ),
    false,
    true
  )
  back.position.set(0, ROOM.h / 2, -ROOM.d / 2)
  scene.add(back)

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xeaf4ff,
    transmission: 0.92,
    transparent: true,
    opacity: 1,
    roughness: 0.04,
    metalness: 0,
    thickness: 0.35,
    ior: 1.45,
    envMapIntensity: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  })
  const frameMat = mat(0x1a1a1a, { metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2 })

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

  // 左右窗纱帘：默认收起，关闭 50% 时展开覆盖半窗
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef6,
    roughness: 0.88,
    metalness: 0,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
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

  const duct = addShadow(
    new THREE.Mesh(
      new RoundedBoxGeometry(1.15, 0.45, ROOM.d * 0.78, 2, 0.04),
      mat(0xffffff, { map: tex.metal, metalness: 0.72, roughness: 0.32, envMapIntensity: 1.35 })
    ),
    true,
    false
  )
  duct.position.set(0.15, ROOM.h - 0.35, -0.4)
  scene.add(duct)
  for (let i = -3; i <= 3; i += 1) {
    const pipe = addShadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, ROOM.d * 0.7, 16),
        mat(0xffffff, { map: tex.metal, metalness: 0.78, roughness: 0.28, envMapIntensity: 1.4 })
      ),
      true,
      false
    )
    pipe.rotation.x = Math.PI / 2
    pipe.position.set(-1.4 + i * 0.08, ROOM.h - 0.18, -0.2)
    scene.add(pipe)
  }
  const diffuserZs = [-3.2, -0.6, 2.2]
  for (const z of diffuserZs) {
    const diffuser = addShadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.06, 32),
        mat(0xeef1f4, { roughness: 0.45, metalness: 0.25, envMapIntensity: 0.9 })
      ),
      false,
      true
    )
    diffuser.position.set(-2.2, ROOM.h - 0.05, z)
    scene.add(diffuser)

    const count = 90
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 0.45
      positions[i * 3 + 1] = -Math.random() * 1.8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.45
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xd9eefc,
        size: 0.045,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        sizeAttenuation: true,
      })
    )
    points.position.set(-2.2, ROOM.h - 0.12, z)
    points.visible = false
    scene.add(points)
    airflow.push(points)
  }

  const woodMat = mat(0xffffff, {
    map: tex.woodMap,
    roughnessMap: tex.woodRough,
    roughness: 0.28,
    metalness: 0.08,
    envMapIntensity: 0.85,
  })
  // 厚实圆角会议桌 + 抛光金属双柱底座
  const tableTop = addShadow(new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.12, 3.75, 4, 0.05), woodMat))
  tableTop.position.set(0, 0.78, -0.35)
  scene.add(tableTop)
  const tableEdge = addShadow(
    new THREE.Mesh(new RoundedBoxGeometry(1.58, 0.03, 3.78, 3, 0.02), mat(0x2a1a10, { roughness: 0.35, metalness: 0.15 })),
    true,
    false
  )
  tableEdge.position.set(0, 0.71, -0.35)
  scene.add(tableEdge)
  const chrome = mat(0xc5ced8, { metalness: 0.92, roughness: 0.18, envMapIntensity: 1.35 })
  ;[-1.15, 1.15].forEach((z) => {
    const pedestal = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.62, 24), chrome), true, false)
    pedestal.position.set(0, 0.34, z - 0.35)
    scene.add(pedestal)
    const foot = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.05, 28), chrome), true, false)
    foot.position.set(0, 0.04, z - 0.35)
    scene.add(foot)
  })

  const fabricMat = mat(0xffffff, {
    map: tex.fabric,
    roughness: 0.62,
    metalness: 0.04,
    envMapIntensity: 0.4,
  })
  const chairMetal = mat(0xb8c2cc, { metalness: 0.88, roughness: 0.22, envMapIntensity: 1.25 })
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

  const sideboard = addShadow(new THREE.Mesh(new RoundedBoxGeometry(2.8, 0.55, 0.42, 2, 0.03), woodMat))
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

  ;[-1.1, 1.1].forEach((z) => {
    const cord = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 8), mat(0x111111)), false, false)
    cord.position.set(0, ROOM.h - 0.55, z - 0.35)
    scene.add(cord)
    const shade = addShadow(
      new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.34, 32, 1, true),
        mat(0x151515, { side: THREE.DoubleSide, roughness: 0.45, metalness: 0.35, envMapIntensity: 0.9 })
      ),
      true,
      false
    )
    shade.position.set(0, ROOM.h - 1.05, z - 0.35)
    shade.rotation.x = Math.PI
    scene.add(shade)
    const bulb = new THREE.PointLight(0xffe2bd, 0, 8.5, 2)
    bulb.position.set(0, ROOM.h - 1.15, z - 0.35)
    scene.add(bulb)
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe6c8, transparent: true, opacity: 0 })
    )
    glow.position.copy(bulb.position)
    scene.add(glow)
    pendants.push({ light: bulb, glow, on: 2.4 })
  })

  for (let i = 0; i < 8; i += 1) {
    const x = -2.8 + (i % 4) * 1.8
    const z = -3.5 + Math.floor(i / 4) * 4.2
    const can = addShadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.14, 16),
        mat(0x1a1a1a, { metalness: 0.55, roughness: 0.35, envMapIntensity: 1.1 })
      ),
      true,
      false
    )
    can.position.set(x, ROOM.h - 0.08, z)
    scene.add(can)
    const spot = new THREE.SpotLight(0xfff0dd, 0, 12, Math.PI / 5, 0.45, 1.4)
    spot.position.set(x, ROOM.h - 0.12, z)
    spot.target.position.set(x, 0, z)
    scene.add(spot)
    scene.add(spot.target)
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.05, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe8c4, transparent: true, opacity: 0 })
    )
    glow.rotation.x = Math.PI / 2
    glow.position.set(x, ROOM.h - 0.16, z)
    scene.add(glow)
    cans.push({ light: spot, glow, on: 1.8 })
  }

  return { pendants, cans, airflow, curtains, screen }
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
  renderer.toneMappingExposure = 1.12

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd5e3f0)
  scene.fog = new THREE.Fog(0xd5e3f0, 16, 32)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  pmrem.dispose()

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

  const ambient = new THREE.AmbientLight(0xf4f7fb, 0.28)
  scene.add(ambient)
  const hemi = new THREE.HemisphereLight(0xeaf3ff, 0xb8b0a2, 0.7)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.45)
  sun.position.set(-6.5, 7.5, 2.5)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 24
  sun.shadow.camera.left = -8
  sun.shadow.camera.right = 8
  sun.shadow.camera.top = 8
  sun.shadow.camera.bottom = -8
  sun.shadow.bias = -0.00012
  sun.shadow.normalBias = 0.02
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xd7e8ff, 0.55)
  fill.position.set(4, 3, 3)
  scene.add(fill)
  const bounce = new THREE.DirectionalLight(0xffe8d2, 0.25)
  bounce.position.set(0.5, 1.2, 4)
  scene.add(bounce)

  const textures = createTextures()
  const { pendants, cans, airflow, curtains, screen } = buildRoom(scene, textures)
  const person = makePerson({ coatColor: 0x1d4f9c, visible: false })
  scene.add(person)

  const radar = makeCeilingRadar()
  scene.add(radar)

  const clock = new THREE.Clock()
  let raf = 0
  let disposed = false
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
    pendants.forEach((item) => {
      item.light.intensity = item.on * lamp
      item.glow.material.opacity = lamp > 0.05 ? Math.min(1, lamp) : 0
    })
    cans.forEach((item) => {
      item.light.intensity = item.on * lamp
      item.glow.material.opacity = lamp > 0.05 ? 0.95 * lamp : 0
    })
    ambient.intensity = 0.12 + 0.3 * lamp
    hemi.intensity = 0.28 + 0.2 * lamp
    sun.intensity = 0.55 + 0.5 * lamp
    fill.intensity = 0.12 + 0.28 * lamp
    bounce.intensity = 0.06 + 0.49 * lamp
    renderer.toneMappingExposure = 0.78 + 0.54 * lamp
  }
  applyLights(0)

  const applyScreen = (on) => {
    screenOn = on
    screen.material = on ? screen.userData.onMat : screen.userData.offMat
    screen.userData.meeting.texture.needsUpdate = true
  }
  applyScreen(true)

  const applyAc = (on) => {
    acOn = on
    airflow.forEach((points) => {
      points.visible = on
      points.material.opacity = on ? 0.55 : 0
    })
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

  const tickAirflow = (dt) => {
    if (!acOn) return
    airflow.forEach((points) => {
      const pos = points.geometry.attributes.position
      for (let i = 0; i < pos.count; i += 1) {
        let y = pos.getY(i) - dt * (1.2 + (i % 5) * 0.15)
        let x = pos.getX(i) + Math.sin(clock.elapsedTime * 4 + i) * dt * 0.08
        if (y < -2.1) {
          y = -0.02 - Math.random() * 0.1
          x = (Math.random() - 0.5) * 0.45
          pos.setZ(i, (Math.random() - 0.5) * 0.45)
        }
        pos.setY(i, y)
        pos.setX(i, x)
      }
      pos.needsUpdate = true
    })
  }

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
    const now = performance.now()
    const dt = Math.min(0.05, clock.getDelta())
    tickDemo(now)
    tickRadar(now)
    tickAirflow(dt)
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
      person.visible = false
      peopleCount = 0
      applyPresence(false)
      setDemoPhase('wait')
    },
    setActive(active) {
      canvas.style.pointerEvents = active ? 'auto' : 'none'
      demoActive = !!active
      if (!active) {
        person.visible = false
        peopleCount = 0
        applyPresence(false)
        setDemoPhase('wait')
      } else if (demoPhase === 'wait' && !person.visible) {
        startEnterCycle()
      }
    },
    dispose() {
      disposed = true
      statsListener = null
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      Object.values(textures).forEach((t) => t.dispose())
      screen.userData.meeting?.texture.dispose()
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
