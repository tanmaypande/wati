export default function LoadingTemplate() {
  return (
    <div className="template-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="template-loading__card" key={index}>
          <div className="template-loading__line template-loading__line--title" />
          <div className="template-loading__line template-loading__line--subtitle" />
          <div className="template-loading__line template-loading__line--body" />
          <div className="template-loading__line template-loading__line--body short" />
        </div>
      ))}
    </div>
  );
}
