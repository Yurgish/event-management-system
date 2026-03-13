export function getServerErrorMessage(
  error: unknown,
  fallbackMessage = 'Request failed. Please try again.',
): string {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return fallbackMessage;
  }

  const { data } = error as { data?: unknown };

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: unknown };

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallbackMessage;
}
