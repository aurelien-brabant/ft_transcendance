import WildLayout from '../WildLayout';

const withWildLayout = (Component: React.FC) => {
	const ComponentWithWildLayout = () => (
		<WildLayout>
			<Component />
		</WildLayout>
	);

	return ComponentWithWildLayout;
}

export default withWildLayout;
