import DashboardLayout from '../components/DashboardLayout';

const PlaceholderPage = ({ title }) => {
  return (
    <DashboardLayout>
      <div className="placeholder-page">
        <div className="placeholder-icon">
          {title === 'Analytics' ? '📈' : title === 'Teams' ? '👥' : title === 'Documents' ? '📄' : '⚙️'}
        </div>
        <h2>{title}</h2>
        <p>This section is under development. Check back soon!</p>
      </div>
    </DashboardLayout>
  );
};

export default PlaceholderPage;
