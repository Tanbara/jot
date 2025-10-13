class Container extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
width: 400px;
height: 488px;
padding: 24px;
flex-direction: column;
align-items: flex-start;
gap: 24px;
border-radius: 32px;
background: #FDFDFD;
box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.16), 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        }
      </style>
      <div>👋</div>
    `;
    }
}

customElements.define('jot-container', Container);
