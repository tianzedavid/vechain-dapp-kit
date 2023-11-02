import {
    newWcClient,
    newWcSigner,
    newWeb3Modal,
} from '@vechain/wallet-connect/dist';
import { createSync, createSync2 } from '@vechain/connex/esm/signer';
import type { ConnexOptions, ConnexWallet, WalletSource } from './types';
import { CertificateBasedWallet } from './wallets/certificate-wallet';
import { WCWallet } from './wallets/wc-wallet';
import { normalizeGenesisId } from './genesis';

type ICreateWallet = ConnexOptions & {
    source: WalletSource;
};

export const createWallet = ({
    source,
    genesis,
    walletConnectOptions,
    onDisconnected,
}: ICreateWallet): ConnexWallet | undefined => {
    const genesisId = normalizeGenesisId(genesis);

    switch (source) {
        case 'sync': {
            if (!window.connex) {
                throw new Error('User is not in a Sync wallet');
            }

            const signer = createSync(genesisId);

            return new CertificateBasedWallet(signer);
        }
        case 'sync2': {
            const signer = createSync2(genesisId);

            return new CertificateBasedWallet(signer);
        }
        case 'veworld-extension': {
            if (!window.vechain) {
                throw new Error('VeWorld Extension is not installed');
            }

            const signer = window.vechain.newConnexSigner(genesisId);

            return new CertificateBasedWallet(Promise.resolve(signer));
        }
        case 'wallet-connect': {
            if (!walletConnectOptions) {
                onDisconnected();
                return;
            }

            const { projectId, metadata } = walletConnectOptions;

            const wcClient = newWcClient({
                projectId,
                metadata,
            });

            const web3Modal = newWeb3Modal(projectId);

            const wallet = newWcSigner({
                genesisId,
                wcClient,
                web3Modal,
                onDisconnected,
            });

            return new WCWallet(wallet);
        }
    }
};