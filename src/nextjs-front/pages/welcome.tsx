import withDashboardLayout from "../components/hoc/withDashboardLayout";

const Welcome: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gray-900" style={{minHeight: '300vh'}} />
  );
};

export default withDashboardLayout(Welcome);
