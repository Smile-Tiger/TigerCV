<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & Record<string, any>

// 粒子配置 - 从 particlesjs-config.json 导入
const particlesConfig = {
  particles: {
    number: {
      value: 95,
      density: {
        enable: false,
        value_area: 800
      }
    },
    color: {
      value: '#3b82f6'
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#000000'
      },
      polygon: {
        nb_sides: 5
      },
      image: {
        src: 'img/github.svg',
        width: 100,
        height: 100
      }
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#60a5fa',
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: 'window',
    events: {
      onhover: {
        enable: true,
        mode: 'grab'
      },
      onclick: {
        enable: false,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 200,
        line_linked: {
          opacity: 1
        }
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      },
      remove: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
}

onMounted(() => {
  // 动态加载 particles.min.js
  const script = document.createElement('script')
  script.src = '/src/assets/background/particles.min.js'
  script.onload = () => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', particlesConfig)
    }
  }
  document.head.appendChild(script)
})

onUnmounted(() => {
  // 清理 particles.js
  if (typeof window !== 'undefined' && window.pJSDom) {
    window.pJSDom.forEach((instance) => {
      if (instance && instance.pJS && instance.pJS.fn && instance.pJS.fn.vendors) {
        instance.pJS.fn.vendors.destroypJS()
      }
    })
    window.pJSDom = []
  }

  // 移除 script 标签
  const scripts = document.querySelectorAll('script[src*="particles.min.js"]')
  scripts.forEach(s => s.remove())
})
</script>

<template>
  <div id="particles-js" class="particles-background"></div>
</template>

<style scoped lang="scss">
.particles-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  background: #fff
}

:deep(.particles-js-canvas-el) {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
