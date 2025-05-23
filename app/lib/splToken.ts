import { struct, u32, u8, blob } from '@solana/buffer-layout';
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { u64 as u64Layout } from '@solana/buffer-layout-utils';

/** Base class for errors */
export abstract class TokenError extends Error {
    constructor(message?: string) {
        super(message);
    }
}
/** Thrown if the mint of a token account doesn't match the expected mint */
export class TokenInvalidMintError extends TokenError {
    name = 'TokenInvalidMintError';
}

export const bool = (property: any) => {
    const layout = u8(property);
    const { encode, decode } = encodeDecode(layout);
    const boolLayout = layout;
    // @ts-expect-error ignore type error
    boolLayout.decode = (buffer, offset) => {
        const src = decode(buffer, offset);
        return !!src;
    };
    boolLayout.encode = (bool, buffer, offset) => {
        const src = Number(bool);
        return encode(src, buffer, offset);
    };
    return boolLayout;
};

export const encodeDecode = (layout: any) => {
    const decode = layout.decode.bind(layout);
    const encode = layout.encode.bind(layout);
    return { decode, encode };
};

export const publicKey = (property: any) => {
    const layout = blob(32, property);
    const { encode, decode } = encodeDecode(layout);
    let publicKeyLayout = layout;
    // @ts-expect-error ignore type error
    publicKeyLayout.decode = (buffer, offset) => {
        const src = decode(buffer, offset);
        return new PublicKey(src);
    };
    publicKeyLayout.encode = (publicKey, buffer, offset) => {
        // @ts-expect-error ignore type error
        const src = publicKey.toBuffer();
        return encode(src, buffer, offset);
    };
    return publicKeyLayout as any;
};
export const NATIVE_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export enum AccountType {
    Uninitialized = 0,
    Mint = 1,
    Account = 2,
}

/** Token account state as stored by the program */
export enum AccountState {
    Uninitialized = 0,
    Initialized = 1,
    Frozen = 2,
}

export const ACCOUNT_TYPE_SIZE = 1;

/** Thrown if the owner of a token account is a PDA (Program Derived Address) */
export class TokenOwnerOffCurveError extends TokenError {
    constructor() {
        super("Token owner is off curve");
        this.name = 'TokenOwnerOffCurveError';
    }
}

export function getAssociatedTokenAddressSync(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): PublicKey {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new TokenOwnerOffCurveError();

    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId,
    );

    return address;
}

/** Thrown if an account is not found at the expected address */
export class TokenAccountNotFoundError extends TokenError {
    constructor() {
        super('');
        this.name = 'TokenAccountNotFoundError';
    }
}
/** Thrown if a program state account is not a valid Account */
export class TokenInvalidAccountError extends TokenError {
    constructor() {
        super('');
        this.name = 'TokenInvalidAccountError';
    }
}
/** Thrown if a program state account does not contain valid data */
export class TokenInvalidAccountDataError extends TokenError {
    constructor() {
        super('');
        this.name = 'TokenInvalidAccountDataError';
    }
}

/** Thrown if a program state account is not owned by the expected token program */
export class TokenInvalidAccountOwnerError extends TokenError {
    constructor() {
        super('');
        this.name = 'TokenInvalidAccountOwnerError';
    }
}
/** Thrown if the byte length of an program state account doesn't match the expected size */
export class TokenInvalidAccountSizeError extends TokenError {
    constructor() {
        super('');
        this.name = 'TokenInvalidAccountSizeError';
    }
}
/**
 * Unpack a token account
 *
 * @param address   Token account
 * @param info      Token account data
 * @param programId SPL Token program account
 *
 * @return Unpacked token account
 */
/** Buffer layout for de/serializing a token account */
export const AccountLayout = struct([
    publicKey('mint'),
    publicKey('owner'),
    u64Layout('amount'),
    u32('delegateOption'),
    publicKey('delegate'),
    u8('state'),
    u32('isNativeOption'),
    u64Layout('isNative'),
    u64Layout('delegatedAmount'),
    u32('closeAuthorityOption'),
    publicKey('closeAuthority'),
]);
export const ACCOUNT_SIZE = AccountLayout.span;
/** Buffer layout for de/serializing a multisig */
export const MultisigLayout = struct([
    u8('m'),
    u8('n'),
    bool('isInitialized'),
    publicKey('signer1'),
    publicKey('signer2'),
    publicKey('signer3'),
    publicKey('signer4'),
    publicKey('signer5'),
    publicKey('signer6'),
    publicKey('signer7'),
    publicKey('signer8'),
    publicKey('signer9'),
    publicKey('signer10'),
    publicKey('signer11'),
]);
/** Byte length of a multisig */
export const MULTISIG_SIZE = MultisigLayout.span;
export function unpackAccount(address: any, info: any, programId = TOKEN_PROGRAM_ID) {
    if (!info)
        throw new TokenAccountNotFoundError();
    if (!info.owner.equals(programId))
        throw new TokenInvalidAccountOwnerError();
    if (info.data.length < ACCOUNT_SIZE)
        throw new TokenInvalidAccountSizeError();
    const rawAccount = AccountLayout.decode(info.data.slice(0, ACCOUNT_SIZE)) as any;
    let tlvData = Buffer.alloc(0);
    if (info.data.length > ACCOUNT_SIZE) {
        if (info.data.length === MULTISIG_SIZE)
            throw new TokenInvalidAccountSizeError();
        if (info.data[ACCOUNT_SIZE] != AccountType.Account)
            throw new TokenInvalidAccountError();
        tlvData = info.data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE);
    }
    return {
        address,
        mint: rawAccount.mint,
        owner: rawAccount.owner,
        amount: rawAccount.amount,
        delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
        delegatedAmount: rawAccount.delegatedAmount,
        isInitialized: rawAccount.state !== AccountState.Uninitialized,
        isFrozen: rawAccount.state === AccountState.Frozen,
        isNative: !!rawAccount.isNativeOption,
        rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
        closeAuthority: rawAccount.closeAuthorityOption ? rawAccount.closeAuthority : null,
        tlvData,
    };
}

