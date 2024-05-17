import type { ComponentProps, ParentProps } from 'solid-js'
import { Motion } from 'solid-motionone'

type MotionProps = ComponentProps<(typeof Motion)['div']>

export function Slide({ children, ...motionProps }: ParentProps<MotionProps>) {
  return <Motion {...motionProps}>{children}</Motion>
}

export default Slide
