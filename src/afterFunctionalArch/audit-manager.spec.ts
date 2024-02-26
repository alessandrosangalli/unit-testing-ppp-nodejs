import { AuditManager, FileContent } from './audit-manager';

jest.mock('fs/promises', () => ({
  readdir: jest.fn().mockResolvedValue(['audit_1.txt', 'audit_2.txt']),
  writeFile: jest.fn(),
  readFile: jest.fn().mockResolvedValueOnce(
    `Peter;2019-04-06T16:30:00
     Jane;2019-04-06T16:40:00
     Jack;2019-04-06T17:00:00`,
  ),
}));

test('Um novo arquivo é criado quando o arquivo atual excedo o limite', async () => {
  const auditManager = new AuditManager(3);
  const files: FileContent[] = [
    {
      fileName: 'audit_1.txt',
      lines: [],
    },
    {
      fileName: 'audit_2.txt',
      lines: [
        'Peter; 2019-04-06T16:30:00',
        'Jane; 2019-04-06T16:40:00',
        'Jack; 2019-04-06T17:00:00',
      ],
    },
  ];

  const newName = 'Alice';
  const newDate = new Date('2019-04-09');
  const update = await auditManager.addRecord(files, newName, newDate);

  expect(update.fileName).toEqual('audit_3.txt');
  expect(update.newContent).toEqual(`${newName};${newDate.toString()}`);
});
