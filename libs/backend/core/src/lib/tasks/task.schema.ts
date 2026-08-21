import { z } from 'zod';

export const TaskIdSchema = z.object({ id: z.uuid() });

// WHAT: Share one runtime parser for priorities entering from HTTP or leaving storage.
export const PrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2_000).optional(),
  priority: PrioritySchema.default('medium'),
});

export const UpdateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2_000).nullable().optional(),
    priority: PrioritySchema.optional(),
    done: z.boolean().optional(),
    version: z.number().int().positive(),
  })
  .refine(
    (input) =>
      Object.entries(input).some(
        ([property, value]) => property !== 'version' && value !== undefined,
      ),
    { message: 'Provide at least one field to update' },
  );

export const CompleteTaskSchema = z.object({
  version: z.number().int().positive(),
});

export const ListTasksSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  done: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  q: z.string().trim().max(100).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTasksInput = z.infer<typeof ListTasksSchema>;
