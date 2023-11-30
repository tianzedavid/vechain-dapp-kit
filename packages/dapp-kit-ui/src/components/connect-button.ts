import type { TemplateResult } from 'lit';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Colors } from '../constants';
import type { Theme, ThemeMode } from '../constants/theme';

@customElement('vwk-connect-button')
export class ConnectButton extends LitElement {
    static override styles = css`
        button {
            cursor: pointer;
            display: block;
            border: none;
            border-radius: 12px;
            padding: 8px 12px;
            font-family: 'Inter', sans-serif;
        }

        button:hover {
            opacity: 0.9;
        }

        button:active {
            opacity: 0.8;
        }

        button.LIGHT {
            background-color: ${Colors.LightGrey};
            color: ${Colors.Dark};
        }

        button.DARK {
            background-color: ${Colors.DarkGrey};
            color: ${Colors.LightGrey};
        }
    `;

    @property()
    override title = 'Connect Wallet';

    @property()
    mode: ThemeMode = 'LIGHT';

    @property()
    theme: Theme = 'DEFAULT';

    @property({ type: Function })
    onClick? = undefined;

    override render(): TemplateResult {
        return html`
            <button class="${this.mode} ${this.theme}" @click=${this.onClick}>
                ${this.title}
            </button>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'vwk-connect-button': ConnectButton;
    }
}