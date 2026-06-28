// src/common/utils/prisma.utils.ts
// src/common/utils/prisma.utils.ts
export const prismaUpdateData = <T extends object>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([value]) => value !== undefined),
  ) as Partial<T>;
};
