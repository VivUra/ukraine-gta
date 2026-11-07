<script setup>
import { DialogDescription } from 'reka-ui'
const props = defineProps()
</script>
<template>
    <DialogDescription v-bind="props" class="sheet-description" data-slot="sheet-description">
        <slot />
    </DialogDescription>
</template>
<style scoped>
.sheet-description {
    font-size: 0.875rem;
    color: var(--muted-foreground, #71717a);
    margin: 0;
}
</style>