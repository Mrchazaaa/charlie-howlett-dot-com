<template>
  <div class="card mb-3">
    <div class="card-header">
      <button class="btn btn-link w-100 text-start p-0 border-0 bg-transparent collapsible-header" 
              @click="toggleCollapsed" 
              :class="{ collapsed: !isExpanded }">
        <strong>{{ title }}</strong>
        <span v-if="subtitle" class="subtitle text-muted">{{ subtitle }}</span>
        <span class="float-end">
          <i class="fas" :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </span>
      </button>
    </div>
    <div class="collapse-content" :class="{ 'show': isExpanded }">
      <div class="card-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapsibleCard',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    initiallyExpanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: this.initiallyExpanded
    }
  },
  methods: {
    toggleCollapsed() {
      this.isExpanded = !this.isExpanded
      this.$emit('toggle', this.isExpanded)
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}

.card-header {
  background-color: var(--primary, #007bff);
  color: white;
  border-bottom: none;
}

.collapsible-header {
  color: white !important;
  text-decoration: none !important;
  font-size: 1.1rem;
}

.collapsible-header:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.collapsible-header .text-muted {
  color: rgba(255, 255, 255, 0.7) !important;
}

.subtitle {
  margin-left: 1rem;
}

.collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.collapse-content.show {
  max-height: 2000px;
  transition: max-height 0.3s ease-in;
}
</style>