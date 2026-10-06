import Swal from 'sweetalert2'

const closeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'

/**
 * SweetAlert2 with the app's dialog defaults (✕ button, cancel on the left, Uzbek labels) — the same mixin as hr-ui,
 * so alerts look like the app's own modals. Layout and colors live in global.css (`.swal2-modal`, `.swal2-toast`).
 */
const AppSwal = Swal.mixin({
  showCloseButton: true,
  closeButtonHtml: closeIcon,
  closeButtonAriaLabel: 'Yopish',
  reverseButtons: true,
  confirmButtonText: 'OK',
  cancelButtonText: 'Bekor qilish',
})

export default AppSwal
