export const extractToken = (token: string): string | null => {
  const parts = token.split(' ');
  if (parts[0] !== 'Basic') {
    return null;
  }

  return parts[1];
};
