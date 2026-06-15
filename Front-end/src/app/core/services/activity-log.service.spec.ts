import { describe, expect, it } from 'vitest';

import type { ActivityLog } from '../models';
import { filterActivityLogs, summarizeHomeActivityLogs } from './activity-log.service';

function makeLog(overrides: Partial<ActivityLog>): ActivityLog {
  return {
    id: overrides.id ?? `log-${Math.random().toString(36).slice(2, 8)}`,
    elderlyId: overrides.elderlyId ?? 'patient-1',
    taskId: overrides.taskId,
    action: overrides.action ?? 'completed_task',
    description: overrides.description ?? 'Administrador marcou a tarefa "Medicacao" como concluida.',
    performedByUserId: overrides.performedByUserId ?? 'user-1',
    performedByName: overrides.performedByName ?? 'Administrador CuidaBem',
    performedByRole: overrides.performedByRole ?? 'admin',
    performedAt: overrides.performedAt ?? new Date().toISOString(),
    details: overrides.details
  };
}

describe('activity log helpers', () => {
  it('summarizes only relevant care actions on the home feed', () => {
    const logs = [
      makeLog({ id: '1', taskId: 'task-1', action: 'created_task', description: 'Administrador adicionou a tarefa "Medicacao da tarde".', performedAt: '2026-06-12T10:00:00.000Z' }),
      makeLog({ id: '2', taskId: 'task-1', action: 'completed_task', description: 'Administrador marcou a tarefa "Medicacao da tarde" como concluida.', performedAt: '2026-06-12T10:10:00.000Z' }),
      makeLog({ id: '3', taskId: 'task-1', action: 'uncompleted_task', description: 'Administrador desmarcou a tarefa "Medicacao da tarde".', performedAt: '2026-06-12T10:11:00.000Z' }),
      makeLog({ id: '4', action: 'created_observation', description: 'Observacao importante registrada.', performedAt: '2026-06-12T11:00:00.000Z' }),
      makeLog({ id: '5', action: 'deleted_task', description: 'Administrador removeu a tarefa "Medicacao da tarde".', performedAt: '2026-06-12T11:30:00.000Z' }),
      makeLog({ id: '6', taskId: 'task-2', action: 'completed_task', description: 'Administrador marcou a tarefa "Hidratacao" como concluida.', performedAt: '2026-06-12T12:00:00.000Z' })
    ];

    const summary = summarizeHomeActivityLogs(logs, 5);

    expect(summary).toHaveLength(3);
    expect(summary.map((log) => log.id)).toEqual(['6', '4', '2']);
  });

  it('filters full history by period and action group', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const thisWeek = new Date(now);
    thisWeek.setDate(now.getDate() - 2);

    const logs = [
      makeLog({ id: '1', action: 'completed_task', performedAt: now.toISOString() }),
      makeLog({ id: '2', action: 'created_task', performedAt: yesterday.toISOString() }),
      makeLog({ id: '3', action: 'deleted_task', performedAt: thisWeek.toISOString() })
    ];

    const todayOnly = filterActivityLogs(logs, 'today', 'all');
    const createdOnly = filterActivityLogs(logs, 'all', 'added');
    const removedOnly = filterActivityLogs(logs, 'week', 'removed');

    expect(todayOnly.map((log) => log.id)).toEqual(['1']);
    expect(createdOnly.map((log) => log.id)).toEqual(['2']);
    expect(removedOnly.map((log) => log.id)).toEqual(['3']);
  });
});
