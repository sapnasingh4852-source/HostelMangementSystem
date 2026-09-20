// Utility helper functions for EJS views and formatting

const formatDate = (date, format = 'medium') => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  if (format === 'short') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  if (format === 'input') {
    return d.toISOString().split('T')[0];
  }
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const statusBadge = (status) => {
  if (!status) return 'bg-secondary';
  const s = status.toLowerCase();
  switch (s) {
    case 'approved':
    case 'active':
    case 'resolved':
    case 'available':
    case 'paid':
    case 'published':
      return 'bg-success';
    case 'pending':
    case 'in progress':
    case 'draft':
      return 'bg-warning text-dark';
    case 'rejected':
    case 'full':
    case 'unpaid':
    case 'inactive':
      return 'bg-danger';
    case 'under maintenance':
    case 'maintenance':
      return 'bg-info text-dark';
    case 'vacated':
    case 'cancelled':
    case 'archived':
    case 'waived':
    default:
      return 'bg-secondary';
  }
};

const priorityBadge = (priority) => {
  if (!priority) return 'bg-secondary';
  switch (priority.toLowerCase()) {
    case 'emergency':
      return 'bg-danger';
    case 'high':
      return 'bg-warning text-dark';
    case 'medium':
      return 'bg-primary';
    case 'low':
    default:
      return 'bg-secondary';
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const monthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

const calculateOccupancyPercentage = (occupied, total) => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((occupied / total) * 100));
};

module.exports = {
  formatDate,
  formatTime,
  statusBadge,
  priorityBadge,
  formatCurrency,
  monthName,
  calculateOccupancyPercentage,
};
