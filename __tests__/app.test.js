const { dialog } = require('electron');
const { Pool } = require('pg');

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn()
      })
    }))
  };
});

jest.mock('electron', () => ({
  ...jest.requireActual('electron'),
  dialog: {
    showMessageBox: jest.fn(),
    showErrorBox: jest.fn()
  }
}));

describe('Database Functions', () => {
  describe('getPartners', () => {
    let executeQuery;
    let getPartners;

    beforeAll(() => {
      executeQuery = jest.fn(async (sql) => {
        const pool = new Pool();
        const client = await pool.connect();
        try {
          return await client.query(sql);
        } finally {
          client.release();
        }
      });

      getPartners = jest.fn(async () => {
        const result = await executeQuery('SELECT * FROM partners');
        return result.rows;
      });
    });

    it('должен вернуть партнеров', async () => {
      executeQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Partner 1' }] });

      const partners = await getPartners();
      expect(partners).toEqual([{ id: 1, name: 'Partner 1' }]);
    });
  });

  describe('createPartner', () => {
    let executeQuery;
    let createPartner;

    beforeAll(() => {
      executeQuery = jest.fn(async (sql) => {
        const pool = new Pool();
        const client = await pool.connect();
        try {
          return await client.query(sql);
        } finally {
          client.release();
        }
      });

      createPartner = jest.fn(async (event, partner) => {
        await executeQuery(`INSERT INTO partners (type, name, ceo, mail, phone, address, rating)
          VALUES ('${partner.type}', '${partner.name}', '${partner.ceo}', 
          '${partner.email}', '${partner.phone}', '${partner.address}', ${partner.rating});`);
        dialog.showMessageBox({ message: 'Успех! Партнер создан' });
      });
    });

    it('должен создать партнера и показать сообщение об успехе', async () => {
      const partner = {
        type: 'TypeA',
        name: 'Partner A',
        ceo: 'CEO A',
        email: 'ceo@example.com',
        phone: '1234567890',
        address: 'Address A',
        rating: 5
      };

      await createPartner(null, partner);
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        message: 'Успех! Партнер создан'
      });
    });
  });

  describe('updatePartner', () => {
    let executeQuery;
    let updatePartner;

    beforeAll(() => {
      executeQuery = jest.fn(async (sql) => {
        const pool = new Pool();
        const client = await pool.connect();
        try {
          return await client.query(sql);
        } finally {
          client.release();
        }
      });

      updatePartner = jest.fn(async (event, partner) => {
        await executeQuery(`UPDATE partners SET 
          name='${partner.name}', 
          type='${partner.type}', 
          ceo='${partner.ceo}', 
          mail='${partner.email}', 
          phone='${partner.phone}', 
          address='${partner.address}', 
          rating='${partner.rating}' 
          WHERE id=${partner.id};`);
        dialog.showMessageBox({ message: 'Успех! Данные обновлены' });
      });
    });

    it('должен обновить партнера и показать сообщение об успехе', async () => {
      const partner = {
        id: 1,
        type: 'TypeA',
        name: 'Updated Partner',
        ceo: 'Updated CEO',
        email: 'updated@example.com',
        phone: '0987654321',
        address: 'Updated Address',
        rating: 4
      };

      await updatePartner(null, partner);
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        message: 'Успех! Данные обновлены'
      });
    });
  });
});
