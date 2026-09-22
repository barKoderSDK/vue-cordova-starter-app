<template>
  <div class="home-grid-scroll">
    <div class="home-grid-content">
      <section v-for="section in sections" :key="section.title" class="home-section">
        <h3 class="home-section-title">{{ section.title }}</h3>
        <div class="home-grid">
          <button
            v-for="item in section.data"
            :key="item.id"
            type="button"
            class="home-grid-item"
            @click="$emit('item-press', item)"
          >
            <img :src="item.icon" :alt="item.label" class="home-grid-icon" />
            <span class="home-grid-label">{{ item.label }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeGrid',
  props: {
    sections: { type: Array, required: true },
  },
  emits: ['item-press'],
};
</script>
