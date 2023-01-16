import db from '../constants/ids';

// ==> Method responsible for creating a new 'AuthWallet':
export const createAuth = async (props: { address: string }) => {
  const { address } = props;
  console.log(props);

  try {
    const { rows } = await db.query(
      `INSERT INTO auth_wallets (address) VALUES ($1) RETURNING id`,
      [address]
    );

    return {
      message: "Wallet added successfully!",
      body: {
        wallet: { id: rows[0].id, address }
      },
    };
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
};

// ==> Method responsible for selecting 'AuthWallets' with filter 'Id' and 'address':
export const findAuthsByFilter = async (props: { id?: number, address?: string }) => {
  const { id, address } = props;
  console.log(`List by Id: ${id}, Address: ${address}`);;

  if (id != undefined && address != undefined) {
    console.log(`filters can't use at the same time`);
    return { err: `filters can't use at the same time` };
  }

  try {
    const response = await db.query(`SELECT * FROM auth_wallets WHERE ${id != undefined ? 'id' : 'address'} = $1`, [id != undefined ? id : address]);
    return response.rows[0];
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
}
