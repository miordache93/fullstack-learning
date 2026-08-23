// BOUNDARY: Zod preserves runtime checks after Typescript types dissapear.
import { z } from 'zod';

// BOUNDARY: Validate route indentities before the service receives them.
export const TaskIdSchema = z.object({ id: z.uuid() });
// WHAT: Reuse one accepted vocabulary at HTTP and persistence boundar.
export const PrioritySchema = z.enum(['low', 'medium', 'high']);

// BOUNDARY: Convert an untrusted create body into a domain command.
export const CreateTaskSchema = z.object({
    // WHY: Normalization makes whitespace-only titles invalid.
    title: z.string().trim().min(1).max(200),
    // WHY: Bound optional input before a database or log receives it.
    description: z.string().trim().max(2_000).optional(),
    // WHY: The server, not every caller, owns the default.
    priority: PrioritySchema.default('medium'),
});

// BOUNDARY: A patch may change selected fields but must carry a concurrency token.
export const UpdateTaskSchema = z
  .object({
    // WHAT: Every mutable field is optional in a partial update.
    title: z.string().trim().min(1).max(200).optional(),
    // WHY: `null` explicitly clears a description; `undefined` leaves it alone.
    description: z.string().trim().max(2_000).nullable().optional(),
    // WHAT: Reuse the same finite priority vocabulary.
    priority: PrioritySchema.optional(),
    // WHAT: Permit the completion state to change.
    done: z.boolean().optional(),
    // WHY: Reject stale writes later with optimistic concurrency.
    version: z.number().int().positive(),
  })
  .refine(
    // CHECK: A version by itself is not a useful patch.
    (input) => Object.entries(input).some(([property, value]) => property !== 'version' && value !== undefined),
    // WHAT: Return one stable validation message for an empty patch.
    { message: 'Provide at least one field to update' },
  );

  // BOUNDARY: Completion also requires the version the caller observed.
export const CompleteTaskSchema = z.object({
  version: z.number().int().positive(),
});

// BOUNDARY: A caller-chosen retry-correlation token, bounded before it reaches storage.
export const IdempotencyKeySchema = z.string().trim().min(1).max(200);

// BOUNDARY: Query strings are strings until this parser deliberately transforms them.
export const ListTasksSchema = z.object({
  // WHY: Bound page size to protect memory and response latency.
  limit: z.coerce.number().int().min(1).max(500).default(50),
  // WHAT: Start with offset pagination before the later cursor exercise.
  offset: z.coerce.number().int().min(0).default(0),
  // WHY: Avoid `z.coerce.boolean()` because the string "false" is truthy in JavaScript.
  done: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
    // WHY: Normalize and bound the optional search term.
    q: z.string().trim().max(100).optional(),
});

// WHAT: Derive compile-time command types from runtime authorities.
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTasksInput = z.infer<typeof ListTasksSchema>;