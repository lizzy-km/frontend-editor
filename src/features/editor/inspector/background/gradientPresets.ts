import type { Gradient, GradientStop } from './gradient'

const straight = (angle: number, ...stops: GradientStop[]): Gradient => ({ kind: 'linear', angle, shape: 'ellipse', center: '50% 50%', stops })
const round = (center: string, ...stops: GradientStop[]): Gradient => ({ kind: 'radial', angle: 0, shape: 'circle', center, stops })

/** Ready-made gradients, everyday names. The first two are for putting text over photos. */
export const GRADIENT_PRESETS: { name: string; gradient: Gradient }[] = [
  { name: 'Darken photo', gradient: straight(180, { color: 'rgba(0, 0, 0, 0.15)', at: 0 }, { color: 'rgba(0, 0, 0, 0.65)', at: 100 }) },
  { name: 'Fade to white', gradient: straight(180, { color: 'rgba(255, 255, 255, 0)', at: 0 }, { color: 'rgba(255, 255, 255, 1)', at: 100 }) },
  { name: 'Sunset', gradient: straight(135, { color: '#ff7e5f', at: 0 }, { color: '#feb47b', at: 100 }) },
  { name: 'Ocean', gradient: straight(135, { color: '#2193b0', at: 0 }, { color: '#6dd5ed', at: 100 }) },
  { name: 'Mint', gradient: straight(135, { color: '#43e97b', at: 0 }, { color: '#38f9d7', at: 100 }) },
  { name: 'Peach', gradient: straight(120, { color: '#f6d365', at: 0 }, { color: '#fda085', at: 100 }) },
  { name: 'Lavender', gradient: straight(135, { color: '#a18cd1', at: 0 }, { color: '#fbc2eb', at: 100 }) },
  { name: 'Night sky', gradient: straight(180, { color: '#0f2027', at: 0 }, { color: '#203a43', at: 50 }, { color: '#2c5364', at: 100 }) },
  { name: 'Rainbow', gradient: straight(90, { color: '#ff5f6d', at: 0 }, { color: '#ffc371', at: 35 }, { color: '#47cf73', at: 65 }, { color: '#4facfe', at: 100 }) },
  { name: 'Spotlight', gradient: round('50% 30%', { color: 'rgba(255, 255, 255, 0.9)', at: 0 }, { color: 'rgba(255, 255, 255, 0)', at: 60 }) },
]

/** A fresh gradient when someone starts from scratch: the page accent to a soft tint. */
export const STARTER_GRADIENT: Gradient = straight(135, { color: '#e8573a', at: 0 }, { color: '#f6c177', at: 100 })
