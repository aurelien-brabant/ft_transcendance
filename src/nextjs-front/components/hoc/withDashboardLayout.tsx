import { ReactElement } from "react";
import { DashboardLayout } from "../layout/dashboard-layout";

const withDashboardLayout = (page: ReactElement) => (
	<DashboardLayout>{page}</DashboardLayout>
);

export default withDashboardLayout;
