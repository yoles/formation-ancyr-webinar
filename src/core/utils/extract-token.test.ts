import { extractToken } from './extract-token';

describe('Extract token', () => {
  it('should extract the token', () => {
    expect(extractToken('Basic 123')).toEqual('123');
    expect(extractToken('Test 123')).toBeNull();
    expect(extractToken('test123')).toBeNull();
    expect(extractToken('')).toBeNull();
    expect(extractToken('Basic another123')).toEqual('another123');
  });
});
