import { ReactElement } from "react";
import DashboardLayout from "../DashboardLayout";

const withDashboardLayout = (page: ReactElement) => (
	<DashboardLayout>{page}</DashboardLayout>
);

export default withDashboardLayout;
