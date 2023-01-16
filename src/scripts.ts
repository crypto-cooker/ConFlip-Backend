import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import {
    Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    PartiallyDecodedInstruction,
    Transaction,
} from '@solana/web3.js';
import fs from 'fs';
import { Server } from "socket.io"
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import { GlobalPool, PlayerPool } from './context/types';
import { IDL as GameIDL } from "./context/coinflip";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { FlipType, ResultType, StatusType, TokenType, createRound, updateRoundStatusById } from './api/round';
import { createAuth, findAuthsByFilter } from './api/wallet';

const PLAYER_POOL_SIZE = 112;
const LAMPORTS = 1000000000;
const GLOBAL_AUTHORITY_SEED = "global-authority";
const VAULT_AUTHORITY_SEED = "vault-authority";
const NONCE = "4QUPibxi";

const PROGRAM_ID = "7ttfENVhNwb21KjZiLHgXLsX2sC1rKoJgnTVL4wb54t1";

// Set the initial program and provider
let program: Program = null;
let provider: anchor.Provider = null;

// Address of the deployed program.
let programId = new anchor.web3.PublicKey(PROGRAM_ID);

anchor.setProvider(anchor.AnchorProvider.local(web3.clusterApiUrl("devnet")));
provider = anchor.getProvider();

let solConnection = anchor.getProvider().connection;

// Generate the program client from IDL.
program = new anchor.Program(GameIDL as anchor.Idl, programId);

export const subscribePlay = async (io: Server) => {
    console.log('Admin wallet: ', provider.publicKey.toBase58());
    console.log('ProgramId: ', program.programId.toBase58());
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());

    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED)],
        program.programId
    );
    console.log('RewardVault: ', rewardVault.toBase58());

    // await initProject();
    // await update(new PublicKey('Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp'), 3, new PublicKey('Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp'));

    const globalPool: GlobalPool = await getGlobalState();
    console.log("GlobalPool Admin =", globalPool.superAdmin.toBase58(), globalPool.totalRound.toNumber(), globalPool.loyaltyWallet.toBase58(), globalPool.loyaltyFee.toNumber());

    // await initializeUserPool(provider.publicKey);

    // const userPool: PlayerPool = await getUserPoolState(provider.publicKey);
    // console.log(userPool.round, userPool.winTimes, userPool.gameData);
    // await playGame(provider.publicKey, 0, 1);
    // await claim(provider.publicKey, provider.publicKey);
    // await withDraw(payer.publicKey, 0.5);
    // console.log(await getAllTransactions(program.programId));
    // console.log(await getDataFromSignature('2FHN7zfuFPzTByeH9FVnnAc393AtipiuVwQfSXxyKSGvsCq1KjtqZBnw55fN6fPDvrxRr6xW1DHb4XSBpfAEyzpv'));
    await subscribePlaying(io);
};

export const setClusterConfig = async (cluster: web3.Cluster, keypair: string, rpc?: string) => {
    if (!rpc) {
        solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
    } else {
        solConnection = new web3.Connection(rpc);
    }

    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypair, 'utf-8'))), { skipValidation: true });
    const wallet = new NodeWallet(walletKeypair);

    // Configure the client to use the local cluster.
    anchor.setProvider(new anchor.AnchorProvider(solConnection, wallet, { skipPreflight: true, commitment: 'confirmed' }));

    console.log('Wallet Address: ', wallet.publicKey.toBase58());

    // Generate the program client from IDL.
    program = new anchor.Program(GameIDL as anchor.Idl, programId);
    console.log('ProgramId: ', program.programId.toBase58());

}

export const initProject = async (
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED)],
        program.programId
    );

    let tx = new Transaction();

    tx.add(program.instruction.initialize(
        {
            accounts: {
                admin: provider.publicKey,
                globalAuthority,
                rewardVault: rewardVault,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
            signers: [],
        }));

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);

    return true;
}


export const initializeUserPool = async (
    userAddress: PublicKey,
) => {

    const tx = await initUserPoolTx(
        userAddress,
    );
    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);
}


export const update = async (
    loyaltyWallet: PublicKey,
    loyatyFee: number,
    newAdmin?: PublicKey,
) => {

    const tx = await updateTx(
        provider.publicKey,
        loyaltyWallet,
        loyatyFee,
        newAdmin,
    );
    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);
}

export const playGame = async (
    userAddress: PublicKey,
    setValue: number,
    deposit: number
) => {

    const tx = await createPlayGameTx(
        userAddress,
        setValue,
        deposit
    );
    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);
    let playerPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "player-pool",
        program.programId,
    );
    let userPoolData = await program.account.playerPool.fetch(playerPoolKey) as unknown as PlayerPool;
    console.log(userPoolData.gameData.playTime.toNumber());
    console.log(userPoolData.gameData.rewardAmount.toNumber());
    console.log(userPoolData.gameData.amount.toNumber());

}

