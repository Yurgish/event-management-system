export interface EventCapacityMeta {
  capacity: number | null;
  isUnlimited: boolean;
  isFull: boolean;
  participantsLabel: string;
}

export function getEventCapacityMeta(
  participantsCount: number,
  rawCapacity: unknown,
): EventCapacityMeta {
  const capacity = typeof rawCapacity === 'number' ? rawCapacity : null;
  const isUnlimited = capacity === null;

  return {
    capacity,
    isUnlimited,
    isFull: capacity !== null && participantsCount >= capacity,
    participantsLabel:
      capacity !== null
        ? `${participantsCount}/${capacity}`
        : `${participantsCount}/`,
  };
}
