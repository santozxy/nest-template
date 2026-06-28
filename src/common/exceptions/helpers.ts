export const extractPrismaErrorMessage = (exception: string): string => {
  const normalized = exception.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  if (normalized.includes('Invalid value provided')) {
    const fieldMatch = normalized.match(/`(\w+)`/);
    const field = fieldMatch ? fieldMatch[1] : 'campo';

    const expectedMatch = normalized.match(/Expected ([^,]+), provided/);
    const expected = expectedMatch ? expectedMatch[1] : 'valor inválido';

    return `Erro de validação do banco de dados no ${field}: valor inválido. Esperado: ${expected}.`;
  }

  if (normalized.includes('Argument')) {
    return 'Erro de argumento inválido na requisição.';
  }

  if (normalized.includes('Missing a required value')) {
    const fieldMatch = normalized.match(/`(\w+)`/);
    const field = fieldMatch ? fieldMatch[1] : 'campo';
    return `Erro de validação do banco de dados: o campo ${field} é obrigatório.`;
  }

  if (normalized.includes('Unique constraint')) {
    const fieldMatch = normalized.match(/`(\w+)`/);
    const field = fieldMatch ? fieldMatch[1] : 'campo';
    return `Já existe um registro com esse valor único: '${field}'.`;
  }

  return 'Erro de validação do banco de dados.';
};