export const claim = async (
    userAddress: PublicKey,
    player: PublicKey
) => {
    const tx = await createClaimTx(
        userAddress,
        player,
    );
    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);
}

export const withdraw = async (
    amount: number
) => {
    const tx = await createWithDrawTx(
        provider.publicKey,
        amount
    );
    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
    });

    console.log("txHash =", txId);
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


export const initUserPoolTx = async (
    userAddress: PublicKey,
) => {
    let playerPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "player-pool",
        program.programId,
    );
    console.log(playerPoolKey.toBase58());

    let tx = new Transaction();

    let ix = SystemProgram.createAccountWithSeed({
        fromPubkey: userAddress,
        basePubkey: userAddress,
        seed: "player-pool",
        newAccountPubkey: playerPoolKey,
        lamports: await solConnection.getMinimumBalanceForRentExemption(PLAYER_POOL_SIZE),
        space: PLAYER_POOL_SIZE,
        programId: program.programId,
    });

    tx.add(ix);
    tx.add(program.instruction.initializePlayerPool(
        {
            accounts: {
                owner: userAddress,
                playerPool: playerPoolKey,
            },
            instructions: [],
            signers: []
        }));

    return tx;
}


export const updateTx = async (
    userAddress: PublicKey,
    loyaltyWallet: PublicKey,
    loyatyFee: number,
    newAdmin?: PublicKey,
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    let tx = new Transaction();

    tx.add(program.instruction.update(
        newAdmin ?? null,
        new anchor.BN(loyatyFee * 10), {
        accounts: {
            admin: userAddress,
            globalAuthority,
            loyaltyWallet
        },
        instructions: [],
        signers: []
    }));

    return tx;
}


export const createPlayGameTx = async (userAddress: PublicKey, setNum: number, deposit: number) => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());

    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED)],
        program.programId
    );
    console.log('RewardVault: ', rewardVault.toBase58());

    let playerPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "player-pool",
        program.programId,
    );
    console.log(playerPoolKey.toBase58());

    const state = await getGlobalState();

    let tx = new Transaction();
    let poolAccount = await solConnection.getAccountInfo(playerPoolKey);
    if (poolAccount === null || poolAccount.data === null) {
        console.log('init User Pool');
        let tx1 = await initUserPoolTx(userAddress);
        tx.add(tx1)
    }

    tx.add(program.instruction.playGame(
        new anchor.BN(setNum), new anchor.BN(deposit * LAMPORTS), {
        accounts: {
            owner: userAddress,
            playerPool: playerPoolKey,
            globalAuthority,
            rewardVault: rewardVault,
            loyaltyWallet: state.loyaltyWallet,
            systemProgram: SystemProgram.programId,
        },
        signers: [],
    }));

    return tx;
}

export const createClaimTx = async (userAddress: PublicKey, player: PublicKey) => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());

    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED)],
        program.programId
    );

    let playerPoolKey = await PublicKey.createWithSeed(
        player,
        "player-pool",
        program.programId,
    );
    console.log(playerPoolKey.toBase58());
    let tx = new Transaction();

    console.log("===> Claiming The Reward");
    tx.add(program.instruction.claimReward(
        {
            accounts: {
                payer: userAddress,
                player,
                playerPool: playerPoolKey,
                globalAuthority,
                rewardVault: rewardVault,
                systemProgram: SystemProgram.programId,
                instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
            }
        }));

    return tx;
}

export const createWithDrawTx = async (userAddress: PublicKey, deposit: number) => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());

    const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED)],
        program.programId
    );
    let tx = new Transaction();

    console.log("===> Withdrawing Sol");
    tx.add(program.instruction.withdraw(
        new anchor.BN(deposit * LAMPORTS), {
        accounts: {
            admin: userAddress,
            globalAuthority,
            rewardVault: rewardVault,
            systemProgram: SystemProgram.programId,
        }
    }));
    return tx;

}


export const getGlobalState = async (
): Promise<GlobalPool | null> => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    try {
        let globalState = await program.account.globalPool.fetch(globalAuthority);
        return globalState as unknown as GlobalPool;
    } catch {
        return null;
    }
}

export const getUserPoolState = async (
    userAddress: PublicKey
): Promise<PlayerPool | null> => {
    if (!userAddress) return null;

    let playerPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "player-pool",
        program.programId,
    );
    console.log('Player Pool: ', playerPoolKey.toBase58());
    try {
        let poolState = await program.account.playerPool.fetch(playerPoolKey);
        return poolState as unknown as PlayerPool;
    } catch {
        return null;
    }
}

