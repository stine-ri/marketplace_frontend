import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => toast.success(message, {
    duration: 4000,
    position: 'top-right',
    icon: '✅',
  }),
  error: (message: string) => toast.error(message, {
    duration: 6000,
    position: 'top-right',
    icon: '❌',
  }),
  info: (message: string) => toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
  }),
  warning: (message: string) => toast(message, {
    duration: 5000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#ffedd5',
      color: '#9a3412',
    },
  }),
};