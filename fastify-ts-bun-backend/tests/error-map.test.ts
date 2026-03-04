import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mapToAppError } from '../src/errors/error-map';
import { NotFoundError } from '../src/errors/http-errors';

describe('mapToAppError', () => {
  it('passes through known AppError instances', () => {
    const original = new NotFoundError({
      detail: 'Entity was not found.',
    });

    const mapped = mapToAppError(original);

    expect(mapped).toBe(original);
    expect(mapped.status).toBe(404);
  });

  it('maps Zod validation errors to ValidationError', () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    let caughtError: unknown;
    try {
      schema.parse({ name: 'ab' });
    } catch (error) {
      caughtError = error;
    }

    const mapped = mapToAppError(caughtError);
    expect(mapped.status).toBe(400);
    expect(mapped.code).toBe('VALIDATION_ERROR');
    expect(mapped.errors.length).toBeGreaterThan(0);
  });

  it('maps unknown errors to InternalServerError', () => {
    const mapped = mapToAppError(new Error('boom'));

    expect(mapped.status).toBe(500);
    expect(mapped.code).toBe('INTERNAL_SERVER_ERROR');
    expect(mapped.detail).toBe('Unexpected server error.');
  });
});
