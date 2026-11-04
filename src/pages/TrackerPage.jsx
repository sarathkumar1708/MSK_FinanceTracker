import PageHeader from "../components/common/PageHeader";


function TrackerPage({ title, description, icon }) {
  return (
    <div className="page-container">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
      />

      <div className="content-card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span>+</span>
          </div>

          <h3>{title}</h3>

          <p>
            Your {title.toLowerCase()} information
            will appear here.
          </p>

          <span className="coming-soon">
            Module ready for development
          </span>
        </div>
      </div>
    </div>
  );
}

export default TrackerPage;
