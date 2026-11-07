<script setup>
import { DialogRoot, useForwardPropsEmits } from 'reka-ui';

const props = defineProps();
const emits = defineEmits(['update:open'])

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
    <DialogRoot v-bind="forwarded" data-slot="sheet">
        <slot/>
    </DialogRoot>
</template>
