// composables/useCustomToast.js
import { h, render } from 'vue';
import CustomToast from '@/components/Toast.vue';

export function useCustomToast() {
  const show = (type, message) => {
    const toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);

    const vnode = h(CustomToast, { type, message });
    render(vnode, toastContainer);

    // Clean up after 3.5s
    setTimeout(() => {
      render(null, toastContainer);
      document.body.removeChild(toastContainer);
    }, 3500);
  };

  return {
    success: (msg) => show('success', msg),
    error: (msg) => show('error', msg),
    info: (msg) => show('info', msg),
    warn: (msg) => show('warn', msg),
  };
}
