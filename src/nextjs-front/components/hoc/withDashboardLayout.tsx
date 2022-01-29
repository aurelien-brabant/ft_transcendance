import DashboardLayout from "../DashboardLayout";

const withDashboardLayout = (Component: React.FC) => {
	const Wrapped: React.FC = () => (
		<DashboardLayout>
			<Component />
		</DashboardLayout>
	);

	return Wrapped;
}

export default withDashboardLayout;
