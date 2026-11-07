<script setup>
import { DialogContent, DialogOverlay, DialogPortal, DialogClose, useForwardPropsEmits } from 'reka-ui'
import { Icon } from '@iconify/vue';

defineOptions({
    inheritAttrs: false
})

const props = defineProps({
    side: { type: String, default: 'left' },
    showCloseButton: { type: Boolean, default: true },
})

const emits = defineEmits(['escapeKeyDown', 'pointerDownOutside', 'focusFirst', 'closeAutoFocus'])
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
    <DialogPortal data-slot="sheet-portal">
        <DialogOverlay data-slot="sheet-overlay" :class="sheet - overlay" />

        <DialogContent v-bind="forwarded" data-slot="sheet-content" :data-side="side"
            :class="['sheet-content', $attrs.class]">
            <slot />

            <DialogClose v-if="showCloseButton" data-slot="sheet-close" class="sheet-close-btn">
                <Icon icon="lucide:x" class="sheet-close-icon" />
                <span class="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
    </DialogPortal>
</template>


<style scoped>
.sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    /* Робимо затемнення фону трохи густішим для атмосфери гри */
    background-color: rgba(0, 0, 0, 0.4);
    transition: opacity 200ms ease;
}

.sheet-overlay[data-state="closed"] {
    opacity: 0;
}

.sheet-overlay[data-state="open"] {
    opacity: 1;
}

.sheet-content {
    position: fixed;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* Змінюємо дефолтний білий колір на глибокий темний, як на скріншоті */
    background-color: #0b0c10;
    font-size: 0.875rem;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease;
}

.sheet-content[data-state="closed"] {
    opacity: 0;
}

.sheet-content[data-state="open"] {
    opacity: 1;
}

.sheet-content[data-side="top"] {
    top: 0;
    left: 0;
    right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sheet-content[data-side="top"][data-state="closed"] {
    transform: translateY(-100%);
}

.sheet-content[data-side="bottom"] {
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.sheet-content[data-side="bottom"][data-state="closed"] {
    transform: translateY(100%);
}

/* Налаштування для лівої панелі (Ukraine GTA) */
.sheet-content[data-side="left"] {
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    /* Фіксуємо ширину меню */
    height: 100%;
    /* Тонка напівпрозора рамка замість яскравої білої */
    border-right: 1px solid rgba(255, 255, 255, 0.05);
}

/* Плавний виїзд повністю з-за екрану */
.sheet-content[data-side="left"][data-state="closed"] {
    transform: translateX(-100%);
}

.sheet-content[data-side="right"] {
    top: 0;
    bottom: 0;
    right: 0;
    width: 280px;
    height: 100%;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.sheet-content[data-side="right"][data-state="closed"] {
    transform: translateX(100%);
}

/* Кнопка закриття (хрестик) */
.sheet-close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    color: #ffffff;
    /* Робимо хрестик білим */
    transition: opacity 150ms, transform 150ms;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.sheet-close-btn:hover {
    opacity: 1;
    transform: scale(1.05);
}

.sheet-close-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: rect(0, 0, 0, 0);
    border: 0;
}
</style>