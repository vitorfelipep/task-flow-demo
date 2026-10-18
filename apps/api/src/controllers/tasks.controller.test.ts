import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Request, Response } from 'express';
import { prisma } from '@taskflow/database';
import { createTaskSchema, updateTaskSchema } from '@taskflow/shared';
import { TasksController } from './tasks.controller';

const optionalFields = ['description', 'dueDate', 'dueTime'] as const;

test('creation keeps empty optional fields absent', () => {
  const data = createTaskSchema.parse({
    title: 'Task', description: '', dueDate: '', dueTime: '',
  });
  for (const field of optionalFields) assert.equal(data[field], undefined);
});

test('edit clearing survives browser serialization and API validation', () => {
  for (const value of ['', null]) {
    const form = updateTaskSchema.parse({
      description: value, dueDate: value, dueTime: value,
    });
    const request = updateTaskSchema.parse(JSON.parse(JSON.stringify(form)));
    for (const field of optionalFields) assert.equal(request[field], null);
  }
});

test('omitted edit fields remain absent and invalid dates/times are rejected', () => {
  assert.deepEqual(updateTaskSchema.parse({ title: 'Renamed' }), { title: 'Renamed' });
  assert.equal(updateTaskSchema.safeParse({ dueDate: 'bad-date' }).success, false);
  assert.equal(updateTaskSchema.safeParse({ dueTime: '25:00' }).success, false);
});

for (const scenario of [
  { name: 'clear', body: { description: null, dueDate: null, dueTime: null }, expected: null },
  { name: 'omit', body: { title: 'Renamed' }, expected: undefined },
]) {
  test(`controller ${scenario.name} preserves PATCH semantics in database updates`, async (t) => {
    // Prisma delegates are proxies, so replace methods directly and restore them.
    const originalFindFirst = prisma.task.findFirst;
    const originalUpdate = prisma.task.update;
    t.after(() => {
      prisma.task.findFirst = originalFindFirst;
      prisma.task.update = originalUpdate;
    });
    prisma.task.findFirst = (async () => ({ id: 'task-1', userId: 'user-1' })) as typeof prisma.task.findFirst;
    let saved = false;
    prisma.task.update = (async (args: { data: Record<string, unknown> }) => {
      for (const field of optionalFields) assert.equal(args.data[field], scenario.expected);
      saved = true;
      return { id: 'task-1', ...args.data, labels: [] };
    }) as unknown as typeof prisma.task.update;
    const req = {
      params: { id: 'task-1' }, user: { userId: 'user-1' }, body: scenario.body,
    } as unknown as Request;
    let result: unknown;
    const res = { json: (data: unknown) => { result = data; } } as Response;
    await TasksController.update(req, res, (error?: unknown) => { throw error; });
    assert.equal(saved, true);
    assert.ok(result);
  });
}
