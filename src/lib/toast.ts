import AppSwal from './swal'

/** Pastki burchakdagi qisqa xabar ("Nusxalandi" va h.k.). */
export function showToast(title: string, icon: 'success' | 'error' | 'info' = 'success'): void {
  void AppSwal.fire({
    toast: true,
    position: 'bottom-end',
    icon,
    title,
    showCloseButton: false,
    showConfirmButton: false,
    timer: 1600,
  })
}