/**
 * Retrieve information about a token account
 *
 * @param connection Connection to use
 * @param address    Token account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Token account information
 */
export async function getAccount(
    connection: Connection,
    address: PublicKey,
    commitment?: Commitment,
    programId = TOKEN_PROGRAM_ID,
): Promise<{ amount: number }> {
    const info = await connection.getAccountInfo(address, commitment);
    return unpackAccount(address, info, programId) as any;
}

/** Information about a mint */
export interface Mint {
    /** Address of the mint */
    address: PublicKey;
    /**
     * Optional authority used to mint new tokens. The mint authority may only be provided during mint creation.
     * If no mint authority is present then the mint has a fixed supply and no further tokens may be minted.
     */
    mintAuthority: PublicKey | null;
    /** Total supply of tokens */
    supply: bigint;
    /** Number of base 10 digits to the right of the decimal place */
    decimals: number;
    /** Is this mint initialized */
    isInitialized: boolean;
    /** Optional authority to freeze token accounts */
    freezeAuthority: PublicKey | null;
    /** Additional data for extension */
    tlvData: Buffer;
}

/**
 * Retrieve information about a mint
 *
 * @param connection Connection to use
 * @param address    Mint account
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Mint information
 */

export async function getMint(
    connection: Connection,
    address: PublicKey,
    commitment?: Commitment,
    programId = TOKEN_PROGRAM_ID,
): Promise<Mint> {
    const info = await connection.getAccountInfo(address, commitment);
    return unpackMint(address, info, programId);
}

/** Mint as stored by the program */
export interface RawMint {
    mintAuthorityOption: 1 | 0;
    mintAuthority: PublicKey;
    supply: bigint;
    decimals: number;
    isInitialized: boolean;
    freezeAuthorityOption: 1 | 0;
    freezeAuthority: PublicKey;
}

/** Buffer layout for de/serializing a mint */
export const MintLayout = struct<RawMint>([
    u32('mintAuthorityOption'),
    publicKey('mintAuthority'),
    u64Layout('supply'),
    u8('decimals'),
    bool('isInitialized'),
    u32('freezeAuthorityOption'),
    publicKey('freezeAuthority'),
]);

/**
 * Unpack a mint
 *
 * @param address   Mint account
 * @param info      Mint account data
 * @param programId SPL Token program account
 *
 * @return Unpacked mint
 */

/** Byte length of a mint */
export const MINT_SIZE = MintLayout.span;
export function unpackMint(address: PublicKey, info: any, programId = TOKEN_PROGRAM_ID): Mint {
    if (!info) throw new TokenAccountNotFoundError();
    if (!info.owner.equals(programId)) throw new TokenInvalidAccountOwnerError();
    if (info.data.length < MINT_SIZE) throw new TokenInvalidAccountSizeError();

    const rawMint = MintLayout.decode(info.data.slice(0, MINT_SIZE));
    let tlvData = Buffer.alloc(0);
    if (info.data.length > MINT_SIZE) {
        if (info.data.length <= ACCOUNT_SIZE) throw new TokenInvalidAccountSizeError();
        if (info.data.length === MULTISIG_SIZE) throw new TokenInvalidAccountSizeError();
        if (info.data[ACCOUNT_SIZE] != AccountType.Mint) throw new TokenInvalidMintError();
        tlvData = info.data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE);
    }

    return {
        address,
        mintAuthority: rawMint.mintAuthorityOption ? rawMint.mintAuthority : null,
        supply: rawMint.supply,
        decimals: rawMint.decimals,
        isInitialized: rawMint.isInitialized,
        freezeAuthority: rawMint.freezeAuthorityOption ? rawMint.freezeAuthority : null,
        tlvData,
    };
}