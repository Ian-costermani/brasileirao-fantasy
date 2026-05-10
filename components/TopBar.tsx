interface Props {
  hasAlert?: boolean;
}

export default function TopBar({ hasAlert = false }: Props) {
  return (
    <div class="bf-topbar">
      <button type="button" class="bf-iconbtn" aria-label="menu">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      <div class="bf-minlogo">
        <span class="bf-minlogo__main">Brasileirão</span>
        <span class="bf-minlogo__sub">fantasy</span>
      </div>
      <button
        type="button"
        class={`bf-iconbtn ${hasAlert ? "bf-iconbtn--alert" : ""}`}
        aria-label="alertas"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
      </button>
    </div>
  );
}
