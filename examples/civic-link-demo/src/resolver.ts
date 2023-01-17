import { DIDResolutionResult, Resolver } from "did-resolver";
import { DidSolIdentifier, DidSolService } from "@identity.com/sol-did-client";
import { Connection } from "@solana/web3.js";

export default class DIDResolverImplementation {
  private connection: Connection;

  public resolver: Resolver;

  constructor(connection: Connection, resolver?: Resolver) {
    this.connection = connection;
    this.resolver = resolver || this.createResolver();
  }

  createResolver(): Resolver {
    return new Resolver({
      sol: async (did: string): Promise<DIDResolutionResult> => {
        const identifier = DidSolIdentifier.parse(did);
        const { connection } = this;
        const didDocument = await DidSolService.build(identifier, {
          connection,
        }).resolve();
        return { didDocument } as unknown as DIDResolutionResult;
      },
    });
  }
}
