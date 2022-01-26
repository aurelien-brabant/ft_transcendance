import WildLayout from '../WildLayout';

const withWildLayout = (Component: React.FC) => {
	return () => (
		<WildLayout>
			<Component />
		</WildLayout>
	)
}

export default withWildLayout;
