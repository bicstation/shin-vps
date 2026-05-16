// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/constants/animation.ts

/* =========================================
🔥 Fade In
========================================= */

export const FADE_IN = {

  initial: {

    opacity: 0,

    transform:
      'translateY(24px)',
  },

  animate: {

    opacity: 1,

    transform:
      'translateY(0px)',
  },

  transition: {

    duration: 0.5,

    ease:
      'ease-out',
  },
}

/* =========================================
🔥 Fade In Large
========================================= */

export const FADE_IN_LARGE = {

  initial: {

    opacity: 0,

    transform:
      'translateY(48px)',
  },

  animate: {

    opacity: 1,

    transform:
      'translateY(0px)',
  },

  transition: {

    duration: 0.7,

    ease:
      'ease-out',
  },
}

/* =========================================
🔥 Scale In
========================================= */

export const SCALE_IN = {

  initial: {

    opacity: 0,

    transform:
      'scale(0.96)',
  },

  animate: {

    opacity: 1,

    transform:
      'scale(1)',
  },

  transition: {

    duration: 0.4,

    ease:
      'ease-out',
  },
}

/* =========================================
🔥 Stagger Container
========================================= */

export const STAGGER_CONTAINER = {

  animate: {

    transition: {

      staggerChildren: 0.08,
    },
  },
}

/* =========================================
🔥 Hover Lift
========================================= */

export const HOVER_LIFT = {

  transition:
    'transform 0.2s ease, box-shadow 0.2s ease',

  hover: {

    transform:
      'translateY(-4px)',
  },
}

/* =========================================
🔥 Glow Pulse
========================================= */

export const GLOW_PULSE = {

  animation:
    'semanticGlowPulse 4s ease-in-out infinite',
}

/* =========================================
🔥 Spin Slow
========================================= */

export const SPIN_SLOW = {

  animation:
    'semanticSpinSlow 18s linear infinite',
}

/* =========================================
🔥 Keyframes
========================================= */

export const ANIMATION_KEYFRAMES = `
@keyframes semanticGlowPulse {

  0% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.04);
  }

  100% {
    opacity: 0.4;
    transform: scale(1);
  }

}

@keyframes semanticSpinSlow {

  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }

}
