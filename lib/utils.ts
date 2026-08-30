import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 合并组件收到的 CSS 类名，并自动解决 Tailwind 中互相冲突的样式。
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
