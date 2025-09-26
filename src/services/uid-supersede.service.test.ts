import type { IResolver } from '../interfaces/IResolver';

import { UidSupersedeService } from './uid-supersede.service';

describe('UidSupersedeService', () => {
  let service: UidSupersedeService;
  const mockResolver: jest.Mocked<IResolver> = {
    getAllUids: jest.fn(),
    getRegistry: jest.fn(),
    getRequires: jest.fn(),
    resolve: jest.fn(),
    updateAlias: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UidSupersedeService(mockResolver);
  });

  it('should update alias for supersede', async () => {
    await service.execute('old-uid', 'new-uid');

    expect(mockResolver.updateAlias).toHaveBeenCalledWith('old-uid', 'new-uid');
  });
});
