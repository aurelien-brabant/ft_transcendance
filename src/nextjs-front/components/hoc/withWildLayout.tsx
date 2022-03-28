import { ReactElement } from 'react';
import WildLayout from '../WildLayout';

const withWildLayout = (element: ReactElement) => (
		<WildLayout>
			{element}
		</WildLayout>
	);

export default withWildLayout;
