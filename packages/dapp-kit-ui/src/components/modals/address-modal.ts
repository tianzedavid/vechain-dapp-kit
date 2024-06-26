import type { TemplateResult } from 'lit';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { I18n } from '../../constants';
import { defaultI18n, Font } from '../../constants';
import { buttonStyle, iconButtonStyle } from '../../assets/styles';
import type { ThemeMode } from '../../constants/theme';
import {
    friendlyAddress,
    getPicassoImage,
    useTranslate,
    subscribeToCustomEvent,
} from '../../utils';
import {
    CheckSvg,
    DarkCloseSvg,
    DarkCopySvg,
    DarkDisconnectSvg,
    LightCloseSvg,
    LightCopySvg,
    LightDisconnectSvg,
} from '../../assets/icons';
import { DAppKitUI } from '../../client';

let openWalletModalListener: () => void;
let closeWalletModalListener: () => void;
@customElement('vdk-address-modal')
export class AddressModal extends LitElement {
    static override styles = [
        buttonStyle,
        iconButtonStyle,
        css`
            .modal-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                padding: 20px;
                transition: width 5s, height 4s;
                font-family: var(--vdk-font-family, ${Font.Family});
            }

            .modal-header {
                font-family: var(--vdk-font-family, ${Font.Family});
                font-weight: var(
                    --vdk-font-weight-medium,
                    ${Font.Weight.Medium}
                );
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 20px;
            }

            .modal-body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 40px;
                transition: width 2s, height 4s;
            }

            .modal-footer {
                display: flex;
                justify-content: center;
                align-items: center;
                padding-top: 20px;
                font-family: var(--vdk-font-family, ${Font.Family});
            }

            .address-icon {
                width: 30%;
                margin-right: 4px;
                border-radius: 50%;
            }

            .disconnect-icon {
                width: 18px;
                height: 18px;
            }

            .title {
                font-family: var(--vdk-font-family, ${Font.Family});
                font-weight: var(
                    --vdk-font-weight-medium,
                    ${Font.Weight.Medium}
                );
            }

            .address {
                font-size: var(--vdk-font-size-large, ${Font.Size.Large});
                font-family: var(--vdk-font-family, ${Font.Family});
                font-weight: var(
                    --vdk-font-weight-medium,
                    ${Font.Weight.Medium}
                );
                display: flex;
                flex-direction: row;
                justify-content: center;
            }

            .copy-icon {
                cursor: pointer;
                width: 20px;
                height: 20px;
                margin-left: 10px;
            }
        `,
    ];

    @property({ type: Boolean })
    open = false;

    @property({ type: String })
    address = '';

    @property({ type: Function })
    onDisconnectClick?: () => void = undefined;

    @property()
    mode: ThemeMode = 'LIGHT';

    @property()
    i18n: I18n = defaultI18n;

    @property()
    language = 'en';

    @property()
    walletConnectQRcode?: string = undefined;

    @property()
    showCopiedIcon = false;

    constructor() {
        super();

        openWalletModalListener = subscribeToCustomEvent(
            'vdk-open-wallet-modal',
            () => {
                this.open = true;
            },
        );

        closeWalletModalListener = subscribeToCustomEvent(
            'vdk-close-wallet-modal',
            () => {
                this.open = false;
            },
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        openWalletModalListener?.();
        closeWalletModalListener?.();
    }

    @property({ type: Function })
    onClose: () => void = () => nothing;

    override render(): TemplateResult {
        const translate = useTranslate(this.i18n, this.language);
        let copyIcon = this.mode === 'LIGHT' ? LightCopySvg : DarkCopySvg;
        if (this.showCopiedIcon) {
            copyIcon = CheckSvg;
        }
        return html`
        <vdk-fonts></vdk-fonts>
        <vdk-base-modal
                .open=${this.open}
                .onClose=${this.handleClose}
                .mode=${this.mode}
        >
            <div class="modal-container">
                <div class="modal-header">
                    <div class="icon-button"></div>
                    <div class="title">${translate('connected')}</div>
                    <div
                            class="icon-button ${this.mode}"
                            @click=${this.handleClose}
                    >
                        ${this.mode === 'LIGHT' ? LightCloseSvg : DarkCloseSvg}
                    </div>
                </div>
                <div class="modal-body">
                    <img
                            class="address-icon"
                            src=${getPicassoImage(this.address)}
                    />
                    <span class="address">
                            ${friendlyAddress(this.address)}
                            <div class="copy-icon" @click=${
                                this.onCopy
                            }>${copyIcon}</div>
                        </span>

                </div>
                <div class="modal-footer">
                    <button
                            class="${this.mode}"
                            @click=${this.onDisconnectClick}
                            data-testid="Disconnect"
                    >
                        <div class="disconnect-icon ${this.mode}">
                            ${
                                this.mode === 'LIGHT'
                                    ? LightDisconnectSvg
                                    : DarkDisconnectSvg
                            }
                        </div>
                        ${translate('disconnect')}
                    </button>
                </div>
        </vdk-base-modal>
    `;
    }

    private onCopy = async (): Promise<void> => {
        await navigator.clipboard.writeText(this.address);
        this.showCopiedIcon = true;
        setTimeout(() => {
            this.showCopiedIcon = false;
        }, 1000);
    };

    private handleClose = (): void => {
        DAppKitUI.modal.close();
        this.onClose();
    };
}

declare global {
    interface HTMLElementTagNameMap {
        'vdk-address-modal': AddressModal;
    }
}
