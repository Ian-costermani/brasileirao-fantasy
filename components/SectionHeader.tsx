import { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  right?: ComponentChildren;
}

export default function SectionHeader({ children, right }: Props) {
  return (
    <div class="bf-section-header">
      <div class="bf-section-header__title-wrap">
        <span class="bf-section-header__title">{children}</span>
        <span class="bf-section-header__slash" aria-hidden="true"></span>
        <span
          class="bf-section-header__tick bf-section-header__tick--1"
          aria-hidden="true"
        >
        </span>
        <span
          class="bf-section-header__tick bf-section-header__tick--2"
          aria-hidden="true"
        >
        </span>
        <span
          class="bf-section-header__tick bf-section-header__tick--3"
          aria-hidden="true"
        >
        </span>
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}
