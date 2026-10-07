interface Props {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}

export default function PageHeader({ title, subtitle, breadcrumb }: Props) {
  return (
    <section
      className="page-header bg--cover"
      style={{ backgroundImage: "url(/assets/images/header/1.png)" }}
    >
      <div className="container">
        <div className="page-header__content" data-aos="fade-right" data-aos-duration="1000">
          <h2>{title}</h2>
          {subtitle && <p className="mb-0">{subtitle}</p>}
          {breadcrumb && (
            <nav aria-label="breadcrumb" className="mt-3">
              <ol className="breadcrumb mb-0">
                {breadcrumb.split(" / ").map((part, i, arr) => (
                  <li
                    key={`${part}-${i}`}
                    className={`breadcrumb-item${i === arr.length - 1 ? " active" : ""}`}
                    aria-current={i === arr.length - 1 ? "page" : undefined}
                  >
                    {part}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        <div className="page-header__shape">
          <span className="page-header__shape-item page-header__shape-item--1">
            <img src="/assets/images/header/2.png" alt="" />
          </span>
        </div>
      </div>
    </section>
  );
}
