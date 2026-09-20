// Main client-side script for HostelHub

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-dismiss alert banners after 6 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) {
        bsAlert.close();
      }
    }, 6000);
  });

  // 2. Generic confirmation dialog on forms with data-confirm
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const message = form.getAttribute('data-confirm') || 'Are you sure you want to proceed?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // 3. Dynamic block-to-room filter on request forms if present
  const blockSelect = document.getElementById('blockSelect');
  const roomSelect = document.getElementById('roomSelect');

  if (blockSelect && roomSelect) {
    blockSelect.addEventListener('change', () => {
      const selectedBlockId = blockSelect.value;
      const options = roomSelect.querySelectorAll('option[data-block]');

      let visibleCount = 0;
      options.forEach((opt) => {
        if (!selectedBlockId || opt.getAttribute('data-block') === selectedBlockId) {
          opt.style.display = '';
          visibleCount++;
        } else {
          opt.style.display = 'none';
        }
      });

      // Reset selection if current selection is now hidden
      const currentSelected = roomSelect.options[roomSelect.selectedIndex];
      if (currentSelected && currentSelected.style.display === 'none') {
        roomSelect.value = '';
      }
    });
  }
});
