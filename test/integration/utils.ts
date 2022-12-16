import { ExtendedCluster } from "@identity.com/sol-did-client";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const localnetCluster: ExtendedCluster = "localnet";
export const localnetClusterUrl = "http://localhost:8899";

export const airdrop = async (
  connection: Connection,
  account: PublicKey,
  amount = LAMPORTS_PER_SOL / 10
): Promise<void> => {
  const sigAirdrop = await connection.requestAirdrop(account, amount);
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: sigAirdrop,
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  });
};
