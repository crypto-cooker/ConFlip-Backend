import axios from 'axios';
// import { transferWithdrawal } from './addMultiplierOnChain';
// import { DB_API_URL } from './constants/config';
// import { Total_Bankroll, updateBankroll, updateConfigFromDB } from './constants/utils';
// import { ConfigResponseData, WalletResponseData } from './models';

// export const routeRegister = async (req, res) => {
//     const { address, name } = req.body;
//     if (!address || !name) res.error('Invalid username and wallet address');
//     try {
//         console.log(`--> API Request: register wallet ${name}-${address}`);

//         /// Create new User
//         let ret = await axios.post(`${DB_API_URL}/moonshot/v1/user`, { name });
//         if (!ret.data || ret.data.ID == undefined || ret.data.ID == 0) {
//             res.send({ err: 'Register Error: Invalid user ID from DB API while user create' });
//             return;
//         }
//         const user_id = ret.data.ID;

//         /// Create new Wallet
//         ret = await axios.post(`${DB_API_URL}/moonshot/v1/wallet`, { "wallet_address": address, user_id });
//         console.log('  New wallet created ', ret.data.ID);
//         res.send({ status: 'success', data: { user_id } });
//     } catch (e) {
//         const msg = `Register Error: ${e.msg || e.message || e}`;
//         res.send({ err: msg });
//     }
// }

// export const routeDeposit = async (req, res) => {
//     const { address, amount, txid } = req.body;
//     if (!address || amount === undefined || !txid) res.error('Invalid wallet address or tx id');
//     try {
//         console.log(`--> API Request: deposited SOL ${amount}-${address}`);

//         if (!address) return { err: 'Empty address' };
//         // console.log(`  -> API Request: get wallet info by address: ${address}`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
//         let ret = result.data as WalletResponseData;

//         /// Update Wallet Balance
//         result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
//             ...ret,
//             trading_balance: ret.trading_balance + amount as number,
//         });
//         console.log('  Deposit success', ret.trading_balance + amount);
//         res.send({ status: 'success', data: { f_bal: ret.trading_balance + amount as number } });
//     } catch (e) {
//         const msg = `Deposite Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         res.send({ err: msg });
//     }
// }

// export const routeWithdraw = async (req, res) => {
//     const { address, amount } = req.body;
//     if (!address || amount === undefined) res.error('Invalid wallet address');
//     try {
//         console.log(`--> API Request: withdrawed SOL ${amount}-${address}`);

//         if (!address) return { err: 'Empty address' };
//         // console.log(`  -> API Request: get wallet info by address: ${address}`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
//         let ret = result.data as WalletResponseData;

//         if (ret.trading_balance < amount) {
//             res.send({ err: 'Insufficient trading balance' });
//             return;
//         }
//         const tx_res = await transferWithdrawal(address, amount);

//         /// Update Wallet Balance
//         result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
//             ...ret,
//             trading_balance: ret.trading_balance - amount as number,
//         });

//         console.log('  Withdraw success', ret.trading_balance - amount);
//         res.send({ status: 'success', data: { f_bal: ret.trading_balance - amount as number, tx_id: tx_res.result } });
//     } catch (e) {
//         const msg = `Withdraw Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         res.send({ err: msg });
//     }
// }

// export const routeInvest = async (req, res) => {
//     const { address, amount, txid } = req.body;
//     if (!address || amount === undefined || !txid) res.error('Invalid wallet address or tx id');
//     try {
//         console.log(`--> API Request: invested SOL ${amount}-${address}`);

//         if (!address) return { err: 'Empty address' };
//         // console.log(`  -> API Request: get wallet info by address: ${address}`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
//         let ret = result.data as WalletResponseData;

//         /// Update Wallet Balance
//         result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
//             ...ret,
//             funding_balance: ret.funding_balance + amount as number,
//         });
//         await updateConfigFromDB();
//         updateBankroll(Total_Bankroll + amount);
//         console.log('  Invest success', ret.funding_balance + amount);
//         res.send({ status: 'success', data: { f_bal: ret.funding_balance + amount as number, total_bankroll: Total_Bankroll } });
//     } catch (e) {
//         const msg = `Invest Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         res.send({ err: msg });
//     }
// }

// export const routeDivest = async (req, res) => {
//     const { address, amount } = req.body;
//     if (!address || amount === undefined) res.error('Invalid wallet address');
//     try {
//         console.log(`--> API Request: divesting SOL ${amount}-${address}`);

//         if (!address) return { err: 'Empty address' };
//         // console.log(`  -> API Request: get wallet info by address: ${address}`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
//         let ret = result.data as WalletResponseData;

//         await updateConfigFromDB();
//         if (Total_Bankroll < amount || ret.funding_balance < amount) {
//             res.send({ err: 'Insufficient funding balance' });
//             return;
//         }
//         const tx_res = await transferWithdrawal(address, amount);

//         /// Update Wallet Balance
//         result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
//             ...ret,
//             funding_balance: ret.funding_balance - amount as number,
//         });
//         updateBankroll(Total_Bankroll - amount);
//         console.log('  Withdraw success', ret.funding_balance - amount);
//         res.send({ status: 'success', data: { f_bal: ret.funding_balance - amount as number, tx_id: tx_res.result } });
//     } catch (e) {
//         const msg = `Withdraw Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         res.send({ err: msg });
//     }
// }

// export const routeGetBankroll = async (req, res) => {
//     const { address } = req.body;
//     if (!address) res.error('Invalid wallet address');
//     try {
//         console.log(`--> API Request: get Bankroll ${address}`);

//         if (!address) return { err: 'Empty address' };

//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
//         let ret = result.data as WalletResponseData;

//         await updateConfigFromDB();
//         console.log('  Get Bankroll success', ret.funding_balance, Total_Bankroll);
//         res.send({ status: 'success', data: { f_bal: ret.funding_balance as number, total_bankroll: Total_Bankroll } });
//     } catch (e) {
//         const msg = `Get Bankroll Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         res.send({ err: msg });
//     }
// }

// export const getConfigFromDB = async () => {
//     try {
//         console.log(`--> API Request: get configs`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/config`);
//         let ret: ConfigResponseData = result.data;
//         console.log('  Fetch config success');
//         return ret;
//     } catch (e) {
//         const msg = `Fetch Config Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         return undefined;
//     }
// }

// export const updateDBConfig = async (min: number, max: number, bankroll: number) => {
//     try {
//         console.log(`--> API Request: update configs`);
//         let newConfig = await getConfigFromDB();
//         if (!newConfig) return;

//         newConfig.min = min;
//         newConfig.max = max;
//         newConfig.house_bankroll = bankroll;
//         await axios.put(`${DB_API_URL}/moonshot/v1/config`, newConfig);
//         console.log('  Update config success');
//     } catch (e) {
//         const msg = `Update Config Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         return undefined;
//     }
// }

// export const writeGameRoundValue = async (multiplier: number) => {
//     try {
//         console.log(`--> DB API Call: add game round`);
//         const newRound = {
//             multiplier
//         }
//         let res = await axios.post(`${DB_API_URL}/moonshot/v1/round`, newRound);
//         console.log('  Write game round success');
//         return res.data.ID
//     } catch (e) {
//         const msg = `Write game round Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         return undefined;
//     };
// }
