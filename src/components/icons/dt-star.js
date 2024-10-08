import { html, css, LitElement } from 'lit';

export class DtStar extends LitElement {
  static get styles() {
    return css`
      :host {
        fill: var(--star-unselected-color, #c7c6c1);
      }
      :host([selected]) {
        fill: var(--star-unselected-color, hsl(45, 100%, 51%));
      }
    `;
  }

  static get properties() {
    return {
      postID: { type: Number },
      selected: { type: Boolean, reflect: true },
    };
  }

  _onclick() {
    this.selected = !this.selected;

    const event = new CustomEvent('change', {
      detail: {
        postID: this.postID,
        favorited: this.selected,
      },
    });

    this.dispatchEvent(event);
  }

  _keyUp(e) {
    // If key pressed was enter, simulate a click
    const keycode = e.keyCode || e.which;

    if (keycode === 13) {
      // Enter
      this._onclick();
    }
  }

  render() {
    return html`
      <svg
        @click="${this._onclick}"
        @keyup="${this._keyUp}"
        tabindex="0"
        id="star"
        height="15"
        viewBox="0 0 32 32"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 31.916 12.092 C 31.706 11.417 31.131 10.937 30.451 10.873 L 21.215 9.996 L 17.564 1.077 C 17.295 0.423 16.681 0 16 0 C 15.318 0 14.706 0.423 14.435 1.079 L 10.784 9.996 L 1.546 10.873 C 0.868 10.937 0.295 11.417 0.084 12.092 C -0.126 12.769 0.068 13.51 0.581 13.978 L 7.563 20.367 L 5.503 29.83 C 5.354 30.524 5.613 31.245 6.165 31.662 C 6.462 31.886 6.811 32 7.161 32 C 7.463 32 7.764 31.915 8.032 31.747 L 16 26.778 L 23.963 31.747 C 24.546 32.113 25.281 32.08 25.834 31.662 C 26.386 31.243 26.645 30.524 26.494 29.83 L 24.436 20.367 L 31.417 13.978 C 31.931 13.51 32.127 12.769 31.916 12.092 Z M 31.916 12.092"
        />
      </svg>
    `;
  }
}

window.customElements.define('dt-star', DtStar);
