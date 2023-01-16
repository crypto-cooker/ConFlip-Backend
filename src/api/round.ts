import db from '../constants/ids';

export enum FlipType {
  KICKFLIP = 0,
  WIPEOUT,
}

export enum TokenType {
  SOL = "SOL",
  GRIND = "GRIND",
}

export enum ResultType {
  WIN = "win",
  LOSE = "lose",
}

export enum StatusType {
  INIT = "init",
  PROCESSED = "processed",
}

export interface Round {
  id: number,
  wallet_id: number,
  flip_type: FlipType,
  token: TokenType,
  amount: number,
  result: ResultType,
  timestamp: Date,
  status: StatusType,
  signature: string,
  address?: string,
}

export const createRound = async (props: Round) => {
  const { wallet_id, amount, token, result, flip_type, timestamp, status, signature } = props;
  // console.log(props);

  try {
    const { rows } = await db.query(
      `INSERT INTO rounds (wallet_id, flip_type, token, amount, result, timestamp, status, signature) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [wallet_id, flip_type, token, amount, result, timestamp, status, signature]
    );

    return {
      message: "Round added successfully!",
      body: {
        round: { id: rows[0].id, wallet_id, flip_type, token, amount, result, timestamp, status, signature }
      },
    };
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
}

// ==> Method responsible for listing all 'Rounds':
export const listAllRounds = async () => {
  try {
    const response = await db.query(`SELECT rounds.*, auth_wallets.address FROM rounds INNER JOIN auth_wallets ON auth_wallets.id = rounds.wallet_id ORDER BY timestamp DESC LIMIT 100`);
    return response.rows;
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
};

// ==> Method responsible for selecting 'Round' by 'Id':
export const findRoundById = async (props: { id: number }) => {
  const roundId = props.id;

  try {
    const response = await db.query(`SELECT * FROM rounds WHERE id = $1`, [roundId]);
    return response.rows[0];
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
}

// ==> Method responsible for updating a 'Round' by 'Id':
export const updateRoundStatusById = async (props: {
  id: number,
  status: StatusType,
}) => {
  const roundId = props.id;
  const status = props.status;
  // console.log(roundId, status);

  try {
    let querys = [], values = [];

    querys.push('status');
    values.push(status);

    values.push(roundId);

    if (querys.length == 0) {
      return { message: "No updated params provided!" };
    }

    await db.query(
      `UPDATE rounds SET ${querys.map((field, index) => `"${field}" = $${index + 1}`).join(', ')} WHERE id = $${values.length}`,
      values
    );

    return { message: "Round Updated Successfully!" };
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
};

// ==> Method responsible for excluding a 'Round' by 'Id':
export const deleteRoundById = async (props: { id: number }) => {
  const roundId = props.id;

  try {
    await db.query(`DELETE FROM rounds WHERE id = $1`, [
      roundId
    ]);

    return { message: 'Round deleted successfully!', roundId };
  } catch (e) {
    console.log(e.message || e);
    return { err: e.message || JSON.stringify(e) };
  }
};
