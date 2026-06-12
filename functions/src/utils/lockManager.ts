// Locks guardados em memória por propriedadeId
const activeLocks = new Set<string>();

/**
 * Adquire uma trava exclusiva para a propriedade para evitar double-booking concorrente.
 */
export const acquireLock = async (propriedadeId: string, timeoutMs: number = 12000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    // Tenta definir o lock atomicamente se ele não existir
    if (!activeLocks.has(propriedadeId)) {
      activeLocks.add(propriedadeId);
      return true; // Lock adquirido com sucesso
    }

    // Esperar um pouco antes de tentar novamente (backoff simples)
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return false; // Estourou o timeout de espera
};

/**
 * Libera a trava exclusiva da propriedade.
 */
export const releaseLock = async (propriedadeId: string): Promise<void> => {
  activeLocks.delete(propriedadeId);
};

