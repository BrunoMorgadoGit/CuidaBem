import type { BottomNavItem } from '../models';

export const BOTTOM_NAV_ITEMS: readonly BottomNavItem[] = [
  {
    id: 'nav-home',
    label: 'Inicio',
    icon: 'IN',
    link: '/tabs/home',
    color: '#3448D9',
    softColor: '#EEF1FF',
    borderColor: 'rgba(52, 72, 217, 0.24)'
  },
  {
    id: 'nav-guide',
    label: 'Guia',
    icon: 'GD',
    link: '/tabs/agenda',
    color: '#5B35D9',
    softColor: '#F1E8FF',
    borderColor: 'rgba(91, 53, 217, 0.24)'
  },
  {
    id: 'nav-health-ai',
    label: 'IA Saude',
    icon: 'IA',
    link: '/tabs/medications',
    color: '#3448D9',
    softColor: '#EEF1FF',
    borderColor: 'rgba(52, 72, 217, 0.24)'
  },
  {
    id: 'nav-exercises',
    label: 'Exercicios',
    icon: 'EX',
    link: '/tabs/health',
    color: '#A000EE',
    softColor: '#FFF0FF',
    borderColor: 'rgba(160, 0, 238, 0.24)'
  },
  {
    id: 'nav-profile',
    label: 'Perfil',
    icon: 'PF',
    link: '/perfil',
    color: '#00B86B',
    softColor: '#E9FFF3',
    borderColor: 'rgba(0, 184, 107, 0.24)'
  },
  {
    id: 'nav-calendar',
    label: 'Calendario',
    icon: 'CAL',
    link: '/tabs/calendario',
    color: '#5B35D9',
    softColor: '#F1E8FF',
    borderColor: 'rgba(91, 53, 217, 0.24)'
  }
];
