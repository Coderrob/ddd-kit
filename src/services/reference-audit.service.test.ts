import type { IResolver } from '../interfaces/IResolver';

import { ReferenceAuditService } from './reference-audit.service';

describe('ReferenceAuditService', () => {
  let service: ReferenceAuditService;
  const mockResolver: jest.Mocked<IResolver> = {
    getAllUids: jest.fn(),
    getRegistry: jest.fn(),
    getRequires: jest.fn(),
    resolve: jest.fn(),
    updateAlias: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReferenceAuditService(mockResolver);
  });

  it('should audit registry and return result', async () => {
    mockResolver.getRegistry.mockReturnValue({
      uid1: { requires: ['dep1'], status: 'active' },
      uid2: { requires: [], status: 'deprecated' },
      uid3: void 0, // unresolved
    });

    const result = await service.execute();

    expect(result.totalReferences).toBe(1);
    expect(result.unresolvedUids).toEqual(['uid3']);
    expect(result.deprecatedUids).toEqual(['uid2']);
    expect(result.archivedUids).toEqual([]);
    expect(result.summary).toContain('Audited 3 UIDs');
  });
});
