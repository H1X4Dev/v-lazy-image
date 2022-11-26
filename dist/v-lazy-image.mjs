import { ref, reactive, computed, onMounted, onBeforeUnmount, h } from "vue";
var index = {
  props: {
    src: {
      type: String,
      required: true
    },
    srcPlaceholder: {
      type: String,
      default: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    },
    srcset: {
      type: String
    },
    intersectionOptions: {
      type: Object,
      default: () => ({})
    },
    usePicture: {
      type: Boolean,
      default: false
    }
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, emit }) {
    const root = ref(null);
    const state = reactive({
      observer: null,
      intersected: false,
      loaded: false
    });
    const srcImage = computed(
      () => state.intersected && props.src ? props.src : props.srcPlaceholder
    );
    const srcsetImage = computed(
      () => state.intersected && props.srcset ? props.srcset : false
    );
    const load = () => {
      if (root.value && root.value.getAttribute("src") !== props.srcPlaceholder) {
        state.loaded = true;
        emit("load", root.value);
      }
    };
    const error = () => emit("error", root.value);
    onMounted(() => {
      if ("IntersectionObserver" in window) {
        state.observer = new IntersectionObserver((entries) => {
          const image = entries[0];
          if (image.isIntersecting) {
            state.intersected = true;
            state.observer.disconnect();
            emit("intersect");
          }
        }, props.intersectionOptions);
        state.observer.observe(root.value);
      }
    });
    onBeforeUnmount(() => {
      if ("IntersectionObserver" in window && state.observer) {
        state.observer.disconnect();
      }
    });
    return () => {
      const img = h("img", {
        ref: root,
        src: srcImage.value,
        srcset: srcsetImage.value || null,
        ...attrs,
        class: [
          attrs.class,
          "v-lazy-image",
          { "v-lazy-image-loaded": state.loaded }
        ],
        onLoad: load,
        onError: error
      });
      return props.usePicture ? h(
        "picture",
        { ref: root, onLoad: load },
        state.intersected ? [slots.default, img] : [img]
      ) : img;
    };
  }
};
export { index as default };