// Get signautres related with Program Pubkey
export const getAllTransactions = async (programId: PublicKey) => {
    const data = await solConnection.getSignaturesForAddress(
        programId,
        {},
        "confirmed"
    );
    let result = [];
    console.log(`Tracked ${data.length} signature\nStart parsing Txs....`);
    let txdata = data.filter((tx) => tx.err === null);
    for (let i = 0; i < txdata.length; i++) {
        let rt = await getDataFromSignature(txdata[i].signature);
        if (rt !== undefined) {
            result.push(rt)
        }
    }
    return result;
}

// Parse activity from a transaction siganture
export const getDataFromSignature = async (sig: string) => {
    // Get transaction data from on-chain
    let tx;
    try {
        tx = await solConnection.getParsedTransaction(sig, "confirmed");
    } catch (e) {
        console.log(e.message ?? JSON.stringify(e));
        console.log('Error while parsing round Tx:', sig);
        return;
    }

    const logs = tx.meta.logMessages;
    const lose = logs.indexOf('Program log: Result: win');

    if (!tx) {
        console.log(`Can't get Transaction for ${sig}`);
        return;
    }

    if (tx.meta?.err !== null) {
        console.log(`Failed Transaction: ${sig}`);
        return;
    }

    // Parse activty by analyze fetched Transaction data
    let valid = 0;
    let hash = "";
    let ixId = -1;

    hash = (
        tx.transaction.message.instructions[0] as PartiallyDecodedInstruction
    ).data;
    if (hash !== undefined && hash.slice(0, 8) === NONCE) {
        valid = 1;
    }
    if (valid === 1) {
        ixId = 0;
    }

    if (ixId === -1 || valid === 0) {
        return;
    }

    let ts = tx.blockTime * 1000 ?? 0;
    if (!tx.meta.innerInstructions) {
        console.log(`Can't parse innerInstructions ${sig}`);
        return;
    }

    let accountKeys = (
        tx.transaction.message.instructions[ixId] as PartiallyDecodedInstruction
    ).accounts;

    let signer = accountKeys[0].toBase58();

    let bytes = bs58.decode(hash);

    let a = bytes.slice(8, 16).reverse();
    let type = new anchor.BN(a).toNumber();
    let b = bytes.slice(16, 24).reverse();
    let sol_price = new anchor.BN(b).toNumber();

    let state = lose >= 0 ? ResultType.WIN : ResultType.LOSE;

    let result = {
        flip: type as FlipType,
        address: signer,
        bet_amount: sol_price,
        timestamp: new Date(ts),
        win: state,
        signature: sig,
    };

    return result;
};

export const addRoundData = async (data: {
    flip: FlipType,
    address: string,
    bet_amount: number,
    timestamp: Date,
    win: ResultType,
    signature: string,
}) => {
    let wallet = await findAuthsByFilter({ address: data.address });
    if (!wallet) {
        const result = await createAuth({ address: data.address });
        if (!result.err) {
            wallet = result.body.wallet;
            console.log('Wallet registered:', data.address);
        } else {
            console.log(result.err);
            console.log('Error while register wallet:', data.address);
            return;
        }
    }
    // console.log(wallet);

    const round = await createRound({
        id: 0,
        wallet_id: wallet.id,
        flip_type: data.flip,
        token: TokenType.SOL,
        amount: data.bet_amount,
        result: data.win,
        timestamp: data.timestamp,
        status: StatusType.INIT,
        signature: data.signature,
    })

    if (round.err) {
        console.log(round.err);
        console.log('Error while add new round:', data.signature);
        return;
    }

    console.log('New round Id:', round.body.round.id);
    return {
        ...round.body.round,
        address: data.address,
    };
};

// Hook program Txs to track play instructions
export const subscribePlaying = async (io: Server) => {
    await solConnection.onLogs(program.programId, async (logs, ctx) => {
        if (logs.err) return;
        if (logs.logs.length < 2 || logs.logs[1].indexOf('Instruction: PlayGame') == -1) return;
        // console.log("tx=", logs.signature);

        let tx = await getDataFromSignature(logs.signature);
        if (!tx) return;

        let signer = tx.address;
        console.log('Signer:', signer);

        const roundData = await addRoundData(tx);
        if (roundData) {
            io.emit('new-round', roundData);
        }

        try {
            await claim(provider.publicKey, new PublicKey(signer));

            if (roundData) {
                const result = await updateRoundStatusById({ id: roundData.id, status: StatusType.PROCESSED });
                if (result.err) {
                    console.log()
                    console.log('Error while update round processed status');
                } else {
                    console.log('New round processed status updated!');
                }
            }
        } catch (e) {
            console.log(e.message ?? JSON.stringify(e));
            console.log('Error while claim reward');
        }
    });
    console.log('Subscribed!!');
}

export const manualClaim = async (signer: string) => {
    try {
        await claim(provider.publicKey, new PublicKey(signer));
    } catch (e) {
        console.log(e.message ?? JSON.stringify(e));
        console.log('Error while claim reward');
    }
}