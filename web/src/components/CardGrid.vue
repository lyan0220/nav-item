<template>
  <div class="container card-grid animate-convergeIn" :key="animationKey">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="link-item"
      :style="getCardStyle(index)"
    >
      <a
        :href="card.url"
        target="_blank"
        :title="getTooltip(card)"
        @click.prevent="handleClick(card.url)"
      >
        <img
          class="link-icon"
          :src="getLogo(card)"
          alt=""
          @error="onImgError($event, card)"
          loading="lazy"
        >
        <span class="link-text">{{ truncate(card.title) }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  }
});

const animationKey = ref(0);

watch(
  () => props.cards,
  (newCards, oldCards) => {
    if (!newCards) return;
    const oldLen = oldCards ? oldCards.length : 0;
    const newLen = newCards.length;
    if (newLen === 0) return;
    if (!oldCards || oldLen === 0 || JSON.stringify(newCards) !== JSON.stringify(oldCards)) {
      animationKey.value += 1;
    }
  },
  { deep: true }
);

function getCardStyle(index) {
  if (!props.cards || !props.cards.length) return {};

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const cols = isMobile ? 3 : (width <= 768 ? 3 : (width <= 1200 ? 4 : 6));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const centerCol = Math.floor(cols / 2);
  const centerRow = Math.floor(props.cards.length / cols / 2);

  const distanceToCenterCol = Math.abs(col - centerCol);
  const distanceToCenterRow = Math.abs(row - centerRow);

  const delay = distanceToCenterCol * 0.08 + distanceToCenterRow * 0.05;

  return {
    animationDelay: `${delay}s`
  };
}

function handleClick(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

function getLogo(card) {
  if (card.custom_logo_path) return '/uploads/' + card.custom_logo_path;
  if (card.logo_url) return card.logo_url;
  try {
    const url = new URL(card.url);
    return url.origin + '/favicon.ico';
  } catch {
    return '/icon.png';
  }
}

function onImgError(e, card) {
  if (e.target.dataset.fallbackApplied) {
    e.target.style.display = 'none';
    return;
  }
  e.target.dataset.fallbackApplied = '1';
  e.target.src = '/icon.png';
}

function getTooltip(card) {
  let tip = '';
  if (card.desc) tip += card.desc + '\n';
  tip += card.url;
  return tip;
}

function truncate(str) {
  if (!str) return '';
  return str.length > 20 ? str.slice(0, 20) + '...' : str;
}
</script>

<style scoped>
.container {
  max-width: 55rem;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  opacity: 1;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
}

@media (max-width: 1200px) {
  .container {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 480px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

.link-item {
  background-color: rgba(var(--glass-color-rgb, 255, 255, 255), var(--glass-opacity, 0.6));
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-height: 85px;
  height: 85px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  opacity: 0;
  transform: translate(0, 0);
  transform: translateZ(0);
  backface-visibility: hidden;
}

@media (max-width: 480px) {
  .link-item {
    min-height: 75px;
    height: 75px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .link-item:hover {
    background-color: rgba(var(--glass-color-rgb, 255, 255, 255), var(--glass-opacity-hover, 0.75));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.link-item a {
  text-decoration: none;
  color: #000;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.link-icon {
  width: 25px;
  height: 25px;
  margin: 4px auto;
  object-fit: contain;
}

@media (max-width: 480px) {
  .link-icon {
    width: 22px;
    height: 22px;
  }
}

.link-text {
  padding-right: 4px;
  padding-left: 4px;
  font-size: 14px;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1;
  min-height: 1.5em;
}

@media (max-width: 480px) {
  .link-text {
    font-size: 13px;
  }
}

.animate-convergeIn .link-item {
  animation: convergeIn 0.5s ease-out forwards;
  transform: translateZ(0);
}

@keyframes convergeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-convergeIn .link-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
