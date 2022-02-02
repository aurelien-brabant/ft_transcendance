/* test page */
import { NextPageWithLayout } from './_app';
import Chat from '../components/Chat';
import withDashboardLayout from '../components/hoc/withDashboardLayout';

const ChatPage: NextPageWithLayout = () => {
  return (
    <div className="relative flex items-center h-full min-h-screen grow" id="test">
      <Chat />
    </div>
  )
};

ChatPage.getLayout = withDashboardLayout;

export default ChatPage;
