jest.mock('../src/models', () => ({
  User: {
    find: jest.fn(),
  },
}));

const { User } = require('../src/models');
const adminUserService = require('../src/services/adminUserService');

describe('adminUserService.listUsers', () => {
  afterEach(() => jest.clearAllMocks());

  test('excludes passwordHash and sorts newest first', async () => {
    const leanMock = jest.fn().mockResolvedValue([{ name: 'Jane' }]);
    const sortMock = jest.fn(() => ({ lean: leanMock }));
    const selectMock = jest.fn(() => ({ sort: sortMock }));
    User.find.mockReturnValue({ select: selectMock });

    const result = await adminUserService.listUsers();

    expect(selectMock).toHaveBeenCalledWith('-passwordHash');
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ name: 'Jane' }]);
  });
});